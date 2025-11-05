import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNepalGuesserLogic } from './hooks/useNepalGuesserLogic';
import { StreetViewPanel } from './components/StreetViewPanel';
import { GuessingMap } from './components/GuessingMap';
import { ResultsPanel } from './components/ResultsPanel';
import { loadGoogleMapsAPI } from './utils/loadGoogleMaps';

const NepalGeoGuesser = () => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(null);

  const {
    guessMarker,
    results,
    round,
    totalScore,
    isLoading,
    error,
    loadLocations,
    loadNewRound,
    handleGuess,
    nextRound,
    resetGame,
    initStreetView,
    initMap,
    destroy
  } = useNepalGuesserLogic();

  // Load Google Maps API first
  useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        setGoogleMapsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
        setGoogleMapsError(err.message);
      });
  }, []);

  // Initialize the game after Google Maps is loaded
  useEffect(() => {
    if (!googleMapsLoaded) return;

    const init = async () => {
      const locations = await loadLocations();
      if (locations && locations.length > 0) {
        loadNewRound(locations);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      destroy();
    };
  }, [googleMapsLoaded, loadLocations, loadNewRound, destroy]);

  if (googleMapsError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-100 to-orange-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-2xl">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Google Maps API Error</h2>
          <p className="text-gray-700 mb-4">{googleMapsError}</p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-left">
            <p className="text-sm font-semibold text-yellow-800 mb-2">Common Causes:</p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>API key is restricted and doesn't allow localhost</li>
              <li>Required APIs not enabled (Maps JavaScript API, Street View API)</li>
              <li>API key is invalid or expired</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-2">Quick Fix:</p>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Click your API key</li>
              <li>Add <code className="bg-blue-100 px-1 rounded">http://localhost:5173/*</code> to Website restrictions</li>
              <li>Save and wait 1-2 minutes</li>
            </ol>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} className="bg-blue-600">
              Reload Page
            </Button>
            <Button 
              onClick={() => window.open('https://console.cloud.google.com/google/maps-apis/credentials', '_blank')} 
              variant="outline"
            >
              Open Google Console
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!googleMapsLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Nepal Geo-Guesser...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching beautiful locations from Nepal</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-100 to-orange-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="hover:bg-accent"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  🏔️ Nepal Geo-Guesser
                </h1>
                <p className="text-sm text-muted-foreground">
                  Guess where you are in Nepal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Round {round}</p>
                <p className="text-xl font-bold text-green-600">{totalScore.toLocaleString()}</p>
              </div>
              <Button
                onClick={resetGame}
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Street View - Left/Top - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-video lg:aspect-[16/10] bg-black">
                <StreetViewPanel onInit={initStreetView} />
              </div>
            </Card>
            
            {/* Instructions - Only show on larger screens */}
            <Card className="hidden lg:block">
              <CardHeader>
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>🗺️ Use Street View controls to explore the location</p>
                <p>📍 Click on the map to place your guess marker</p>
                <p>🎯 Submit your guess to see how close you were!</p>
                <p>⭐ Earn up to 5,000 points based on accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Map and Controls */}
          <div className="space-y-4">
            {/* Map Card */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Guessing Map</CardTitle>
                <CardDescription>Click anywhere to place your guess</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-square">
                  <GuessingMap
                    onInit={initMap}
                    guessMarker={guessMarker}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Guess Button */}
            {!results && (
              <Button
                onClick={handleGuess}
                disabled={!guessMarker}
                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
              >
                {guessMarker ? '🎯 Make Guess' : '📍 Click Map to Guess'}
              </Button>
            )}

            {/* Results Card */}
            <ResultsPanel
              results={results}
              onNextRound={nextRound}
              guessMarker={guessMarker}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NepalGeoGuesser;
