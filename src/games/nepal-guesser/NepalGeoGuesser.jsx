import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNepalGuesserLogic } from './hooks/useNepalGuesserLogic';
import { StreetViewPanel } from './components/StreetViewPanel';
import { GuessingMap } from './components/GuessingMap';
import { GameInfo } from './components/GameInfo';
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-100 to-orange-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Google Maps Error</h2>
          <p className="text-gray-700 mb-4">{googleMapsError}</p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure you've added your Google Maps API key to the .env.local file.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🏔️ Nepal Geo-Guesser
            </h1>
            <p className="text-sm text-gray-600">
              A Flawed Game by SJ - Can you guess where you are in Nepal?
            </p>
          </div>
          <GameInfo
            round={round}
            totalScore={totalScore}
            onReset={resetGame}
          />
        </div>

        {/* Main Game Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Street View - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <StreetViewPanel onInit={initStreetView} />
          </div>

          {/* Right Panel - Map and Controls */}
          <div className="flex flex-col gap-4">
            {/* Map */}
            <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden min-h-[300px]">
              <GuessingMap
                onInit={initMap}
                guessMarker={guessMarker}
              />
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Guess Button */}
              {!results && (
                <Button
                  onClick={handleGuess}
                  disabled={!guessMarker}
                  className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {guessMarker ? '🎯 Make Guess' : '📍 Click on Map First'}
                </Button>
              )}

              {/* Results Panel */}
              <ResultsPanel
                results={results}
                onNextRound={nextRound}
                guessMarker={guessMarker}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Powered by Google Street View & OpenStreetMap | 
            Part of the "Flawed Games by SJ" Collection
          </p>
        </div>
      </div>
    </div>
  );
};

export default NepalGeoGuesser;
