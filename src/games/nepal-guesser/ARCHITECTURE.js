/**
 * Nepal Geo-Guesser Game Module
 * 
 * This is a self-contained game module for the "Flawed Games by SJ" project.
 * It encapsulates all game logic, state management, and cleanup functionality.
 * 
 * ARCHITECTURE OVERVIEW:
 * =====================
 * 
 * The game is built as a React component with a custom hook (useNepalGuesserLogic)
 * that acts as the "game object" you requested. The hook manages:
 * 
 * 1. STATE:
 *    - locations: Array of Nepal locations from JSON
 *    - currentLocation: The answer for the current round
 *    - guessMarker: User's guess coordinates
 *    - results: Score and distance after guess
 *    - round: Current round number
 *    - totalScore: Cumulative score
 *    - isLoading: Loading state
 *    - error: Error state
 * 
 * 2. REFS (Map Objects):
 *    - mapRef: Leaflet map instance
 *    - panoramaRef: Google Street View panorama instance
 *    - streetViewServiceRef: Google Street View service
 *    - actualLocationMarkerRef: Marker showing actual location after guess
 *    - lineRef: Line connecting guess to actual location
 * 
 * 3. METHODS:
 *    - init() functions:
 *      * initMap(mapElement): Initializes Leaflet map
 *      * initStreetView(panoramaElement): Initializes Google Street View
 *    
 *    - loadLocations(): Fetches locations from JSON
 *    - loadNewRound(locationsArray): Picks random location and sets up Street View
 *    - placeGuessMarker(latlng): Handles map click to place guess
 *    - handleGuess(): Calculates score and displays results
 *    - calculateDistance(coords1, coords2): Haversine formula for distance
 *    - calculateScore(distance): Converts distance to points
 *    - nextRound(): Advances to next round
 *    - resetGame(): Resets entire game
 *    - destroy(): CRITICAL - Cleans up all resources on unmount
 * 
 * LIFECYCLE:
 * ==========
 * 
 * 1. Component Mounts:
 *    - useEffect calls loadLocations()
 *    - Locations are fetched from /public/nepal-locations.json
 *    - loadNewRound() is called with the locations
 *    
 * 2. During Round:
 *    - User explores Street View
 *    - User clicks map to place guess marker (placeGuessMarker)
 *    - User clicks "Make Guess" button (handleGuess)
 *    - Results are calculated and displayed
 *    - User clicks "Next Round" (nextRound)
 *    
 * 3. Component Unmounts:
 *    - destroy() is called via useEffect cleanup
 *    - Leaflet map is properly destroyed (map.remove())
 *    - Street View panorama is hidden
 *    - All refs are set to null
 *    - All state is reset
 * 
 * INTEGRATION WITH MAIN WEBSITE:
 * ===============================
 * 
 * The game is integrated as a standard React route:
 * 
 * ```jsx
 * import NepalGeoGuesser from './games/nepal-guesser/NepalGeoGuesser';
 * 
 * <Route path="/play/nepal-guesser" element={<NepalGeoGuesser />} />
 * ```
 * 
 * The component handles all initialization and cleanup automatically.
 * No manual init() or destroy() calls are needed from the parent.
 * 
 * EXTERNAL DEPENDENCIES:
 * ======================
 * 
 * 1. Google Maps API:
 *    - Loaded via script tag in index.html
 *    - API key stored in VITE_GOOGLE_MAPS_API_KEY env variable
 *    - Used for: Street View panorama and service
 * 
 * 2. Leaflet.js:
 *    - CSS and JS loaded via CDN in index.html
 *    - Used for: Guessing map (free, no API key needed)
 * 
 * 3. Location Data:
 *    - Stored in /public/nepal-locations.json
 *    - 20 hand-picked locations with confirmed Street View
 * 
 * FILE STRUCTURE:
 * ===============
 * 
 * src/games/nepal-guesser/
 * ├── NepalGeoGuesser.jsx              # Main component
 * ├── hooks/
 * │   └── useNepalGuesserLogic.js      # The "game object" - all logic here
 * ├── components/
 * │   ├── GuessingMap.jsx              # Leaflet map wrapper
 * │   ├── StreetViewPanel.jsx          # Google Street View wrapper
 * │   ├── GameInfo.jsx                 # Score/round display
 * │   └── ResultsPanel.jsx             # Results display
 * ├── README.md                        # Game documentation
 * └── INTEGRATION.md                   # Setup instructions
 * 
 * public/
 * └── nepal-locations.json             # Location data
 * 
 * COMPARISON TO REQUESTED STRUCTURE:
 * ==================================
 * 
 * You requested a "game object" with these methods. Here's how they map:
 * 
 * Requested          →  Implemented As
 * ──────────────────────────────────────────────────────────────
 * init()             →  initMap() + initStreetView() + useEffect
 * loadLocations()    →  loadLocations() ✓
 * loadNewRound()     →  loadNewRound() ✓
 * placeGuessMarker() →  placeGuessMarker() ✓
 * handleGuess()      →  handleGuess() ✓
 * calculateDistance()→  calculateDistance() ✓
 * destroy()          →  destroy() ✓
 * 
 * The main difference is that instead of a single init() function,
 * we split it into initMap() and initStreetView() which are called
 * when the respective DOM elements are mounted (via useEffect in
 * the component wrappers). This is more idiomatic in React.
 * 
 * The cleanup (destroy) is automatically called via useEffect's
 * cleanup function when the component unmounts.
 * 
 * USAGE EXAMPLE:
 * ==============
 * 
 * ```jsx
 * // No manual initialization needed!
 * // Just render the component:
 * 
 * <NepalGeoGuesser />
 * 
 * // The component will:
 * // 1. Load locations
 * // 2. Initialize maps
 * // 3. Start first round
 * // 4. Clean up when unmounted
 * ```
 * 
 * This is the React way of handling what you described as a
 * "game object" with init() and destroy() methods.
 */

// This file serves as documentation. The actual implementation is in:
// - useNepalGuesserLogic.js (the "game object")
// - NepalGeoGuesser.jsx (the main component)

export const GAME_CONSTANTS = {
  // Scoring
  MAX_SCORE: 5000,
  PERFECT_DISTANCE_KM: 1,
  GOOD_DISTANCE_KM: 10,
  OK_DISTANCE_KM: 50,
  POOR_DISTANCE_KM: 100,
  
  // Map settings
  NEPAL_CENTER: { lat: 28.3949, lng: 84.1240 },
  NEPAL_ZOOM: 7,
  
  // API
  LOCATIONS_JSON: '/nepal-locations.json',
  STREET_VIEW_RADIUS: 100, // meters to search for panorama
  
  // Marker icons
  GUESS_MARKER_COLOR: 'blue',
  ACTUAL_MARKER_COLOR: 'green',
};

export const GAME_STATES = {
  LOADING: 'loading',
  READY: 'ready',
  GUESSING: 'guessing',
  RESULTS: 'results',
  ERROR: 'error'
};
