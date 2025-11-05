import { useEffect, useRef } from 'react';

export const StreetViewPanel = ({ onInit }) => {
  const panoramaRef = useRef(null);

  useEffect(() => {
    if (panoramaRef.current && onInit) {
      onInit(panoramaRef.current);
    }
  }, [onInit]);

  return (
    <div className="w-full h-full">
      <div
        ref={panoramaRef}
        id="panorama"
        className="w-full h-full rounded-lg"
      />
    </div>
  );
};
