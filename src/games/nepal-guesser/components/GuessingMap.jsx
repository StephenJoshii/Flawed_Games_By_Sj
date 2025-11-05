import { useEffect, useRef } from 'react';

export const GuessingMap = ({ onInit, guessMarker }) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapContainerRef.current && onInit && !leafletMapRef.current) {
      // Store the returned map instance
      const mapInstance = onInit(mapContainerRef.current);
      leafletMapRef.current = mapInstance;
    }
  }, [onInit]);

  // Update guess marker when it changes
  useEffect(() => {
    if (!window.L || !leafletMapRef.current) return;

    // Remove old marker
    if (markerRef.current) {
      try {
        markerRef.current.remove();
      } catch (err) {
        console.warn('Error removing marker:', err);
      }
      markerRef.current = null;
    }

    // Add new marker if guess exists
    if (guessMarker) {
      try {
        markerRef.current = window.L.marker([guessMarker.lat, guessMarker.lng], {
          icon: window.L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(leafletMapRef.current);

        markerRef.current.bindPopup('Your Guess').openPopup();
      } catch (err) {
        console.error('Error adding marker:', err);
      }
    }
  }, [guessMarker]);

  return (
    <div className="w-full h-full">
      <div
        ref={mapContainerRef}
        id="map"
        className="w-full h-full rounded-lg border-2 border-gray-300"
      />
    </div>
  );
};
