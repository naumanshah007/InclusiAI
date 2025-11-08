# InclusiAid Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Core Systems](#core-systems)
5. [Data Flow](#data-flow)
6. [API Architecture](#api-architecture)
7. [State Management](#state-management)
8. [AI Provider System](#ai-provider-system)
9. [Accessibility Architecture](#accessibility-architecture)
10. [PWA Architecture](#pwa-architecture)
11. [Electron Desktop Architecture](#electron-desktop-architecture)
12. [Security & Privacy](#security--privacy)
13. [Deployment Architecture](#deployment-architecture)
14. [Configuration Management](#configuration-management)
15. [Future Architecture Considerations](#future-architecture-considerations)

---

## System Overview

**InclusiAid** is a universal accessibility assistant application built as a Next.js web application with Electron desktop support. It provides AI-powered assistance for people with various disabilities including visual, hearing, motor, cognitive, and speech impairments.

### Key Characteristics

- **Multi-Profile System**: Supports 9 different user profiles (visual, hearing, motor, cognitive, speech, elderly, multiple, admin, general)
- **AI-Powered**: Integrates with multiple AI providers (Gemini, OpenAI, Claude) for various capabilities
- **Progressive Web App**: Installable PWA with offline support
- **Desktop Application**: Electron-based macOS application
- **Accessibility-First**: WCAG 2.1 AA compliant with comprehensive accessibility features
- **Privacy-First**: Local storage, opt-in features, minimal data collection

### Application Type

- **Web Application**: Next.js 16.1 with App Router
- **Desktop Application**: Electron 39.1.1 for macOS
- **Progressive Web App**: Installable with service worker

---

## Technology Stack

### Frontend Framework

- **Next.js 16.1** (App Router)
- **React 19.0** with TypeScript 5
- **Tailwind CSS 4** for styling
- **shadcn/ui** components (Radix UI primitives)

### State Management

- **Zustand 5.0.8** for client-side state (15+ stores)
- **TanStack Query 5.90.7** for server state and caching

### AI Integration

- **Google Gemini API** (primary, free tier)
  - `gemini-2.5-flash` for vision tasks
  - `gemini-pro` for text tasks
- **OpenAI API** (premium tier, planned)
- **Claude API** (premium tier, planned)

### Desktop Application

- **Electron 39.1.1** for desktop app
- **electron-builder** for packaging

### Additional Libraries

- **NextAuth 4.24.13** for authentication (planned)
- **Framer Motion 12.23.24** for animations
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT tokens

---

## Application Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│   Presentation Layer (Components)           │
│   - Feature Components                       │
│   - UI Components                            │
│   - Layout Components                        │
├─────────────────────────────────────────────┤
│   Business Logic Layer (lib/)                │
│   - AI Provider Layer                        │
│   - Utility Functions                        │
│   - Feature Logic                            │
├─────────────────────────────────────────────┤
│   State Management Layer (Stores)           │
│   - Zustand Stores                           │
│   - React Query Cache                        │
├─────────────────────────────────────────────┤
│   API Layer (Next.js API Routes)            │
│   - /api/ai                                  │
│   - /api/upload                              │
│   - /api/user                                │
├─────────────────────────────────────────────┤
│   AI Provider Layer (lib/ai/)                │
│   - Gemini Provider                          │
│   - OpenAI Provider (stub)                   │
│   - Claude Provider (stub)                   │
└─────────────────────────────────────────────┘
```

### Directory Structure

```
accessi-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (onboarding)/             # Profile selection
│   │   └── profile-selection/
│   ├── (dashboard)/              # Main application routes
│   │   ├── vision/               # Vision assistance
│   │   ├── hearing/              # Hearing assistance
│   │   ├── motor/                # Motor assistance
│   │   ├── cognitive/            # Cognitive assistance
│   │   ├── speech/               # Speech assistance
│   │   ├── emergency/            # Emergency features
│   │   ├── voice-assistant/      # Voice-first interface
│   │   ├── admin/                # Admin dashboard
│   │   ├── settings/             # User settings
│   │   └── dashboard/            # Main dashboard
│   └── api/                      # API routes
│       ├── ai/                   # AI processing
│       ├── upload/               # File upload
│       └── user/                 # User management
│
├── components/                   # React Components
│   ├── features/                 # Feature-specific components
│   │   ├── VisionAssistant/     # Vision features
│   │   ├── HearingAssistant/     # Hearing features
│   │   ├── MotorAssistant/       # Motor features
│   │   ├── CognitiveAssistant/   # Cognitive features
│   │   ├── SpeechAssistant/      # Speech features
│   │   ├── Emergency/            # Emergency features
│   │   └── VoiceAssistant/       # Voice-first interface
│   ├── accessibility/           # Accessibility utilities
│   │   ├── AccessibilityWrapper.tsx
│   │   ├── TextToSpeech.tsx
│   │   ├── ServiceWorkerRegistration.tsx
│   │   ├── PWAInstallPrompt.tsx
│   │   └── CameraStabilizer.tsx
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── layout/                   # Layout components
│   ├── navigation/               # Navigation components
│   ├── onboarding/               # Onboarding flow
│   ├── admin/                    # Admin components
│   └── branding/                 # Logo and branding
│
├── lib/                          # Business Logic & Utilities
│   ├── ai/                       # AI provider implementations
│   │   ├── base.ts               # AIProvider interface
│   │   ├── factory.ts            # Provider factory
│   │   ├── gemini.ts             # Gemini implementation
│   │   ├── openai.ts             # OpenAI implementation (stub)
│   │   └── claude.ts              # Claude implementation (stub)
│   ├── store/                    # Zustand stores (15+ stores)
│   │   ├── auth-store.ts         # Authentication
│   │   ├── user-profile.ts       # User profile
│   │   ├── user-preferences.ts   # UI preferences
│   │   ├── caption-store.ts      # Captioning
│   │   ├── vision-history.ts     # Vision history
│   │   ├── aac-store.ts          # AAC communication
│   │   ├── voice-banking-store.ts # Voice banking
│   │   ├── emergency-contacts-store.ts
│   │   ├── trusted-people-store.ts
│   │   ├── object-memory-store.ts
│   │   ├── sound-awareness-store.ts
│   │   ├── form-store.ts
│   │   ├── product-store.ts
│   │   ├── tag-store.ts
│   │   ├── admin-store.ts
│   │   └── api-keys-store.ts
│   ├── utils/                    # Utility functions
│   │   ├── api-client.ts         # API client wrapper
│   │   ├── access-methods.ts
│   │   ├── barcode-detector.ts
│   │   ├── color-detector.ts
│   │   ├── conversation-memory.ts
│   │   ├── danger-detector.ts
│   │   ├── fall-detection.ts
│   │   ├── form-parser.ts
│   │   ├── image-quality.ts
│   │   ├── medicine-parser.ts
│   │   ├── money-detector.ts
│   │   ├── privacy-handler.ts    # Privacy utilities
│   │   ├── profile-features.ts   # Profile access control
│   │   ├── qr-nfc-handler.ts
│   │   ├── sound-classifier.ts
│   │   ├── spatial-guidance.ts
│   │   └── voice-banking.ts
│   ├── features/                 # Feature-specific logic
│   │   ├── cognitive/
│   │   ├── hearing/
│   │   ├── motor/
│   │   ├── speech/
│   │   └── vision/
│   ├── hooks/                    # Custom React hooks
│   │   └── useAPIKey.ts
│   ├── types/                    # TypeScript types
│   │   └── user-profiles.ts      # User profile types
│   └── constants/                # Application constants
│
├── config/                       # Configuration Files
│   ├── accessibility.ts         # Accessibility settings
│   ├── ai-providers.ts          # AI provider configs
│   └── branding.ts               # Branding configuration
│
├── electron/                     # Electron Desktop App
│   ├── main.js                  # Electron main process
│   ├── preload.js               # Preload script
│   └── entitlements.mac.plist   # macOS entitlements
│
└── public/                       # Static Assets
    ├── icons/                    # App icons
    ├── sounds/                   # Audio files
    ├── manifest.json             # PWA manifest
    └── sw.js                     # Service worker
```

---

## Core Systems

### 1. Authentication System

**Location**: `lib/store/auth-store.ts`, `app/(auth)/`

**Current Architecture**:
- Zustand store with persistence
- In-memory user storage (demo - should be replaced with backend)
- JWT token support (via jsonwebtoken)
- Password hashing with bcryptjs

**Current Flow**:
1. User signs up/logs in via auth pages
2. Credentials validated (currently in-memory)
3. User object stored in Zustand with persistence
4. Session persists across page reloads

**Planned Improvements**:
- Replace in-memory auth with Next.js API routes + database
- Secure JWT/session cookies (httpOnly, sameSite, secure)
- Rate limiting on auth endpoints
- Proper password hashing server-side

### 2. Profile System

**Location**: `lib/types/user-profiles.ts`, `lib/store/user-profile.ts`

**Architecture**:
- 9 predefined user profiles
- Each profile has:
  - Feature access list
  - UI preferences (font size, contrast, layout density)
  - Accessibility needs
  - Hidden features list

**Profile Types**:
- `visual` - Blind/Low Vision
- `hearing` - Deaf/Hard of Hearing
- `motor` - Limited Mobility
- `cognitive` - Cognitive Impairments
- `speech` - Speech Impairments
- `elderly` - Elderly Assistance
- `multiple` - Multiple Disabilities
- `admin` - Administrator
- `general` - General Use

**Feature Guard**: `components/features/ProfileFeatureGuard.tsx`
- Conditionally renders features based on profile access
- Admin bypass for all features

**Planned Improvements**:
- Server-side enforcement of profile-based access
- Unit tests for profile access control
- Single source of truth for feature availability

### 3. AI Provider System

**Location**: `lib/ai/`, `config/ai-providers.ts`

**Architecture**:
- Factory pattern for provider creation
- Unified `AIProvider` interface
- Provider-specific implementations

**Interface Methods** (`lib/ai/base.ts`):
- Vision: `describeImage()`, `extractText()`, `recognizeObjects()`
- Audio: `transcribeAudio()`, `synthesizeSpeech()`
- Text: `simplifyText()`, `summarizeText()`, `answerQuestion()`
- Specialized: `breakDownTask()`, `generateReminder()`

**Providers**:
- **Gemini** (`lib/ai/gemini.ts`): Fully implemented, free tier
  - Uses `gemini-2.5-flash` for vision tasks
  - Uses `gemini-pro` for text tasks
- **OpenAI** (`lib/ai/openai.ts`): Stub (premium tier)
- **Claude** (`lib/ai/claude.ts`): Stub (premium tier)

**Factory** (`lib/ai/factory.ts`):
- Singleton pattern for provider instances
- Subscription tier-based provider selection
- Provider caching

**Planned Improvements**:
- Robust error handling, timeouts, retries
- Streaming support where available
- Centralized safety filters and redaction logic
- Clear typed responses

### 4. State Management

**Architecture**: Zustand stores with persistence

**Store Categories**:

1. **User State**
   - `auth-store.ts` - Authentication
   - `user-profile.ts` - Current profile
   - `user-preferences.ts` - UI preferences

2. **Feature State**
   - `caption-store.ts` - Captioning
   - `vision-history.ts` - Vision feature history
   - `aac-store.ts` - AAC communication
   - `voice-banking-store.ts` - Voice banking
   - `sound-awareness-store.ts` - Sound awareness

3. **Data State**
   - `emergency-contacts-store.ts` - Emergency contacts
   - `trusted-people-store.ts` - Trusted people
   - `object-memory-store.ts` - Object memory
   - `form-store.ts` - Form data
   - `product-store.ts` - Product info
   - `tag-store.ts` - Tags

4. **System State**
   - `admin-store.ts` - Admin features
   - `api-keys-store.ts` - API key management

**Persistence**: Most stores use Zustand's `persist` middleware for localStorage persistence

**Planned Improvements**:
- Review and remove unused/overlapping stores
- Add clear typing, avoid `any`
- Use `persist` only where safe, avoid leaking sensitive data

---

## Data Flow

### User Interaction Flow

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action / API Call
    ↓
AI Provider (if needed)
    ↓
State Update / Response
    ↓
UI Re-render
```

### AI Request Flow

```
Component
    ↓
API Route (/api/ai)
    ↓
AI Provider Factory (get provider)
    ↓
Provider Instance (Gemini/OpenAI/Claude)
    ↓
API Call to External Service
    ↓
Response Processing
    ↓
State Update (Zustand)
    ↓
UI Update
```

### Authentication Flow

```
Login/Signup Page
    ↓
Auth Store Action
    ↓
Validation (in-memory / future: backend)
    ↓
User Object Creation
    ↓
State Persistence (localStorage)
    ↓
Profile Selection (if new user)
    ↓
Dashboard Redirect
```

---

## API Architecture

### API Routes

#### `/api/ai` - AI Processing

**Method**: `POST`

**Request Body**:
```typescript
interface AIRequest {
  type: 'vision' | 'text' | 'simplify' | 'summarize' | 'question' | 'audio';
  data: {
    image?: string;      // Base64 image for vision
    text?: string;       // Text for text processing
    prompt?: string;     // Question prompt
    audio?: Blob;        // Audio blob for transcription
    context?: string;    // Additional context
    scenario?: string;   // Scenario type (medicine, sign, menu, etc.)
  };
  provider?: 'gemini' | 'openai' | 'claude';
  apiKey?: string;      // User-provided API key
}
```

**Response**:
```typescript
interface AIResponse {
  result: string;
  provider: string;
  timestamp: number;
}
```

**Error Response**:
```typescript
interface AIError {
  error: string;
  message: string;
}
```

**Features**:
- Supports user-provided API keys
- Falls back to environment variable
- Provider selection (Gemini, OpenAI, Claude)
- Multiple request types (vision, text, audio, etc.)

**Planned Improvements**:
- Rate limiting
- Request timeout handling
- Retry logic
- Streaming support for long responses

#### `/api/upload` - File Upload

**Status**: Planned

**Purpose**: Handle file uploads (images, audio, documents)

#### `/api/user` - User Management

**Status**: Planned

**Purpose**: User CRUD operations, profile management

---

## State Management

### Zustand Stores Overview

#### User State Stores

**`auth-store.ts`**
- Manages authentication state
- In-memory user storage (to be replaced)
- Persists user session

**`user-profile.ts`**
- Current user profile selection
- Applies profile-specific preferences
- Integrates with `user-preferences.ts`

**`user-preferences.ts`**
- UI preferences (font size, contrast, layout density)
- Accessibility settings (voice navigation, haptic feedback)
- AI provider selection

#### Feature State Stores

**`caption-store.ts`**
- Caption settings (font size, contrast, position)
- Caption sessions and transcripts
- Session history management

**`vision-history.ts`**
- Vision scan history
- Favorites management
- Recent scans tracking

**`aac-store.ts`**
- Augmentative and Alternative Communication data
- Communication boards
- Quick phrases

**`voice-banking-store.ts`**
- Voice banking data
- Personal voice samples

**`sound-awareness-store.ts`**
- Sound awareness settings
- Sound classification history

#### Data State Stores

**`emergency-contacts-store.ts`**
- Emergency contact list
- Primary contact management
- Contact CRUD operations

**`trusted-people-store.ts`**
- Trusted people list
- Person recognition data

**`object-memory-store.ts`**
- Object recognition memory
- Learned objects and locations

**`form-store.ts`**
- Form parsing data
- Extracted form information

**`product-store.ts`**
- Product information
- Scanned product data

**`tag-store.ts`**
- Tag management
- Tag associations

#### System State Stores

**`admin-store.ts`**
- Admin dashboard state
- User management data

**`api-keys-store.ts`**
- User-managed API keys
- Secure key storage (localStorage)

### Store Relationships

```
auth-store
    ↓
user-profile
    ↓
user-preferences
    ↓
[Feature Stores] (caption, vision-history, etc.)
```

---

## AI Provider System

### Provider Interface

All providers implement the `AIProvider` interface:

```typescript
interface AIProvider {
  // Vision capabilities
  describeImage(image: string, context?: string, scenario?: string): Promise<string>;
  extractText(image: string, context?: string): Promise<string>;
  recognizeObjects(image: string): Promise<ObjectRecognition[]>;
  
  // Audio capabilities
  transcribeAudio(audio: Blob): Promise<string>;
  synthesizeSpeech(text: string, voice?: string): Promise<Blob>;
  
  // Text processing
  simplifyText(text: string, level?: string): Promise<string>;
  summarizeText(text: string, length?: string): Promise<string>;
  answerQuestion(question: string, context?: string): Promise<string>;
  
  // Specialized features
  breakDownTask(task: string): Promise<string[]>;
  generateReminder(text: string): Promise<Reminder>;
}
```

### Gemini Provider

**Status**: Fully implemented

**Models Used**:
- `gemini-2.5-flash` - Vision tasks (multimodal)
- `gemini-pro` - Text tasks

**Features**:
- Image description with scenario-specific prompts
- OCR text extraction
- Object recognition
- Text simplification and summarization
- Task breakdown
- Reminder generation

**Limitations**:
- No native speech-to-text
- No native text-to-speech

### OpenAI Provider

**Status**: Stub (premium tier)

**Planned Features**:
- GPT-4 Vision for image understanding
- Whisper for speech-to-text
- TTS for text-to-speech

### Claude Provider

**Status**: Stub (premium tier)

**Planned Features**:
- Superior text simplification
- Complex reasoning tasks
- Long-context document processing

### Factory Pattern

The `AIProviderFactory` creates and manages provider instances:

```typescript
AIProviderFactory.create(providerType, apiKey)
AIProviderFactory.getProviderForUser(subscriptionTier)
```

**Planned Improvements**:
- Error handling and retries
- Timeout management
- Streaming support
- Safety filters and content redaction

---

## Accessibility Architecture

### Components

**Location**: `components/accessibility/`

**Components**:
- `AccessibilityWrapper.tsx` - Global accessibility wrapper
- `TextToSpeech.tsx` - TTS functionality
- `ServiceWorkerRegistration.tsx` - PWA service worker
- `PWAInstallPrompt.tsx` - PWA installation prompt
- `CameraStabilizer.tsx` - Camera stabilization for vision features

### Features

- **WCAG 2.1 AA Compliance**
  - Color contrast ratios
  - Text alternatives for images
  - Keyboard navigation
  - Screen reader support

- **Screen Reader Support**
  - ARIA labels and roles
  - Semantic HTML
  - Live regions for dynamic content

- **Keyboard Navigation**
  - Focus management
  - Skip links
  - Tab order

- **Customizable UI**
  - Font size adjustment (12-48px)
  - Contrast modes (normal, high, dark, light)
  - Layout density (compact, normal, spacious)
  - Reduced motion support

- **Voice Navigation**
  - Voice commands
  - Voice-first interface
  - Audio feedback

**Planned Improvements**:
- Enforce WCAG 2.1 AA compliance
- Add focus states and skip links
- Check color contrast for all gradients/text
- Make all critical flows keyboard-only usable
- Add reusable `AccessibleLayout` wrapper

---

## PWA Architecture

### Service Worker

**Location**: `public/sw.js`

**Features**:
- Offline caching
- Asset caching
- API response caching

### Manifest

**Location**: `public/manifest.json`

**Configuration**:
- App name: "InclusiAid"
- Short name: "InclusiAid"
- Theme color: `#6366f1`
- Display mode: `standalone`
- Icons: 192x192, 512x512
- Shortcuts: Vision, Hearing, Settings

### Registration

**Location**: `components/accessibility/ServiceWorkerRegistration.tsx`

**Features**:
- Automatic service worker registration
- Update notifications
- Offline support

---

## Electron Desktop Architecture

### Main Process

**Location**: `electron/main.js`

**Responsibilities**:
- Window management
- Application lifecycle
- Native integrations

### Preload Script

**Location**: `electron/preload.js`

**Features**:
- Secure context bridge
- API exposure to renderer

### Build Configuration

**Location**: `package.json` (build section)

**Configuration**:
- App ID: `com.inclusiaid.app`
- Product name: "InclusiAid"
- macOS DMG generation
- Code signing support
- Icon configuration

**Planned Improvements**:
- Unify branding to "InclusiAid"
- Update window titles and icons

---

## Security & Privacy

### Authentication

**Current**:
- Password hashing (bcryptjs)
- JWT tokens (jsonwebtoken)
- Session persistence

**Planned**:
- Secure JWT/session cookies (httpOnly, sameSite, secure)
- Server-side password hashing
- Rate limiting on auth endpoints

### Privacy

**Location**: `lib/utils/privacy-handler.ts`

**Features**:
- Person detection opt-in
- Trusted people saving opt-in
- Data encryption utilities (basic)

**Planned Improvements**:
- Per-user privacy settings
- Store/no-store images, transcripts, history
- Default to privacy-preserving
- Proper encryption (Web Crypto API)

### API Keys

**Location**: `lib/store/api-keys-store.ts`

**Features**:
- User-managed API keys
- Secure storage (localStorage)
- Provider-specific keys

**Planned Improvements**:
- Ensure no API keys exposed client-side
- Route all AI calls through secure server endpoints
- Server-side key management

### Logging

**Planned**:
- Minimal server-side logging
- Error and performance logging only
- No PII in logs

---

## Deployment Architecture

### Web Application

**Build**: `npm run build`
- Next.js standalone output
- Static asset optimization
- Code splitting

**Deployment Options**:
- Vercel (recommended for Next.js)
- Self-hosted Node.js server
- Docker container

### Desktop Application

**Build**: `npm run electron:build:mac`
- Next.js build
- Electron packaging
- macOS DMG creation

**Output**:
- `dist/mac/InclusiAid.app` - macOS application
- `dist/InclusiAid-*.dmg` - Installer

---

## Configuration Management

### Environment Variables

**`.env.local`**:
- `GEMINI_API_KEY` - Gemini API key
- Future: `OPENAI_API_KEY`, `CLAUDE_API_KEY`
- Future: Database connection strings

### Configuration Files

**`config/accessibility.ts`** - Accessibility settings

**`config/ai-providers.ts`** - AI provider configurations
- Provider features
- Rate limits
- Enabled status

**`config/branding.ts`** - Branding configuration
- Brand name: "InclusiAid"
- Colors, typography, spacing

**`next.config.ts`** - Next.js configuration
- Standalone output for Electron
- Image optimization settings

---

## Future Architecture Considerations

### Planned Enhancements

1. **Backend API**
   - Replace in-memory auth with proper backend
   - Next.js Route Handlers or separate API service
   - Database integration (Postgres/Supabase)

2. **Subscription System**
   - Premium tier management
   - Stripe integration
   - Feature gating by subscription

3. **Mobile Apps**
   - React Native for iOS/Android
   - Shared business logic

4. **Real-time Features**
   - WebSocket support for live features
   - Real-time captioning
   - Live collaboration

5. **Analytics**
   - Privacy-preserving analytics
   - Performance monitoring
   - Error tracking

6. **Testing**
   - Unit tests for AI provider layer
   - Integration tests for key flows
   - E2E tests for critical paths
   - CI/CD pipeline

7. **Extensibility**
   - Feature flags for modules
   - Plugin system
   - Third-party integrations

### Scalability Considerations

- API rate limiting
- Caching strategies
- CDN for static assets
- Database optimization
- Load balancing for API routes
- Horizontal scaling

---

## Diagrams

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (Next.js App Router + React Components)                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              State Management Layer                      │
│  (Zustand Stores + React Query)                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API Layer                               │
│  (Next.js API Routes)                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              AI Provider Layer                           │
│  (Gemini / OpenAI / Claude)                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            External AI Services                          │
│  (Google Gemini API / OpenAI API / Claude API)          │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RootLayout
├── Providers (React Query)
├── AccessibilityWrapper
├── ProfileLayout
│   ├── ProfileNavigation
│   └── Page Content
│       ├── ProfileFeatureGuard
│       └── Feature Components
├── ServiceWorkerRegistration
└── PWAInstallPrompt
```

### Data Flow for AI Request

```
User Action (Component)
    ↓
API Call (/api/ai)
    ↓
Extract API Key (user-provided or env)
    ↓
AIProviderFactory.create(provider, apiKey)
    ↓
Provider Instance (Gemini/OpenAI/Claude)
    ↓
External API Call
    ↓
Response Processing
    ↓
State Update (Zustand Store)
    ↓
UI Re-render
```

---

## Summary

This architecture document provides a comprehensive overview of the InclusiAid application. The system is designed with accessibility, privacy, and extensibility in mind. Key areas for improvement include:

1. **Security**: Replace in-memory auth with secure backend
2. **AI Provider Layer**: Add error handling, timeouts, retries, streaming
3. **Accessibility**: Enforce WCAG 2.1 AA compliance
4. **State Management**: Clean up stores, improve typing
5. **Privacy**: Implement comprehensive privacy handler
6. **Testing**: Add unit and integration tests
7. **Branding**: Unify to "InclusiAid" across all configs

The architecture is modular and designed to scale as the application grows and new features are added.

