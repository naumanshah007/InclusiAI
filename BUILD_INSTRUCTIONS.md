# Building InclusiAid as a macOS Application

This guide explains how to build InclusiAid as a standalone macOS application (.app file).

## Prerequisites

1. **Node.js 18+** installed
2. **macOS** (for building macOS apps)
3. **Gemini API Key** (add to `.env.local`)

## Step 1: Install Dependencies

```bash
cd accessi-ai
npm install
```

## Step 2: Add Your API Key

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 3: Create App Icons (Optional but Recommended)

For a professional look, create app icons:

1. Create `public/icons/icon-512x512.png` (512x512 pixels)
2. Create `public/icons/icon-192x192.png` (192x192 pixels)

If you don't have icons, the build will still work but may show default Electron icons.

## Step 4: Build the Application

### Option A: Build for Development (Test Electron App)

```bash
npm run electron:dev
```

This will:
- Start the Next.js dev server
- Launch Electron with the app
- Open DevTools for debugging

### Option B: Build Production Executable

```bash
npm run electron:build:mac
```

This will:
1. Build the Next.js app for production
2. Package it with Electron
3. Create a `.app` file in the `dist` folder
4. Create a `.dmg` installer file

## Step 5: Find Your Application

After building, you'll find:

- **macOS App**: `dist/mac/InclusiAid.app`
- **DMG Installer**: `dist/InclusiAid-0.1.0.dmg` (or similar)

## Running the App

### From Development Build

```bash
npm run electron:dev
```

### From Production Build

1. **Option 1**: Double-click `InclusiAid.app` in the `dist/mac` folder
2. **Option 2**: Install from the DMG:
   - Open the `.dmg` file
   - Drag `InclusiAid.app` to Applications
   - Launch from Applications

## Troubleshooting

### "App is damaged" Error on macOS

If macOS says the app is damaged:

1. Open Terminal
2. Run: `xattr -cr /path/to/InclusiAid.app`
3. Try opening again

### Build Fails

- Make sure all dependencies are installed: `npm install`
- Check that Next.js build works: `npm run build`
- Ensure you have enough disk space

### App Won't Start

- Check the console for errors
- Make sure `.env.local` has your API key
- Try running in development mode first: `npm run electron:dev`

## File Structure After Build

```
dist/
├── mac/
│   └── InclusiAid.app          # The macOS application
├── InclusiAid-0.1.0.dmg        # DMG installer
└── InclusiAid-0.1.0-mac.zip    # Zip archive
```

## Notes

- The first build may take several minutes
- The app bundles the entire Next.js application (~100-200MB)
- You can distribute the `.app` file or `.dmg` to other Mac users
- For code signing (required for distribution outside App Store), you'll need an Apple Developer account

## Distribution

To distribute the app:

1. **DMG File**: Share the `.dmg` file - users can install by opening it
2. **App File**: Share the `.app` file - users can run it directly (may need to allow in Security settings)
3. **Zip Archive**: Share the `.zip` file - users can extract and run

## Code Signing (Optional)

For production distribution, you may want to code sign the app:

1. Get an Apple Developer account
2. Create certificates in Xcode
3. Update `package.json` build config with signing details

This is optional for personal use but recommended for public distribution.

