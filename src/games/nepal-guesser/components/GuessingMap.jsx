import { useEffect, useRef } from 'react';

export const GuessingMap = ({ onInit, guessMarker }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && onInit) {
      onInit(mapRef.current);
    }
  }, [onInit]);

  // Update guess marker when it changes
  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker if guess exists
    if (guessMarker) {
      markerRef.current = window.L.marker([guessMarker.lat, guessMarker.lng], {
        icon: window.L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(mapRef.current);

      markerRef.current.bindPopup('Your Guess').openPopup();
    }
  }, [guessMarker]);

  return (
    <div className="w-full h-full">
      <div
        ref={mapRef}
        id="map"
        className="w-full h-full rounded-lg border-2 border-gray-300"
      />
    </div>
  );
};
