# 🔑 Google Maps API Key - Fixing RefererNotAllowedMapError

## ❌ Current Error

```
RefererNotAllowedMapError
Your site URL to be authorized: http://localhost:5173/play/nepal-guesser
```

This means your API key is restricted and doesn't allow requests from `localhost:5173`.

## ✅ Quick Fix Options

### Option 1: Add localhost to Allowed Referrers (Recommended for Development)

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Find your API key (ending in `...JN3RQmmE`)
3. Click on it to edit
4. Scroll to "Application restrictions"
5. Under "Website restrictions", add these referrers:
   ```
   http://localhost:5173/*
   http://localhost:*
   https://localhost:*
   ```
6. Click "Save"
7. Wait 1-2 minutes for changes to propagate
8. Reload your game

### Option 2: Temporarily Remove Restrictions (Quick Test Only)

⚠️ **WARNING**: Only for local testing, NEVER for production!

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Click your API key
3. Under "Application restrictions", select **"None"**
4. Click "Save"
5. **REMEMBER** to add restrictions back before deploying!

### Option 3: Create a Separate Development API Key

Best practice for development:

1. Create a new API key in Google Cloud Console
2. Name it "Google Maps - Development"
3. Set restrictions to:
   ```
   http://localhost:*
   http://127.0.0.1:*
   ```
4. Update `.env.local` with the new key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_dev_key_here
   ```

## 📋 Recommended Referrer Settings

### For Development (.env.local)
```
http://localhost:*
http://127.0.0.1:*
```

### For Production (when you deploy)
```
https://yourdomain.com/*
https://www.yourdomain.com/*
```

### For Both (if using same key)
```
http://localhost:*
http://127.0.0.1:*
https://yourdomain.com/*
https://www.yourdomain.com/*
```

## 🔍 How to Check Current Restrictions

1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Click on your API key
3. Scroll to "Application restrictions"
4. Look at "Website restrictions" section
5. Make sure your development URL is listed

## ✅ After Updating

1. Save your changes in Google Cloud Console
2. Wait 1-2 minutes
3. Clear browser cache (or hard reload: Cmd+Shift+R on Mac)
4. Reload the game: http://localhost:5173/play/nepal-guesser

## 🐛 Still Not Working?

### Check API Enablement
Make sure these APIs are enabled:
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Maps JavaScript API" - should show "API Enabled"
3. Search for "Street View Static API" - should show "API Enabled"

### Verify API Key
1. Copy your API key from `.env.local`
2. Try it in a test URL:
   ```
   https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE
   ```
3. Paste that URL in your browser
4. You should see JavaScript code, not an error

## 💡 Pro Tips

- Use different API keys for dev/staging/prod
- Set up billing alerts in Google Cloud
- Monitor API usage in the Console
- Never commit API keys to GitHub (use .env.local)
- Add .env.local to .gitignore

---

**Current Working API Key (from your .env.local):**
```
AIzaSyCuwpBEcpFKjMFK-X77P4lxfN_JN3RQmmE
```

Just add `http://localhost:5173/*` to this key's allowed referrers!
