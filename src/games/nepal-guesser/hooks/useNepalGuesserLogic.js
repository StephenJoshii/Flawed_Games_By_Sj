import { useState, useRef, useCallback } from 'react';

export const useNepalGuesserLogic = () => {
  // Game state
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [guessMarker, setGuessMarker] = useState(null);
  const [results, setResults] = useState(null);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for map objects
  const mapRef = useRef(null);
  const panoramaRef = useRef(null);
  const streetViewServiceRef = useRef(null);
  const actualLocationMarkerRef = useRef(null);
  const lineRef = useRef(null);

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  const calculateDistance = useCallback((coords1, coords2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1.lat * Math.PI / 180) * 
      Math.cos(coords2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }, []);

  /**
   * Calculate score based on distance
   * Perfect score (5000) for < 1km, decreasing with distance
   */
  const calculateScore = useCallback((distance) => {
    if (distance < 1) return 5000;
    if (distance < 10) return Math.round(5000 - (distance * 400));
    if (distance < 50) return Math.round(3000 - (distance * 40));
    if (distance < 100) return Math.round(1000 - (distance * 10));
    if (distance < 500) return Math.round(500 - distance);
    return 0;
  }, []);

  /**
   * Load locations from JSON file
   */
  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/nepal-locations.json');
      
      if (!response.ok) {
        throw new Error('Failed to load locations');
      }
      
      const data = await response.json();
      setLocations(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load game locations. Please refresh the page.');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Load a new round with a random location
   */
  const loadNewRound = useCallback((locationsArray) => {
    if (!locationsArray || locationsArray.length === 0) {
      setError('No locations available');
      return;
    }

    // Pick a random location
    const randomIndex = Math.floor(Math.random() * locationsArray.length);
    const newLocation = locationsArray[randomIndex];
    setCurrentLocation(newLocation);

    // Clear previous round markers and results
    setGuessMarker(null);
    setResults(null);

    // Clear actual location marker and line from map
    if (actualLocationMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(actualLocationMarkerRef.current);
      actualLocationMarkerRef.current = null;
    }
    if (lineRef.current && mapRef.current) {
      mapRef.current.removeLayer(lineRef.current);
      lineRef.current = null;
    }

    // Initialize Street View
    if (streetViewServiceRef.current && panoramaRef.current) {
      const location = { lat: newLocation.lat, lng: newLocation.lng };
      
      streetViewServiceRef.current.getPanorama(
        { location, radius: 100 },
        (data, status) => {
          if (status === 'OK') {
            panoramaRef.current.setPano(data.location.pano);
            panoramaRef.current.setPov({
              heading: Math.random() * 360,
              pitch: 0
            });
            panoramaRef.current.setVisible(true);
          } else {
            console.error('Street View not available for this location');
            // Try another location
            loadNewRound(locationsArray);
          }
        }
      );
    }
  }, []);

  /**
   * Handle map click to place guess marker
   */
  const placeGuessMarker = useCallback((latlng) => {
    setGuessMarker(latlng);
  }, []);

  /**
   * Handle guess submission
   */
  const handleGuess = useCallback(() => {
    if (!guessMarker || !currentLocation) {
      alert('Please place a marker on the map to make your guess!');
      return;
    }

    // Calculate distance and score
    const distance = calculateDistance(
      { lat: currentLocation.lat, lng: currentLocation.lng },
      guessMarker
    );
    const score = calculateScore(distance);

    // Update total score
    setTotalScore(prev => prev + score);

    // Set results
    setResults({
      distance: distance.toFixed(2),
      score,
      locationName: currentLocation.name,
      actualLocation: { lat: currentLocation.lat, lng: currentLocation.lng }
    });

    // Show actual location on map with Leaflet
    if (mapRef.current && window.L) {
      // Add marker for actual location
      actualLocationMarkerRef.current = window.L.marker(
        [currentLocation.lat, currentLocation.lng],
        {
          icon: window.L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }
      ).addTo(mapRef.current);

      actualLocationMarkerRef.current.bindPopup(`Actual Location: ${currentLocation.name}`).openPopup();

      // Draw line between guess and actual location
      lineRef.current = window.L.polyline(
        [
          [guessMarker.lat, guessMarker.lng],
          [currentLocation.lat, currentLocation.lng]
        ],
        { color: 'red', weight: 2, dashArray: '5, 10' }
      ).addTo(mapRef.current);

      // Fit bounds to show both markers
      const bounds = window.L.latLngBounds([
        [guessMarker.lat, guessMarker.lng],
        [currentLocation.lat, currentLocation.lng]
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [guessMarker, currentLocation, calculateDistance, calculateScore]);

  /**
   * Start next round
   */
  const nextRound = useCallback(() => {
    setRound(prev => prev + 1);
    loadNewRound(locations);
  }, [locations, loadNewRound]);

  /**
   * Reset the game
   */
  const resetGame = useCallback(() => {
    setRound(1);
    setTotalScore(0);
    setResults(null);
    setGuessMarker(null);
    loadNewRound(locations);
  }, [locations, loadNewRound]);

  /**
   * Initialize Google Maps Street View
   */
  const initStreetView = useCallback((panoramaElement) => {
    if (!window.google || !window.google.maps) {
      setError('Google Maps API not loaded');
      return;
    }

    try {
      panoramaRef.current = new window.google.maps.StreetViewPanorama(
        panoramaElement,
        {
          position: { lat: 27.7172, lng: 85.3240 }, // Default Kathmandu
          pov: { heading: 34, pitch: 10 },
          addressControl: false,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          zoomControl: true,
          fullscreenControl: false
        }
      );

      streetViewServiceRef.current = new window.google.maps.StreetViewService();
    } catch (err) {
      console.error('Google Maps initialization error:', err);
      setError(`Google Maps Error: ${err.message}. Check if your API key allows requests from localhost.`);
    }
  }, []);

  /**
   * Initialize Leaflet map
   */
  const initMap = useCallback((mapElement) => {
    if (!window.L) {
      setError('Leaflet not loaded');
      return null;
    }

    // Check if map is already initialized
    if (mapRef.current) {
      console.warn('Map already initialized, skipping...');
      return mapRef.current;
    }

    try {
      // Create map centered on Nepal
      mapRef.current = window.L.map(mapElement).setView([28.3949, 84.1240], 7);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      // Add click listener for placing guess marker
      mapRef.current.on('click', (e) => {
        placeGuessMarker(e.latlng);
      });

      return mapRef.current;
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(`Failed to initialize map: ${err.message}`);
      return null;
    }
  }, [placeGuessMarker]);

  /**
   * Cleanup function to destroy map and panorama
   */
  const destroy = useCallback(() => {
    // Remove Leaflet map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Clear panorama
    if (panoramaRef.current) {
      panoramaRef.current.setVisible(false);
      panoramaRef.current = null;
    }

    // Clear refs
    streetViewServiceRef.current = null;
    actualLocationMarkerRef.current = null;
    lineRef.current = null;

    // Reset state
    setLocations([]);
    setCurrentLocation(null);
    setGuessMarker(null);
    setResults(null);
    setRound(1);
    setTotalScore(0);
  }, []);

  return {
    // State
    locations,
    currentLocation,
    guessMarker,
    results,
    round,
    totalScore,
    isLoading,
    error,
    
    // Refs
    mapRef,
    panoramaRef,
    
    // Methods
    loadLocations,
    loadNewRound,
    placeGuessMarker,
    handleGuess,
    nextRound,
    resetGame,
    initStreetView,
    initMap,
    destroy,
    calculateDistance
  };
};
