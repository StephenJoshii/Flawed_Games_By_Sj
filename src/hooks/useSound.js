import { useCallback, useEffect, useRef } from 'react';


const soundMap = {
  move: 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBvZiB0aGUgSmF2b1hTU0hFIFMAQQBtAAAAAAAACAAATGF2YzU0LjM1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAA/g4AAB8AAA/g4AAAABAAAD/g4AAAEIAAAP+DgAAAEIAAAP+DgAAAMIAAAAD//uRAAAAAP8PAAAAAQAAAvgQAAAAAAB//sRAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB//uRAQ8AAAAA/w8AAAAQAAADfBAAAAAAAF//sRAQ8BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/+40EP//4PAAAAEAAAAvwQAAAAAAA=',
  merge: 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBvZiB0aGUgSmF2b1hTU0hFIFMAQQBtAAAAAAAACAAATGF2YzU0LjM1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAA/g4AAABIAAAP+DgAAA8IAAAP+DgAAAUIAAAP+DgAAASgAAA/+DgAAAIgAAAAD//uRAAAAAP8PAAAAAQAAAyAQAAAAAAB//sRAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB//uRAQ8AAAAA/w8AAAAQAAADWBAAAAAAAF//sRAQ8BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/+40EP//4PAAAAEAAAArgQAAAAAAA=',
  gameOver: 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBvZiB0aGUgSmF2b1hTU0hFIFMAQQBtAAAAAAAACAAATGF2YzU0LjM1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAA/g4AAAEIAAAP+DgAAAUIAAAP+DgAAASgAAA/+DgAAAIgAAAAD//uRAAAAAP8PAAAAAQAAAyAQAAAAAAB//sRAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB//uRAQ8AAAAA/w8AAAAQAAADWBAAAAAAAF//sRAQ8BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/+40EP//4PAAAAEAAAArgQAAAAAAA=',
};

// A single, global AudioContext for the entire application.
let audioContext = null;

// A cache for pre-loaded audio data to avoid re-fetching.
const audioBufferCache = {};

/**
 * A custom hook to manage loading and playing sounds using the native Web Audio API.
 * This approach is robust and performant for game audio.
 * @returns {{ play: function, unlockAudio: function }} An object containing the play and unlock functions.
 */
export function useSound() {
  const isAudioUnlocked = useRef(false);

  // This effect runs once to initialize the audio context and preload sounds.
  useEffect(() => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Preload all sound files from the data URIs.
    for (const key in soundMap) {
      if (!audioBufferCache[key]) {
        // Support both normal URLs and data: URI (base64) sources.
        const fetchArrayBuffer = async (src) => {
          try {
              if (typeof src === 'string' && src.startsWith('data:')) {
              // Convert base64 data URI to ArrayBuffer without fetch (fetch on data: may fail in some browsers)
              let base64 = src.split(',')[1] || '';
              base64 = base64.trim();

              const tryAtob = (b64) => {
                try {
                  return atob(b64);
    } catch {
      return null;
    }
              };

              // Try a few sanitizations in case the base64 is malformed (spaces, url-safe chars, stray chars)
              let binary = tryAtob(base64);
              if (binary === null) {
                // Remove whitespace
                let cleaned = base64.replace(/\s+/g, '');
                binary = tryAtob(cleaned);
                if (binary === null) {
                  // Strip any chars not in base64 alphabet
                  cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, '');
                  binary = tryAtob(cleaned);
                }
                if (binary === null) {
                  // Replace spaces with pluses (sometimes + become spaces during transfer)
                  cleaned = base64.replace(/\s+/g, '+');
                  binary = tryAtob(cleaned);
                }
                if (binary === null) {
                  // Try percent-decoding if it was URL encoded
                  try {
                    const decoded = decodeURIComponent(base64);
                    binary = tryAtob(decoded);
      } catch {
        // ignore
      }
                }
              }

              if (binary === null) {
                return Promise.reject(new Error('Invalid base64 data URI'));
              }

              const len = binary.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
              return bytes.buffer;
            }

            const resp = await fetch(src);
            return await resp.arrayBuffer();
          } catch (err) {
            return Promise.reject(err);
          }
        };

        fetchArrayBuffer(soundMap[key])
          .then((arrayBuffer) => {
            // decodeAudioData historically accepted callbacks and in some browsers returns a promise.
            return new Promise((resolve, reject) => {
              try {
                const maybePromise = audioContext.decodeAudioData(
                  arrayBuffer,
                  (buffer) => resolve(buffer),
                  (err) => reject(err)
                );
                // If decodeAudioData returned a Promise, wire it up as well.
                if (maybePromise && typeof maybePromise.then === 'function') {
                  maybePromise.then(resolve).catch(reject);
                }
              } catch (err) {
                reject(err);
              }
            });
          })
          .then(audioBuffer => {
            audioBufferCache[key] = audioBuffer;
          })
          .catch(error => console.error(`[Sound] Failed to decode sound: ${key}`, error));
      }
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (!isAudioUnlocked.current && audioContext?.state === 'suspended') {
      audioContext.resume().then(() => {
        isAudioUnlocked.current = true;
      });
    } else if (!isAudioUnlocked.current) {
       
        isAudioUnlocked.current = true;
    }
  }, []);

  /**
   * Plays a pre-loaded sound from the cache.
   * @param {string} soundName - The name of the sound to play (e.g., 'move', 'merge').
   */
  const play = useCallback((soundName) => {
    if (!isAudioUnlocked.current) {
      // Unlock is now called on first interaction, so this is just a safety net.
      // We try to unlock here as a last resort.
      unlockAudio();
    }

    if (audioContext?.state !== 'running') {
      console.warn('[Sound] Audio context not running.');
      return;
    }

    const audioBuffer = audioBufferCache[soundName];
    if (audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } else {
      console.warn(`[Sound] Sound not loaded or not found: ${soundName}`);
    }
  }, [unlockAudio]);

  return { play, unlockAudio };
}

