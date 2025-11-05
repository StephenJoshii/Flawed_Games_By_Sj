# Nepal Geo-Guesser Game

A GeoGuessr-style game focused on Nepal! Players are shown a Google Street View location in Nepal and must guess where they are on a map.

## 🎮 Game Features

- **Street View Exploration**: Navigate through real locations in Nepal using Google Street View
- **Interactive Map**: Click on the map to place your guess
- **Smart Scoring**: Distance-based scoring system (0-5000 points per round)
- **Multiple Rounds**: Play multiple rounds and track your total score
- **Beautiful UI**: Modern, responsive design with Tailwind CSS and shadcn/ui components

## 📋 Setup Requirements

### 1. Google Maps API Key

This game requires a Google Maps API key with the following APIs enabled:
- **Street View Static API**
- **Maps JavaScript API**

#### Getting an API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

⚠️ **Important**: For production, restrict your API key to your domain!

### 2. Required Scripts in index.html

Add these scripts to your `index.html` file before the closing `</body>` tag:

```html
<!-- Leaflet CSS -->
<link 
  rel="stylesheet" 
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""
/>

<!-- Leaflet JS -->
<script 
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
  crossorigin=""
></script>

<!-- Google Maps API -->
<script 
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places"
  async 
  defer
></script>
```

Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key, or better yet, use environment variables in your build process.

### 3. Leaflet Marker Icons

The game uses custom colored markers from the `leaflet-color-markers` repository. These are loaded via CDN automatically.

## 🗂️ Project Structure

```
src/games/nepal-guesser/
├── NepalGeoGuesser.jsx           # Main game component
├── components/
│   ├── GuessingMap.jsx           # Leaflet map for guessing
│   ├── StreetViewPanel.jsx       # Google Street View panel
│   ├── GameInfo.jsx              # Score and round display
│   └── ResultsPanel.jsx          # Results after each guess
└── hooks/
    └── useNepalGuesserLogic.js   # Game logic and state management

public/
└── nepal-locations.json          # Hand-picked Nepal locations
```

## 🎯 How to Play

1. **Explore**: Look around the Street View to find clues about your location
2. **Guess**: Click on the map where you think you are
3. **Submit**: Click the "Make Guess" button
4. **Score**: See your score based on how close you were!
5. **Continue**: Play multiple rounds to improve your total score

## 🏆 Scoring System

- **< 1 km**: 5000 points (Perfect!)
- **1-10 km**: 5000 - 400 per km
- **10-50 km**: 3000 - 40 per km
- **50-100 km**: 1000 - 10 per km
- **100-500 km**: 500 - 1 per km
- **> 500 km**: 0 points

## 🗺️ Location Data

The game includes 20 hand-picked locations across Nepal with confirmed Street View coverage:

- Kathmandu Valley (Thamel, Durbar Square, Boudhanath, etc.)
- Pokhara (Lakeside, Phewa Lake, Sarangkot)
- Historical sites (Lumbini, Bhaktapur, Patan)
- Mountain towns (Nagarkot, Dhulikhel, Bandipur)
- Other major cities (Biratnagar, Janakpur, Butwal, etc.)

## 🔧 Integration with Main Website

This game is designed as a standalone component that can be easily integrated into the "Flawed Games by SJ" website:

```jsx
import NepalGeoGuesser from './games/nepal-guesser/NepalGeoGuesser';

// In your router or game selector:
<NepalGeoGuesser />
```

The component handles its own initialization and cleanup through the `useNepalGuesserLogic` hook.

## 🐛 Known Limitations ("Flaws")

As part of the "Flawed Games" collection, this game has some intentional and unintentional quirks:

1. **Limited Coverage**: Street View coverage in Nepal is sparse - not all areas are available
2. **Fixed Locations**: Uses a predefined list of 20 locations (not infinite)
3. **No Multiplayer**: Single-player only
4. **Mobile Experience**: Best played on desktop due to Street View controls
5. **API Costs**: Google Maps API usage may incur costs in production

## 📝 License

Part of the "Flawed Games by SJ" project - see main project LICENSE
