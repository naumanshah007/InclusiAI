# InclusiAid - Universal Accessibility Assistant

AI-powered accessibility assistant for people with disabilities. Built with Next.js, TypeScript, and AI APIs.

## Features

- **Vision Assistance**: Image description, OCR text extraction, scene understanding
- **Hearing Assistance**: Real-time transcription, captioning, audio alerts
- **Motor Assistance**: Voice commands, adaptive input, hands-free operation
- **Cognitive Assistance**: Text simplification, summarization, task breakdown
- **Speech Assistance**: Communication board, text-to-speech, quick phrases

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand, React Query
- **AI Providers**: Gemini (free), OpenAI (premium), Claude (premium)
- **PWA**: Service Worker, Offline Support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gemini API key (free tier available)

### Installation

1. Clone the repository:
```bash
cd accessi-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
accessi-ai/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Main app routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── features/           # Feature-specific components
│   ├── accessibility/      # Accessibility components
│   └── ui/                 # Base UI components
├── lib/                    # Utilities and business logic
│   ├── ai/                 # AI provider implementations
│   ├── store/              # State management
│   └── utils/              # Utility functions
├── config/                 # Configuration files
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## AI Providers

### Gemini (Free Tier)
- Currently implemented and working
- Supports vision and text processing
- Free tier available

### OpenAI (Premium - Coming Soon)
- GPT-4 Vision for advanced image understanding
- Whisper for high-accuracy speech-to-text
- TTS for natural voice synthesis

### Claude (Premium - Coming Soon)
- Superior text simplification
- Complex reasoning tasks
- Long-context document processing

## Accessibility Features

- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- High contrast modes
- Customizable font sizes
- Reduced motion support
- Voice navigation

## PWA Features

- Installable as a Progressive Web App
- Offline functionality
- Service worker caching
- App shortcuts

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run electron:dev` - Run Electron app in development mode
- `npm run electron:build:mac` - Build macOS application (.app file)

## Building as a macOS Application

InclusiAid can be built as a standalone macOS application using Electron.

### Quick Build

1. **Add your API key** to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Build the app**:
   ```bash
   npm run electron:build:mac
   ```

3. **Find your app** in the `dist/mac/` folder:
   - `InclusiAid.app` - Double-click to run
   - `InclusiAid-0.1.0.dmg` - DMG installer in `dist/` folder

### Detailed Instructions

See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) for detailed build instructions, troubleshooting, and distribution guide.

### Testing Electron App

To test the Electron app in development:

```bash
npm run electron:dev
```

This will start the Next.js dev server and launch Electron.

## Future Enhancements

- [ ] OpenAI integration (premium tier)
- [ ] Claude integration (premium tier)
- [ ] Subscription system with Stripe
- [ ] Native mobile apps (iOS/Android)
- [ ] Comprehensive testing suite
- [ ] CI/CD pipeline
- [ ] Analytics and monitoring

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
