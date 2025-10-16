# OpenRouter.ai Integration Guide for WON Project

## Project Analysis Summary

### Current Implementation
- **AI Service**: Uses OpenAI GPT-4o-mini directly via `src/lib/ai-workout-generator.ts`
- **Data Flow**: Onboarding → Save preferences → Generate AI plan → Display on home page
- **Fallback System**: Deterministic workout generation when AI fails
- **Data Structure**: Well-defined interfaces for UserProfile, WorkoutPlan, and Exercise objects

### Current JSON Flow
```
Onboarding Form → /api/onboarding → /api/ai/generate-plan → Database → Home Page Display
```

## Step-by-Step OpenRouter.ai Integration

### Step 1: Install Dependencies and Setup Environment

```bash
# No new dependencies needed - OpenRouter is OpenAI compatible
# Just update environment variables
```

**Environment Variables** (`.env.local`):
```env
# Replace or add alongside existing OpenAI key
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_APP_NAME=WON Workout Generator
OPENROUTER_SITE_URL=https://your-domain.com
```

### Step 2: Create OpenRouter Client Service

**File**: `src/lib/openrouter-client.ts`

```typescript
export interface OpenRouterConfig {
  apiKey: string;
  appName?: string;
  siteUrl?: string;
  model?: string;
}

export class OpenRouterClient {
  private config: OpenRouterConfig;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(config: OpenRouterConfig) {
    this.config = {
      model: 'openai/gpt-4o-mini', // Default model
      ...config
    };
  }

  async createChatCompletion(messages: Array<{role: string; content: string}>, options?: {
    temperature?: number;
    max_tokens?: number;
    model?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.config.siteUrl || '',
        'X-Title': this.config.appName || 'WON',
      },
      body: JSON.stringify({
        model: options?.model || this.config.model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    return response.json();
  }
}
```

### Step 3: Update AI Workout Generator

**File**: `src/lib/ai-workout-generator.ts`

**Replace the OpenAI import and class:**

```typescript
import { OpenRouterClient } from './openrouter-client';

export class AIWorkoutGenerator {
  private openrouter: OpenRouterClient | null = null;

  constructor() {
    if (process.env.OPENROUTER_API_KEY) {
      try {
        this.openrouter = new OpenRouterClient({
          apiKey: process.env.OPENROUTER_API_KEY,
          appName: process.env.OPENROUTER_APP_NAME,
          siteUrl: process.env.OPENROUTER_SITE_URL,
          model: 'openai/gpt-4o-mini', // or any preferred model
        });
      } catch (error) {
        console.warn('OpenRouter not available. Using fallback generation.');
      }
    }
  }

  async generateWorkoutPlan(userProfile: UserProfile): Promise<GeneratedWorkoutPlan> {
    try {
      if (this.openrouter) {
        return await this.generateWithOpenRouter(userProfile);
      } else {
        return this.generateFallbackPlan(userProfile);
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      return this.generateFallbackPlan(userProfile);
    }
  }

  private async generateWithOpenRouter(userProfile: UserProfile): Promise<GeneratedWorkoutPlan> {
    if (!this.openrouter) {
      throw new Error('OpenRouter not initialized');
    }
    
    const prompt = this.createWorkoutPrompt(userProfile);

    const completion = await this.openrouter.createChatCompletion([
      {
        role: "system",
        content: `You are an expert fitness trainer with 15+ years of experience. Create personalized workout plans based on user profiles. Always respond with valid JSON format matching the specified structure. Consider safety, progression, and effectiveness.`
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.7,
      max_tokens: 2000,
      model: 'openai/gpt-4o-mini' // Can be made configurable
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenRouter');
    }

    try {
      return JSON.parse(response);
    } catch (parseError) {
      throw new Error('Invalid JSON response from OpenRouter');
    }
  }

  // Keep existing createWorkoutPrompt and generateFallbackPlan methods unchanged
}
```

### Step 4: Model Selection Configuration

**File**: `src/lib/ai-models.ts`

```typescript
export const AVAILABLE_MODELS = {
  // OpenAI Models
  'openai/gpt-4o': { name: 'GPT-4o', provider: 'OpenAI', cost: 'High' },
  'openai/gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'OpenAI', cost: 'Low' },
  
  // Anthropic Models
  'anthropic/claude-3.5-sonnet': { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', cost: 'Medium' },
  'anthropic/claude-3-haiku': { name: 'Claude 3 Haiku', provider: 'Anthropic', cost: 'Low' },
  
  // Meta Models
  'meta-llama/llama-3.2-70b-instruct': { name: 'Llama 3.2 70B', provider: 'Meta', cost: 'Medium' },
  
  // Google Models
  'google/gemini-pro-1.5': { name: 'Gemini Pro 1.5', provider: 'Google', cost: 'Medium' },
} as const;

export type ModelId = keyof typeof AVAILABLE_MODELS;

export const DEFAULT_MODEL: ModelId = 'openai/gpt-4o-mini';
```

### Step 5: Enhanced API Route with Model Selection

**Update**: `src/app/api/ai/generate-plan/route.ts`

```typescript
export async function POST(req: Request) {
  try {
    const { userId, model } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "MISSING_USER" }, { status: 400 });
    }

    const ob = await prisma.onboardingAnswers.findUnique({ where: { userId } });
    if (!ob) {
      return NextResponse.json(
        { error: "ONBOARDING_REQUIRED" },
        { status: 400 }
      );
    }

    // Use specific model if provided
    const selectedModel = model || 'openai/gpt-4o-mini';
    
    // Generate AI-powered workout plan with selected model
    const userProfile = {
      goal: ob.goal,
      experience: ob.experience,
      daysPerWeek: ob.daysPerWeek,
      minutesPerSession: ob.minutesPerSession,
      equipment: ob.equipment as Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">,
      injuries: ob.injuries || undefined,
      location: ob.location,
    };

    // Update AI generator to accept model parameter
    const plan = await aiWorkoutGenerator.generateWorkoutPlan(userProfile, selectedModel);

    const saved = await prisma.workoutPlan.create({
      data: {
        userId,
        summary: plan.summary as Prisma.InputJsonValue,
        weeks: plan.weeks,
        schedule: plan.schedule as Prisma.InputJsonValue,
        days: plan.days as unknown as Prisma.InputJsonValue,
        onboarding: userProfile as Prisma.InputJsonValue,
        source: "ai",
        model: selectedModel, // Track which model was used
      },
    });

    return NextResponse.json({ 
      ok: true, 
      planId: saved.id,
      model: selectedModel 
    });
  } catch (e) {
    // Existing fallback logic remains the same
  }
}
```

### Step 6: Update Database Schema (Optional)

**Add to**: `prisma/schema.prisma`

```prisma
model WorkoutPlan {
  id         String     @id @default(cuid())
  userId     String
  user       User       @relation(fields: [userId], references: [id])
  summary    Json
  weeks      Int
  schedule   Json
  days       Json
  onboarding Json?
  source     PlanSource
  model      String?    // Track which AI model was used
  createdAt  DateTime   @default(now())

  @@index([userId])
}
```

### Step 7: Enhanced Onboarding with Model Selection (Optional)

**Update**: `src/app/onboarding/_client.tsx`

Add model selection to the form:

```typescript
// Add to OnboardingSchema
const OnboardingSchema = z.object({
  // ... existing fields
  preferredModel: z.enum([
    "openai/gpt-4o-mini",
    "anthropic/claude-3-haiku", 
    "meta-llama/llama-3.2-70b-instruct"
  ]).optional(),
});

// In the form submission
const ai = await fetch("/api/ai/generate-plan", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    userId,
    model: values.preferredModel || 'openai/gpt-4o-mini'
  }),
});
```

### Step 8: Environment Configuration

**File**: `.env.example`

```env
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_APP_NAME=WON Workout Generator
OPENROUTER_SITE_URL=https://your-domain.com

# Legacy OpenAI (can be removed after migration)
# OPENAI_API_KEY=your_openai_key
```

### Step 9: Error Handling and Monitoring

**File**: `src/lib/ai-error-handler.ts`

```typescript
export class AIErrorHandler {
  static handleOpenRouterError(error: any) {
    if (error.status === 429) {
      return 'Rate limit exceeded. Please try again later.';
    }
    if (error.status === 401) {
      return 'Invalid API key. Please check configuration.';
    }
    if (error.status >= 500) {
      return 'OpenRouter service unavailable. Using fallback generation.';
    }
    return 'AI generation failed. Using fallback generation.';
  }
}
```

### Step 10: Testing and Validation

**File**: `src/lib/__tests__/openrouter-integration.test.ts`

```typescript
import { OpenRouterClient } from '../openrouter-client';

describe('OpenRouter Integration', () => {
  test('should generate workout plan with valid input', async () => {
    const client = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY!,
    });

    const userProfile = {
      goal: 'fat_loss',
      experience: 'beginner',
      daysPerWeek: 3,
      minutesPerSession: 45,
      equipment: ['bodyweight'],
      location: 'home'
    };

    const result = await client.generateWorkoutPlan(userProfile);
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('days');
    expect(result.days).toBeInstanceOf(Array);
  });
});
```

## Migration Strategy

### Phase 1: Side-by-Side Testing
1. Keep existing OpenAI implementation
2. Add OpenRouter as alternative
3. Use feature flag to switch between services

### Phase 2: Gradual Migration
1. Route 10% of requests to OpenRouter
2. Monitor performance and quality
3. Gradually increase percentage

### Phase 3: Full Migration
1. Make OpenRouter the primary service
2. Keep OpenAI as fallback
3. Remove OpenAI dependency after validation

## Benefits of OpenRouter Integration

1. **Model Diversity**: Access to 400+ models from multiple providers
2. **Cost Optimization**: Automatic routing to cost-effective models
3. **Reliability**: Built-in fallbacks between providers
4. **Flexibility**: Easy model switching without code changes
5. **Performance**: Optimized routing for speed and availability

## Testing Checklist

- [ ] API key authentication works
- [ ] Workout generation produces valid JSON
- [ ] Fallback system activates on API failures
- [ ] Multiple models can be selected
- [ ] Error handling works correctly
- [ ] Database integration saves plans properly
- [ ] Home page displays generated workouts
- [ ] Performance meets requirements

## Expected JSON Structure

The integration maintains the same JSON structure as the current implementation:

```json
{
  "summary": {
    "daysPerWeek": 3,
    "minutes": 45,
    "goal": "fat_loss"
  },
  "weeks": 4,
  "schedule": ["mon", "wed", "fri"],
  "days": [
    {
      "id": "day1",
      "title": "Full Body Strength",
      "focus": "Compound movements",
      "estimatedDuration": 45,
      "blocks": [
        {
          "exerciseId": "ex_goblet_squat",
          "name": "Goblet Squats",
          "sets": 3,
          "reps": "8-12",
          "rest": "60s",
          "notes": "Control the descent"
        }
      ]
    }
  ]
}
```

This integration maintains backward compatibility while adding the flexibility and power of OpenRouter's multi-model API.