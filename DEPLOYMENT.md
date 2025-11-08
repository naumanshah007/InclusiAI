# Deployment Guide for InclusiAid

## Pushing to GitHub

Your code is committed and ready to push. You need to authenticate with GitHub first.

### Option 1: Using GitHub CLI (Recommended)

1. Install GitHub CLI if you don't have it:
   ```bash
   brew install gh
   ```

2. Authenticate:
   ```bash
   gh auth login
   ```

3. Push to GitHub:
   ```bash
   git push -u origin main
   ```

### Option 2: Using Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Use the token as password when pushing:
   ```bash
   git push -u origin main
   ```
   Username: your GitHub username
   Password: your personal access token

### Option 3: Manual Push via GitHub Desktop

1. Open GitHub Desktop
2. Add the repository
3. Push to origin

---

## Deploying to Vercel (Free)

### Method 1: Via Vercel Dashboard (Easiest)

1. **Push your code to GitHub first** (using one of the methods above)

2. **Go to Vercel**: https://vercel.com

3. **Sign up/Login** with your GitHub account

4. **Import your repository**:
   - Click "Add New Project"
   - Select `naumanshah007/InclusiAI` repository
   - Click "Import"

5. **Configure the project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

6. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = your Gemini API key
   - (Optional) Add other API keys if you have them

7. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at: `https://inclusiai.vercel.app` (or similar)

### Method 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd accessi-ai
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set environment variables when prompted

5. **For production deployment**:
   ```bash
   vercel --prod
   ```

---

## Important Notes for Vercel Deployment

### Environment Variables

Make sure to add these in Vercel Dashboard → Settings → Environment Variables:

- `GEMINI_API_KEY` - Your Gemini API key (required)
- `NODE_ENV` - Set to `production` (auto-set by Vercel)

### Build Configuration

Vercel will auto-detect Next.js, but ensure:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

### Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

---

## Post-Deployment Checklist

- [ ] Verify app is accessible at Vercel URL
- [ ] Test voice assistant features
- [ ] Test image description
- [ ] Verify API keys are working
- [ ] Check PWA installation works
- [ ] Test on mobile devices

---

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Check for TypeScript errors (they might block build)
4. Verify environment variables are set

### API Errors

1. Verify `GEMINI_API_KEY` is set in Vercel environment variables
2. Check API key is valid
3. Review API rate limits

### PWA Not Working

1. Ensure `manifest.json` is in `public/` folder
2. Check service worker is registered
3. Verify HTTPS is enabled (Vercel provides this automatically)

---

## Quick Commands Reference

```bash
# Push to GitHub
git push -u origin main

# Deploy to Vercel (CLI)
vercel

# Deploy to production (CLI)
vercel --prod

# Check deployment status
vercel ls
```

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review GitHub Actions (if enabled)
3. Check browser console for errors
4. Verify environment variables are set correctly

