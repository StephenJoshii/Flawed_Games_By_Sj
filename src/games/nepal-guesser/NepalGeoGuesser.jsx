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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b px-6 py-4">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🏔️ Nepal Geo-Guesser
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Explore Nepal through Street View • Click the map to guess your location
              </p>
            </div>
            <GameInfo
              round={round}
              totalScore={totalScore}
              onReset={resetGame}
            />
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 min-h-0 p-4">
          <div className="max-w-screen-2xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Street View - Takes 8 columns (2/3 of screen) */}
            <div className="lg:col-span-8 bg-black rounded-lg shadow-xl overflow-hidden h-full">
              <StreetViewPanel onInit={initStreetView} />
            </div>

            {/* Right Panel - Map and Controls - Takes 4 columns (1/3 of screen) */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full">
              {/* Map - Takes more space */}
              <div className="flex-[2] bg-white rounded-lg shadow-xl overflow-hidden min-h-[400px]">
                <GuessingMap
                  onInit={initMap}
                  guessMarker={guessMarker}
                />
              </div>

              {/* Controls - Takes less space */}
              <div className="flex-[1] space-y-3 min-h-0">
                {/* Guess Button */}
                {!results && (
                  <Button
                    onClick={handleGuess}
                    disabled={!guessMarker}
                    className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
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
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t py-2 px-6">
          <div className="max-w-screen-2xl mx-auto text-center text-xs text-gray-500">
            <p>
              Powered by Google Street View & OpenStreetMap | Part of the "Flawed Games by SJ" Collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NepalGeoGuesser;
