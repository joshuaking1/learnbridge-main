// frontend/src/utils/textToSpeech.ts

/**
 * Utility for Text-to-Speech functionality using the Web Speech API
 */

// Check for browser support (run only on client)
const speechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Speaks the provided text using the browser's speech synthesis API
 * @param text The text to be spoken
 * @param options Optional configuration for the speech
 * @returns A promise that resolves when speech is complete or rejects on error
 */
export function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  // Return a rejected promise if speech synthesis is not supported
  if (!speechSynthesisSupported) {
    console.warn('Speech synthesis not supported in this browser');
    return Promise.reject(new Error('Speech synthesis not supported'));
  }

  return new Promise((resolve, reject) => {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create utterance with the provided text
      const utterance = new SpeechSynthesisUtterance(text);

      // Apply options if provided
      if (options.voice) utterance.voice = options.voice;
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;
      if (options.lang) utterance.lang = options.lang;

      // Set up event handlers
      utterance.onend = () => {
        console.log('Speech finished');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error initializing speech:', error);
      reject(error);
    }
  });
}

/**
 * Stops any ongoing speech
 */
export function stopSpeaking(): void {
  if (speechSynthesisSupported) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Gets available voices for speech synthesis
 * @returns Array of available SpeechSynthesisVoice objects
 */
export function getVoices(): SpeechSynthesisVoice[] {
  if (!speechSynthesisSupported) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Checks if speech synthesis is supported in the current browser
 * @returns boolean indicating support status
 */
export function isSpeechSynthesisSupported(): boolean {
  return speechSynthesisSupported;
}

// Types
export interface SpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number; // 0.1 to 10, default is 1
  pitch?: number; // 0 to 2, default is 1
  volume?: number; // 0 to 1, default is 1
  lang?: string; // BCP 47 language tag, e.g., 'en-US'
}
