# Quick Push & Deploy Instructions

## Step 1: Push to GitHub

Your code is already committed. You just need to authenticate and push:

### Option A: Use GitHub Desktop (Easiest)
1. Open GitHub Desktop
2. File → Add Local Repository
3. Select: `/Users/nauman/Documents/Apps For Disable Persons/accessi-ai`
4. Click "Publish repository" or "Push origin"

### Option B: Use Terminal with Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic) with `repo` scope
3. Copy the token
4. Run:
   ```bash
   cd "/Users/nauman/Documents/Apps For Disable Persons/accessi-ai"
   git push -u origin main
   ```
5. When prompted:
   - Username: `naumanshah007`
   - Password: `[paste your token here]`

### Option C: Install GitHub CLI
```bash
brew install gh
gh auth login
git push -u origin main
```

---

## Step 2: Deploy to Vercel (Free)

### Via Vercel Dashboard (Recommended - No CLI needed)

1. **Go to**: https://vercel.com/new

2. **Sign in** with your GitHub account

3. **Import Repository**:
   - Select `naumanshah007/InclusiAI`
   - Click "Import"

4. **Configure Project**:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     - Name: `GEMINI_API_KEY`
     - Value: `[your Gemini API key]`
   - Click "Add"

6. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live!

7. **Get Your Live URL**:
   - After deployment, you'll get a URL like: `https://inclusiai-xxxxx.vercel.app`
   - You can also add a custom domain later

---

## That's It!

Your app will be:
- ✅ On GitHub: https://github.com/naumanshah007/InclusiAI
- ✅ Live on Vercel: https://[your-project].vercel.app

---

## Troubleshooting

**If push fails**: Make sure you're authenticated with GitHub
**If Vercel build fails**: Check the build logs and ensure `GEMINI_API_KEY` is set
**If app doesn't work**: Verify API key is correct in Vercel environment variables

