# 🏔️ Nepal Geo-Guesser - Quick Start

## ⚡ TL;DR

1. ✅ Google Maps API key already in `.env.local`
2. ✅ All scripts and routes configured
3. ✅ Game is ready to play!

4. Start/restart dev server:
   ```bash
   npm run dev
   ```

5. Play at: http://localhost:5173/play/nepal-guesser

## 🔧 Technical Fixes Applied

- ✅ Google Maps API loaded dynamically (no more `import.meta` errors)
- ✅ Map initialization check (prevents "already initialized" errors)
- ✅ Proper component lifecycle management
- ✅ Error boundaries for API loading failures

## ✅ What's Already Done

- ✅ Game component created
- ✅ Game logic implemented
- ✅ UI components built
- ✅ 20 Nepal locations curated
- ✅ Leaflet scripts added to `index.html`
- ✅ Google Maps script loader added to `index.html`
- ✅ Route added to `App.jsx`
- ✅ Game card added to `HomePage.jsx`
- ✅ Responsive design with Tailwind CSS

## 🎮 Game Features

- **Street View**: Explore real locations in Nepal
- **Interactive Map**: Click to place your guess
- **Smart Scoring**: 0-5000 points based on distance
- **Multiple Rounds**: Track your total score
- **Beautiful UI**: Modern gradient design

## 📁 Created Files

```
public/nepal-locations.json                              # 20 curated locations

src/games/nepal-guesser/
├── NepalGeoGuesser.jsx                                  # Main component
├── ARCHITECTURE.js                                       # Technical docs
├── INTEGRATION.md                                        # Setup guide
├── README.md                                             # Full docs
├── components/
│   ├── GuessingMap.jsx                                  # Leaflet map
│   ├── StreetViewPanel.jsx                              # Google Street View
│   ├── GameInfo.jsx                                     # Score display
│   └── ResultsPanel.jsx                                 # Results UI
└── hooks/
    └── useNepalGuesserLogic.js                          # All game logic
```

## 🔑 Google Maps API Setup

### Option 1: Quick Test (Unrestricted)
```env
VITE_GOOGLE_MAPS_API_KEY=AIza...your_key_here
```

### Option 2: Production (Recommended)
1. Create API key in Google Cloud Console
2. Restrict by HTTP referrers:
   - `http://localhost:5173/*` (dev)
   - `https://yourdomain.com/*` (prod)
3. Enable only required APIs:
   - Maps JavaScript API ✓
   - Street View Static API ✓

## 🐛 Troubleshooting

### Street View not loading?
- Check API key in `.env.local`
- Check console for errors
- Verify APIs are enabled in Google Cloud

### Map not showing?
- Check Leaflet scripts in `index.html`
- Check console for errors
- Verify map container has height

### "Failed to load locations"?
- Check `/public/nepal-locations.json` exists
- Check Network tab in DevTools
- Verify file is valid JSON

## 🎯 How to Play

1. **Look around** the Street View
2. **Click** on the map where you think you are
3. **Press** "Make Guess"
4. **See** your score and distance
5. **Click** "Next Round" to continue

## 📊 Scoring

- **< 1 km**: 5000 pts 🎯
- **1-10 km**: 5000-1000 pts 🌟
- **10-50 km**: 1000-500 pts 👍
- **50-100 km**: 500-100 pts 👌
- **100-500 km**: 100-0 pts 😅
- **> 500 km**: 0 pts 💀

## 🚀 Next Steps

1. Add your API key
2. Test the game
3. Adjust locations if needed
4. Share with friends!

---

**Part of "Flawed Games by SJ"** 🎮
