# Nepal Geo-Guesser - Integration Guide

## Quick Setup

### 1. Add Google Maps API Key

Create or update `.env.local` in the root directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**How to get an API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Street View Static API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key and add it to `.env.local`

### 2. Scripts Already Added

The required Leaflet and Google Maps scripts have been added to `index.html`:
- ✅ Leaflet CSS
- ✅ Leaflet JS
- ✅ Google Maps API (loads API key from environment)

### 3. Add Game to HomePage

Update `src/pages/HomePage.jsx` to include the Nepal Geo-Guesser game card:

```jsx
const games = [
  // ... existing games ...
  {
    id: 'nepal-guesser',
    title: 'Nepal Geo-Guesser',
    description: 'Can you guess where you are in Nepal? Explore Street View and test your geography skills!',
    icon: '🏔️',
    color: 'from-blue-500 to-green-500',
    path: '/nepal-guesser'
  }
];
```

### 4. Add Route to App.jsx

Update `src/App.jsx` to include the route:

```jsx
import NepalGeoGuesser from './games/nepal-guesser/NepalGeoGuesser';

// In your routes:
<Route path="/nepal-guesser" element={<NepalGeoGuesser />} />
```

### 5. Test the Game

1. Make sure your `.env.local` has the Google Maps API key
2. Restart the dev server: `npm run dev`
3. Navigate to the Nepal Geo-Guesser game from the homepage
4. You should see Street View load with a location in Nepal

## Troubleshooting

### Street View not loading?
- Check that your Google Maps API key is valid
- Ensure "Maps JavaScript API" is enabled in Google Cloud Console
- Check browser console for error messages

### Map not displaying?
- Verify Leaflet scripts are loaded (check Network tab)
- Check for JavaScript errors in console
- Make sure the map container has height (it does via Tailwind classes)

### "Failed to load locations" error?
- Check that `/public/nepal-locations.json` exists
- Verify the file is valid JSON
- Check Network tab to see if the file is being served

### Markers not showing?
- This is likely a Leaflet marker icon path issue
- The game uses CDN-hosted marker images
- Check if the CDN URLs are accessible

## Game Architecture

```
NepalGeoGuesser (Main Component)
├── useNepalGuesserLogic (Custom Hook - Game Logic)
│   ├── State Management
│   ├── Google Maps Integration
│   ├── Leaflet Map Integration
│   └── Score Calculation
│
└── Components
    ├── StreetViewPanel (Google Street View)
    ├── GuessingMap (Leaflet Map)
    ├── GameInfo (Score & Round Display)
    └── ResultsPanel (Results After Guess)
```

## API Usage & Costs

**Google Maps API:**
- Street View requests: ~1,000 per day free, then $7 per 1,000
- Maps JavaScript API: Free for most usage

**Recommendation for Production:**
- Set API key restrictions (HTTP referrers)
- Enable billing alerts in Google Cloud
- Monitor usage in Google Cloud Console

## Next Steps

1. ✅ Add API key to `.env.local`
2. ✅ Update HomePage.jsx with game card
3. ✅ Update App.jsx with route
4. ✅ Test the game
5. 🎮 Play and enjoy!
