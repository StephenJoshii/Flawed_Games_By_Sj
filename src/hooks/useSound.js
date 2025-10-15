import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';


const soundMap = {
  move: 'https://cdn.jsdelivr.net/gh/k-d-s-h/2048-in-react/public/sounds/move.mp3', // Placeholder sound
  merge: 'https://cdn.jsdelivr.net/gh/k-d-s-h/2048-in-react/public/sounds/merge.mp3', // Placeholder sound
  gameOver: 'https://example.com/sounds/gameover.mp3', // Placeholder sound
};


export function useSound() {
  const sounds = useRef({});


  useEffect(() => {
    console.log('%c[Sound] Initializing and loading sounds...', 'color: orange;');
    for (const key in soundMap) {
      sounds.current[key] = new Howl({
        src: [soundMap[key]],
        html5: true, // Helps with compatibility
      });
      console.log(`%c[Sound]   - Loaded '${key}'`, 'color: orange;');
    }
  }, []);

  
  const play = useCallback((soundName) => {
    if (sounds.current[soundName]) {
      console.log(`%c[Sound] Playing sound: '${soundName}'`, 'color: green;');
      sounds.current[soundName].play();
    } else {
      console.warn(`[Sound] Sound not found: ${soundName}`);
    }
  }, []);

  return play;
}
