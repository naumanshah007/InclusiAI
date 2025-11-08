# Quick Start - Build macOS App

## Step 1: Add Your API Key

Create `.env.local` in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 2: Build the App

Run this command:

```bash
npm run electron:build:mac
```

This will:
- Build the Next.js app
- Package it with Electron
- Create a `.app` file you can run

## Step 3: Find Your App

After building, look in the `dist` folder:

- **`dist/mac/InclusiAid.app`** - Double-click this to run!
- **`dist/InclusiAid-0.1.0.dmg`** - DMG installer (optional)

## That's It!

Double-click `InclusiAid.app` to run your app!

---

## Troubleshooting

**If the build fails:**
- Make sure you have Node.js 18+ installed
- Run `npm install` first
- Check that `.env.local` exists with your API key

**If macOS says "App is damaged":**
- Open Terminal
- Run: `xattr -cr dist/mac/InclusiAid.app`
- Try opening again

**For more details:** See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)

