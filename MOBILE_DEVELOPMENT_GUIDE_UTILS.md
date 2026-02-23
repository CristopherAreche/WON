# Missing Utility Files for Mobile Development Guide

Here are the essential utility files that were referenced in the mobile development guide but not included:

## 1. Database Connection (`backend/src/lib/db.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

## 2. Authentication Utilities (`backend/src/lib/auth.ts`)

```typescript
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Generate a random 10-digit security token
export function generateSecurityToken(): string {
  return Math.random().toString().slice(2, 12).padStart(10, '0');
}

// Hash reset token for secure storage
export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate JWT token
export function generateJwtToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// Verify JWT token
export function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Middleware to authenticate JWT tokens
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyJwtToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Generate random reset code
export function generateResetCode(length: number = 6): string {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
}

// Hash password reset code for storage
export function hashResetCode(code: string): string {
  return crypto.createHash('sha256').update(code + process.env.JWT_SECRET!).digest('hex');
}

// Validate password strength
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate secure random string
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
```

## 3. Email Service (`backend/src/lib/email.ts`)

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, email not sent');
      return false;
    }

    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'WON App'} <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetCode: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - WON App</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: #000;
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .reset-code {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #000;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏋️ WON App</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your WON App account. Use the verification code below to reset your password:</p>
          
          <div class="reset-code">
            <div class="code">${resetCode}</div>
            <p style="margin: 10px 0 0 0; color: #6c757d;">Enter this code in the app</p>
          </div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li>This code expires in 10 minutes</li>
              <li>You can only use this code once</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you're having trouble with the app, please contact our support team.</p>
          
          <p>Best regards,<br>The WON Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} WON App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    WON App - Password Reset Request
    
    Hello,
    
    We received a request to reset your password for your WON App account. 
    Use this verification code to reset your password: ${resetCode}
    
    Important:
    - This code expires in 10 minutes
    - You can only use this code once
    - If you didn't request this, please ignore this email
    
    Best regards,
    The WON Team
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Code - WON App',
    html,
    text,
  });
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  const displayName = name || 'there';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to WON App</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #000 0%, #333 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .feature {
          display: flex;
          align-items: center;
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 15px;
        }
        .cta {
          background: #000;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏋️ Welcome to WON App!</h1>
        </div>
        <div class="content">
          <h2>Hey ${displayName}! 👋</h2>
          <p>Welcome to WON App - your personal AI-powered fitness companion! We're excited to have you on board.</p>
          
          <p>Here's what you can look forward to:</p>
          
          <div class="feature">
            <span class="feature-icon">🤖</span>
            <div>
              <strong>AI-Powered Workouts</strong><br>
              Get personalized workout plans generated specifically for your goals and equipment.
            </div>
          </div>
          
          <div class="feature">
            <span class="feature-icon">📊</span>
            <div>
              <strong>Progress Tracking</strong><br>
              Monitor your fitness journey with detailed progress tracking and analytics.
            </div>
          </div>
          
          <div class="feature">
            <span class="feature-icon">🏠</span>
            <div>
              <strong>Home or Gym Ready</strong><br>
              Whether you're at home or in the gym, we've got workouts for every environment.
            </div>
          </div>
          
          <div class="feature">
            <span class="feature-icon">⚡</span>
            <div>
              <strong>Adaptive Training</strong><br>
              Plans that evolve with your progress, ensuring continuous improvement.
            </div>
          </div>
          
          <p>Ready to start your fitness journey? Open the app and complete your onboarding to get your first personalized workout plan!</p>
          
          <p>If you have any questions or need support, don't hesitate to reach out to our team.</p>
          
          <p>Let's get stronger together! 💪</p>
          
          <p>Best regards,<br>The WON Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} WON App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to WON App!
    
    Hey ${displayName}!
    
    Welcome to WON App - your personal AI-powered fitness companion! We're excited to have you on board.
    
    Here's what you can look forward to:
    
    🤖 AI-Powered Workouts
    Get personalized workout plans generated specifically for your goals and equipment.
    
    📊 Progress Tracking
    Monitor your fitness journey with detailed progress tracking and analytics.
    
    🏠 Home or Gym Ready
    Whether you're at home or in the gym, we've got workouts for every environment.
    
    ⚡ Adaptive Training
    Plans that evolve with your progress, ensuring continuous improvement.
    
    Ready to start your fitness journey? Open the app and complete your onboarding to get your first personalized workout plan!
    
    Let's get stronger together! 💪
    
    Best regards,
    The WON Team
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to WON App - Your Fitness Journey Starts Now! 🏋️',
    html,
    text,
  });
}

// Utility function to strip HTML tags for plain text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// Send workout plan generated notification
export async function sendWorkoutPlanGeneratedEmail(email: string, planDetails: {
  goal: string;
  daysPerWeek: number;
  minutesPerSession: number;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Workout Plan is Ready!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>🎉 Your Workout Plan is Ready!</h1>
        <p>Great news! Your personalized workout plan has been generated and is ready to use.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Plan Details:</h3>
          <ul>
            <li><strong>Goal:</strong> ${planDetails.goal}</li>
            <li><strong>Frequency:</strong> ${planDetails.daysPerWeek} days per week</li>
            <li><strong>Duration:</strong> ${planDetails.minutesPerSession} minutes per session</li>
          </ul>
        </div>
        
        <p>Open the WON app to start your first workout and begin your fitness journey!</p>
        
        <p>Remember to:</p>
        <ul>
          <li>Start with lighter weights if you're new to an exercise</li>
          <li>Focus on proper form over heavy weights</li>
          <li>Listen to your body and rest when needed</li>
          <li>Stay consistent with your training schedule</li>
        </ul>
        
        <p>You've got this! 💪</p>
        
        <p>Best regards,<br>The WON Team</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Your Personalized Workout Plan is Ready! 🎉',
    html,
  });
}
```

## 4. OpenRouter Client (`backend/src/lib/openrouter-client.ts`)

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseURL: string = 'https://openrouter.ai/api/v1';
  private appName: string;
  private siteUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.appName = process.env.OPENROUTER_APP_NAME || 'WON Workout Generator';
    this.siteUrl = process.env.OPENROUTER_SITE_URL || 'https://localhost:3000';

    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const {
      model = 'openai/gpt-4o-mini',
      temperature = 0.7,
      max_tokens = 3000,
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0,
    } = options;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.appName,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          top_p,
          frequency_penalty,
          presence_penalty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenRouter API response:', {
        model: data.model,
        usage: data.usage,
        choices: data.choices?.length || 0,
      });

      return data;
    } catch (error) {
      console.error('Failed to call OpenRouter API:', error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      throw error;
    }
  }

  // Helper method to test the connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.createChatCompletion([
        { role: 'user', content: 'Hello, this is a test message. Please respond with "Connection successful".' }
      ], {
        max_tokens: 50,
        temperature: 0,
      });

      return response.choices?.[0]?.message?.content?.includes('Connection successful') || false;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

// Convenience function to get a configured client
export function getOpenRouterClient(): OpenRouterClient {
  return new OpenRouterClient();
}
```

## 5. Rate Limiting Utilities (`backend/src/lib/rate-limit.ts`)

```typescript
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Create a custom store for rate limiting if needed
interface RateLimitStore {
  incr: (key: string, callback: (err: any, current: number, ttl?: number) => void) => void;
  decrement: (key: string) => void;
  resetKey: (key: string) => void;
}

// Basic in-memory store (for development - use Redis in production)
class MemoryStore implements RateLimitStore {
  private hits: Map<string, { count: number; expires: number }> = new Map();

  incr(key: string, callback: (err: any, current: number, ttl?: number) => void): void {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || entry.expires < now) {
      // First request or expired entry
      this.hits.set(key, { count: 1, expires: now + 60000 }); // 1 minute TTL
      callback(null, 1, 60);
    } else {
      // Increment existing entry
      entry.count++;
      this.hits.set(key, entry);
      const ttl = Math.round((entry.expires - now) / 1000);
      callback(null, entry.count, ttl);
    }
  }

  decrement(key: string): void {
    const entry = this.hits.get(key);
    if (entry && entry.count > 0) {
      entry.count--;
      this.hits.set(key, entry);
    }
  }

  resetKey(key: string): void {
    this.hits.delete(key);
  }
}

// General rate limiter
export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: options.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: options.standardHeaders ?? true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: options.legacyHeaders ?? false, // Disable the `X-RateLimit-*` headers
    store: new MemoryStore(), // Use in-memory store for development
  });
};

// Strict rate limiter for authentication
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

// Password reset rate limiter
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
});

// AI generation rate limiter
export const aiGenerationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 AI generations per hour
  message: 'Too many AI generation requests, please try again later.',
});

// API rate limiter
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests, please try again later.',
});

// Create a custom rate limiter that considers user ID
export const createUserRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  const limiter = createRateLimit(options);
  
  return (req: Request, res: Response, next: any) => {
    // Use user ID if authenticated, otherwise fall back to IP
    const key = req.user?.userId || req.ip;
    req.ip = key; // Override IP for rate limiting
    return limiter(req, res, next);
  };
};
```

## 6. TypeScript Type Definitions (`backend/src/types/index.ts`)

```typescript
import { Request } from 'express';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export interface UserPayload {
  userId: string;
  email: string;
}

export interface OnboardingData {
  goal: 'fat_loss' | 'hypertrophy' | 'strength' | 'returning' | 'general_health';
  experience: 'beginner' | 'three_to_twelve_months' | 'one_to_three_years' | 'three_years_plus';
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Array<'bodyweight' | 'bands' | 'dumbbells' | 'barbell' | 'machines'>;
  injuries?: string;
  location: Array<'home' | 'gym'>;
  currentWeight: number;
  height: number;
  age: number;
}

export interface Exercise {
  name: string;
  equipment: 'bodyweight' | 'bands' | 'dumbbells' | 'barbell' | 'machines';
  sets: number;
  reps: number[];
  notes?: string;
  reference?: string;
  similarExercises?: Array<{
    name: string;
    equipment: 'bodyweight' | 'bands' | 'dumbbells' | 'barbell' | 'machines';
    notes?: string;
    reference?: string;
  }>;
}

export interface WorkoutSession {
  dayOfWeek: number;
  title: string;
  estMinutes: number;
  items: Exercise[];
}

export interface GeneratedWorkoutPlan {
  description: string;
  split: string;
  sessions: WorkoutSession[];
  constraints: {
    minutesPerSession: number;
    injuryNotes?: string;
  };
  meta: {
    goal: string;
    experience: string;
    location: string;
    equipment: string[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

## Additional Required Files

### 7. Backend Package.json Scripts (`backend/package.json`)

```json
{
  "name": "won-mobile-backend",
  "version": "1.0.0",
  "description": "Backend API for WON Mobile App",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "express-rate-limit": "^7.1.5",
    "resend": "^3.2.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0",
    "@typescript-eslint/parser": "^6.16.0",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11"
  }
}
```

### 8. TypeScript Configuration (`backend/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### 9. Nodemon Configuration (`backend/nodemon.json`)

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/index.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

These utility files provide all the missing implementations referenced in the mobile development guide. Make sure to install all the required dependencies and configure your environment variables properly.