# ⚠️ Fine-Grained Token Issue

Your fine-grained token works for API calls but not for git push. This is a known limitation.

## Solution: Use Classic Token Instead

Fine-grained tokens sometimes have issues with git operations. Let's use a **classic token** instead:

### Steps:

1. **Go to**: https://github.com/settings/tokens
2. **Click**: "Generate new token" → **"Generate new token (classic)"** ← Important!
3. **Name**: "InclusiAid Push"
4. **Expiration**: 90 days (or your preference)
5. **Scopes**: Check **`repo`** (Full control of private repositories)
6. **Click**: "Generate token"
7. **Copy the token** (starts with `ghp_...`)

### Then Push:

```bash
cd "/Users/nauman/Documents/Apps For Disable Persons/accessi-ai"
git push -u origin main
```

Use the classic token when prompted.

---

## Alternative: Use GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Select: `/Users/nauman/Documents/Apps For Disable Persons/accessi-ai`
4. Click "Publish repository"

This handles authentication automatically and works with fine-grained tokens.

