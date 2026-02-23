# WON Mobile Development Guide
## Building a Complete Mobile Replica with React Native & Expo

This comprehensive guide provides step-by-step instructions to recreate the WON (Workout Optimization Network) application as a fullstack mobile app using React Native, Expo, and Node.js.

## 🎯 Project Overview

**WON** is an AI-powered workout planning application that generates personalized fitness routines based on user preferences, goals, and available equipment. The app features:

- **User Authentication & Account Management**
- **AI-Powered Workout Generation** (OpenRouter/OpenAI integration)
- **Personalized Onboarding System**
- **Workout Plan Management**
- **Progress Tracking**
- **Email Notifications & Password Reset**
- **Security Features & Rate Limiting**

## 📋 Prerequisites

Before starting, ensure you have:

```bash
# Required software
- Node.js 18+ and npm
- Git
- Expo CLI: npm install -g @expo/cli
- EAS CLI: npm install -g @expo/eas-cli
- PostgreSQL database
- Code editor (VS Code recommended)

# Mobile development setup
- iOS: Xcode (macOS only) + iOS Simulator
- Android: Android Studio + Android Emulator
- Physical devices for testing (recommended)
```

## 🚀 Technology Stack

### Frontend (Mobile)
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and build service
- **Expo Router** - File-based navigation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Query** - Data fetching and caching
- **AsyncStorage** - Local data persistence
- **Expo SecureStore** - Secure token storage

### Backend (API)
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Zod** - Request validation
- **Node-cron** - Scheduled tasks

### AI & External Services
- **OpenRouter API** - AI workout generation
- **Resend** - Email service
- **Expo Notifications** - Push notifications

### Development & Deployment
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **EAS Build** - App compilation
- **EAS Submit** - App store deployment

## 📁 Project Structure

```
won-mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── home.tsx
│   │   ├── workouts.tsx
│   │   ├── progress.tsx
│   │   └── profile.tsx
│   ├── onboarding/               # User onboarding flow
│   │   └── index.tsx
│   ├── workout/                  # Workout details
│   │   └── [id].tsx
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   ├── forms/                    # Form components
│   └── workout/                  # Workout-specific components
├── lib/                          # Utilities and services
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Authentication logic
│   ├── storage.ts                # Local storage utilities
│   └── validation.ts             # Zod schemas
├── types/                        # TypeScript type definitions
├── constants/                    # App constants
├── hooks/                        # Custom React hooks
├── store/                        # State management
├── backend/                      # Node.js API server
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Express middleware
│   │   ├── lib/                  # Utilities
│   │   ├── types/                # TypeScript types
│   │   └── index.ts              # Server entry point
│   ├── prisma/                   # Database schema
│   └── package.json
├── app.json                      # Expo configuration
├── package.json
└── README.md
```

## 🛠️ Step-by-Step Implementation

### Phase 1: Project Setup

#### 1.1 Initialize Expo Project

```bash
# Create new Expo project with TypeScript
npx create-expo-app won-mobile --template tabs

cd won-mobile

# Install required dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install @react-hook-form/resolvers react-hook-form
npm install @tanstack/react-query
npm install zod
npm install expo-secure-store expo-constants
npm install expo-router expo-status-bar
npm install @expo/vector-icons
npm install react-native-reanimated
npm install expo-image-picker expo-camera
npm install @react-native-async-storage/async-storage

# Development dependencies
npm install -D @types/react @types/react-native
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier
```

#### 1.2 Configure Expo Router

Update `app.json`:

```json
{
  "expo": {
    "name": "WON - Workout Planner",
    "slug": "won-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourcompany.won"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.yourcompany.won"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "won",
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-image-picker",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera"
        }
      ]
    ]
  }
}
```

#### 1.3 Setup Backend API Server

```bash
# Create backend directory
mkdir backend && cd backend

# Initialize Node.js project
npm init -y

# Install backend dependencies
npm install express cors helmet morgan
npm install prisma @prisma/client
npm install bcrypt jsonwebtoken
npm install zod express-rate-limit
npm install resend
npm install dotenv

# Development dependencies
npm install -D @types/node @types/express @types/bcrypt @types/jsonwebtoken
npm install -D typescript ts-node nodemon
npm install -D prisma

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

### Phase 2: Database Schema & Models

#### 2.1 Prisma Schema

Create `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Goal {
  fat_loss
  hypertrophy
  strength
  returning
  general_health
}

enum Experience {
  beginner
  three_to_twelve_months
  one_to_three_years
  three_years_plus
}

enum Location {
  home
  gym
}

enum Equipment {
  bodyweight
  bands
  dumbbells
  barbell
  machines
}

enum PlanSource {
  ai
  fallback
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  securityToken String? @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  onboarding         OnboardingAnswers?
  plans              WorkoutPlan[]
  passwordResetTokens PasswordResetToken[]
}

model OnboardingAnswers {
  userId            String      @id
  user              User        @relation(fields: [userId], references: [id])
  goal              Goal
  experience        Experience
  daysPerWeek       Int
  minutesPerSession Int
  equipment         Equipment[]
  injuries          String?
  location          Location
  currentWeight     Float       @default(150.0)
  height            Float       @default(5.5)
  age               Int         @default(25)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model WorkoutPlan {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id])
  summary   Json
  weeks     Int
  schedule  Json
  days      Json
  onboarding Json?
  source    PlanSource
  model     String?
  createdAt DateTime   @default(now())

  @@index([userId])
}

model PasswordResetToken {
  id           String    @id @default(cuid())
  userId       String
  hashedToken  String    @unique
  code         String    @db.VarChar(6)
  expiresAt    DateTime
  consumedAt   DateTime?
  attempts     Int       @default(0)
  ip           String?
  userAgent    String?
  createdAt    DateTime  @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@index([hashedToken])
  @@index([code, userId])
}
```

#### 2.2 Environment Variables

Create `backend/.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/won_mobile"
DIRECT_URL="postgresql://username:password@localhost:5432/won_mobile"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Password Reset Configuration
RESET_TOKEN_TTL_MINUTES=10
RESET_CODE_LENGTH=6
RESET_MAX_ATTEMPTS=5
RESET_LOCKOUT_MINUTES=15
RESET_RATE_LIMIT_PER_EMAIL_PER_HOUR=5
RESET_RATE_LIMIT_PER_IP_PER_HOUR=20

# Email Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="WON App"

# AI Configuration (OpenRouter)
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_APP_NAME="WON Workout Generator"
OPENROUTER_SITE_URL="https://your-app.com"

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Phase 3: Backend API Implementation

#### 3.1 Express Server Setup

Create `backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import workoutRoutes from './routes/workout';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app.com'] 
    : ['http://localhost:8081', 'exp://localhost:8081'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

#### 3.2 Authentication Routes

Create `backend/src/routes/auth.ts`:

```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { generateSecurityToken, hashResetToken } from '../lib/auth';
import { sendPasswordResetEmail } from '../lib/email';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  code: z.string().length(6),
  newPassword: z.string().min(6),
  email: z.string().email()
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { onboarding: true }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasOnboarding: !!user.onboarding
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasOnboarding: false
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If an account exists, a reset code will be sent' });
    }

    // Generate reset code and token
    const code = Math.random().toString().slice(2, 8);
    const hashedToken = hashResetToken(code);

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        hashedToken,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Send email
    await sendPasswordResetEmail(email, code);

    res.json({ message: 'If an account exists, a reset code will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { code, newPassword, email } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: { gt: new Date() },
        consumedAt: null,
        attempts: { lt: 5 }
      }
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as consumed
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { consumedAt: new Date() }
      })
    ]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

export default router;
```

#### 3.3 AI Workout Generation Service

Create `backend/src/lib/ai-workout-generator.ts`:

```typescript
import { OpenRouterClient } from './openrouter-client';

interface UserProfile {
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

interface Exercise {
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

interface WorkoutSession {
  dayOfWeek: number;
  title: string;
  estMinutes: number;
  items: Exercise[];
}

interface GeneratedWorkoutPlan {
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

export class AIWorkoutGenerator {
  private openrouter: OpenRouterClient | null = null;

  constructor() {
    try {
      this.openrouter = new OpenRouterClient();
    } catch (error) {
      console.warn('OpenRouter not available. Using fallback generation:', error);
      this.openrouter = null;
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
        role: 'system',
        content: 'You are an expert personal trainer with 15+ years of experience. Create personalized workout plans that are safe and effective. Always respond with valid JSON that exactly matches the specified structure.'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.7,
      max_tokens: 3000,
      model: 'openai/gpt-4o-mini'
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenRouter');
    }

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Invalid JSON response from OpenRouter');
    }
  }

  private createWorkoutPrompt(userProfile: UserProfile): string {
    // Implementation similar to the original but adapted for mobile
    // ... (prompt creation logic)
  }

  private generateFallbackPlan(userProfile: UserProfile): GeneratedWorkoutPlan {
    // Fallback workout generation logic
    // ... (fallback implementation)
  }
}

export const aiWorkoutGenerator = new AIWorkoutGenerator();
```

### Phase 4: Mobile App Implementation

#### 4.1 Authentication Hook

Create `hooks/useAuth.ts`:

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  hasOnboarding: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored authentication on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiClient.setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      await SecureStore.setItemAsync('auth_token', newToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      apiClient.setAuthToken(newToken);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const response = await apiClient.post('/auth/signup', { email, password, name });
      const { token: newToken, user: userData } = response.data;

      await SecureStore.setItemAsync('auth_token', newToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      apiClient.setAuthToken(newToken);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await AsyncStorage.removeItem('user_data');

      setToken(null);
      setUser(null);
      apiClient.setAuthToken(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const refreshUser = async () => {
    try {
      if (!token) return;

      const response = await apiClient.get('/user/me');
      const userData = response.data;

      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

#### 4.2 API Client

Create `lib/api.ts`:

```typescript
import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api'
  : 'https://your-production-api.com/api';

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

#### 4.3 Main App Layout

Create `app/_layout.tsx`:

```typescript
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading } = useAuth();

  const [loaded] = useFonts({
    // Add custom fonts if needed
  });

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="workout/[id]" options={{ title: 'Workout Details' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

#### 4.4 Login Screen

Create `app/(auth)/login.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#888',
  },
});
```

#### 4.5 Onboarding Screen

Create `app/onboarding/index.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../lib/api';

// Form validation schema
const onboardingSchema = z.object({
  goal: z.enum(['fat_loss', 'hypertrophy', 'strength', 'returning', 'general_health']),
  experience: z.enum(['beginner', 'three_to_twelve_months', 'one_to_three_years', 'three_years_plus']),
  daysPerWeek: z.number().min(1).max(7),
  minutesPerSession: z.number().min(30).max(180),
  equipment: z.array(z.enum(['bodyweight', 'bands', 'dumbbells', 'barbell', 'machines'])).min(1),
  location: z.array(z.enum(['home', 'gym'])).min(1),
  currentWeight: z.number().min(1).max(1400),
  height: z.number().min(2.0).max(9.917),
  age: z.number().min(15).max(100),
  injuries: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      goal: 'general_health',
      experience: 'beginner',
      daysPerWeek: 3,
      minutesPerSession: 60,
      equipment: ['bodyweight'],
      location: ['home'],
      currentWeight: 150,
      height: 5.5,
      age: 25,
      injuries: '',
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      setLoadingStage('Saving your preferences...');

      // Save onboarding data
      await apiClient.post('/user/onboarding', {
        userId: user.id,
        ...data,
      });

      setLoadingStage('Generating your personalized workout...');

      // Generate AI workout plan
      await apiClient.post('/ai/generate-plan', {
        userId: user.id,
      });

      setLoadingStage('Preparing your workout plan...');

      // Refresh user data
      await refreshUser();

      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to WON</Text>
          <Text style={styles.subtitle}>Let's create your perfect workout plan</Text>
        </View>

        {/* Goal Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your main goal?</Text>
          <Controller
            control={control}
            name="goal"
            render={({ field: { onChange, value } }) => (
              <View style={styles.optionsContainer}>
                {[
                  { value: 'fat_loss', label: 'Fat Loss', icon: '🔥' },
                  { value: 'hypertrophy', label: 'Muscle Growth', icon: '💪' },
                  { value: 'strength', label: 'Build Strength', icon: '🏋️' },
                  { value: 'returning', label: 'Get Back in Shape', icon: '🔄' },
                  { value: 'general_health', label: 'General Health', icon: '❤️' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      value === option.value && styles.optionSelected,
                    ]}
                    onPress={() => onChange(option.value)}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      value === option.value && styles.optionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Continue with other form sections... */}
        {/* Experience, Equipment, Location, etc. */}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? loadingStage || 'Processing...' : 'Generate My Workout Plan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#fff',
    backgroundColor: '#2a2a2a',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
```

### Phase 5: Deployment & Testing

#### 5.1 Backend Deployment

```bash
# Build the backend
npm run build

# Deploy to your preferred platform:
# - Railway: railway deploy
# - Heroku: git push heroku main
# - DigitalOcean: Use App Platform
# - AWS: Use Elastic Beanstalk or ECS
```

#### 5.2 Mobile App Build

```bash
# Configure EAS
eas build:configure

# Build for development
eas build --platform ios --profile development
eas build --platform android --profile development

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

#### 5.3 Environment Configuration

Create `app.config.js` for dynamic configuration:

```javascript
export default {
  expo: {
    name: "WON - Workout Planner",
    slug: "won-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.yourcompany.won"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.yourcompany.won"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api",
      openRouterApiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
    },
  },
};
```

## 🧪 Testing Strategy

### Unit Testing
```bash
# Install testing dependencies
npm install -D jest @testing-library/react-native @testing-library/jest-native

# Run tests
npm test
```

### Integration Testing
```bash
# Install Detox for E2E testing
npm install -D detox

# Configure and run E2E tests
detox test
```

### Performance Testing
- Use Flipper for debugging
- Monitor memory usage and performance
- Test on various device configurations

## 📱 Key Features Implementation Checklist

### Authentication System
- [ ] User registration with email validation
- [ ] Secure login with JWT tokens
- [ ] Password reset with email verification
- [ ] Biometric authentication (Face ID/Fingerprint)
- [ ] Account deletion and data privacy

### Onboarding Flow
- [ ] Goal selection (fat loss, muscle building, etc.)
- [ ] Experience level assessment
- [ ] Equipment availability selection
- [ ] Physical metrics input (weight, height, age)
- [ ] Injury and limitation tracking
- [ ] Training frequency preferences

### AI Workout Generation
- [ ] OpenRouter/OpenAI integration
- [ ] Personalized workout plan creation
- [ ] Fallback workout generation
- [ ] Exercise video references
- [ ] Alternative exercise suggestions
- [ ] Progressive overload planning

### Workout Management
- [ ] Workout plan display and organization
- [ ] Exercise execution tracking
- [ ] Progress recording and history
- [ ] Workout modifications and substitutions
- [ ] Timer and rest period management

### User Experience
- [ ] Intuitive navigation with bottom tabs
- [ ] Dark mode support
- [ ] Offline functionality
- [ ] Push notifications for workouts
- [ ] Data synchronization
- [ ] Export and sharing capabilities

### Performance & Security
- [ ] Secure token storage
- [ ] API rate limiting
- [ ] Data encryption
- [ ] Error handling and recovery
- [ ] Performance optimization
- [ ] Crash reporting and analytics

## 🔐 Security Considerations

### Data Protection
- Store sensitive data in Expo SecureStore
- Implement certificate pinning for API calls
- Use HTTPS for all network communication
- Encrypt local database if needed

### Authentication Security
- Implement JWT token refresh mechanism
- Add biometric authentication
- Use secure password policies
- Implement account lockout after failed attempts

### API Security
- Rate limiting on all endpoints
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection with proper sanitization

## 📈 Performance Optimization

### Mobile App
- Implement lazy loading for screens
- Use FlatList for large data sets
- Optimize images with expo-image
- Implement proper caching strategies
- Use React.memo for expensive components

### Backend API
- Database query optimization
- Response caching with Redis
- Image compression and CDN usage
- Background job processing
- Database connection pooling

## 🚀 Deployment Pipeline

### Development Environment
```bash
# Start backend server
cd backend && npm run dev

# Start Expo development server
cd .. && npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Production Deployment
1. **Backend**: Deploy to Railway, Heroku, or AWS
2. **Database**: Use managed PostgreSQL (Supabase, AWS RDS)
3. **Mobile App**: Build with EAS and deploy to app stores
4. **Monitoring**: Set up error tracking (Sentry, Bugsnag)
5. **Analytics**: Implement usage analytics (Amplitude, Mixpanel)

## 📞 Support & Maintenance

### Error Monitoring
- Implement crash reporting
- Set up performance monitoring
- Create health check endpoints
- Monitor API response times

### User Feedback
- In-app feedback system
- App store review monitoring
- User analytics and behavior tracking
- A/B testing for feature improvements

### Updates & Maintenance
- Regular security updates
- Feature rollouts with feature flags
- Database migration strategies
- Backward compatibility planning

---

## 🎉 Conclusion

This guide provides a comprehensive roadmap for recreating the WON application as a mobile app using React Native and Expo. The architecture ensures scalability, security, and maintainability while providing an excellent user experience.

Key success factors:
- **Modular Architecture**: Clean separation of concerns
- **Security First**: Proper authentication and data protection
- **User Experience**: Intuitive interface and smooth performance
- **AI Integration**: Seamless workout generation and personalization
- **Scalability**: Built to handle growing user base

Start with the core authentication and onboarding flow, then gradually add features like workout generation, progress tracking, and advanced personalization. Remember to test thoroughly on various devices and network conditions before deploying to production.

**Happy coding! 💪**