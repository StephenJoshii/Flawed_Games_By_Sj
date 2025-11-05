/**
 * Utility to dynamically load Google Maps API
 * This is loaded on-demand when the Nepal Geo-Guesser game starts
 */

let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // If currently loading, wait for it
    if (isLoading) {
      const checkInterval = setInterval(() => {
        if (isLoaded && window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve(window.google);
        }
      }, 100);
      return;
    }

    // Start loading
    isLoading = true;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      reject(new Error('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env.local file.'));
      isLoading = false;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve(window.google);
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps API. Check your API key and internet connection.'));
    };

    document.head.appendChild(script);
  });
};
