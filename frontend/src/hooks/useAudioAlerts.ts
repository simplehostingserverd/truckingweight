import { useCallback, useRef, useState } from 'react';

interface AudioAlertOptions {
  volume?: number;
  loop?: boolean;
  fadeOut?: boolean;
}

interface TextToSpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useAudioAlerts = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPlaying, setIsPlaying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSpeaking, setIsSpeaking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate synthetic siren sound using Web Audio API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateSirenSound = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const audioContext = new (window.AudioContext || (window as unknown).webkitAudioContext)();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const duration = 3; // 3 seconds
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sampleRate = audioContext.sampleRate;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const frameCount = sampleRate * duration;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const channelData = arrayBuffer.getChannelData(0);

    // Generate siren waveform (alternating high and low frequency)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (let i = 0; i < frameCount; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const time = i / sampleRate;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const frequency = 800 + 400 * Math.sin(2 * Math.PI * 2 * time); // Oscillate between 400Hz and 1200Hz
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const amplitude = 0.3 * Math.sin(2 * Math.PI * frequency * time);
      channelData[i] = amplitude;
    }

    return arrayBuffer;
  }, []);

  // Play siren sound
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playSiren = useCallback(async (_options: AudioAlertOptions = {}) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsPlaying(true);

      // Try to load external siren file first
      try {
        audioRef.current = new Audio('/sounds/emergency-siren.wav');
        audioRef.current.volume = options.volume ?? 0.8;
        audioRef.current.loop = options.loop ?? false;

        audioRef.current.onended = () => {
          setIsPlaying(false);
        };

        audioRef.current.onerror = () => {
          // Fallback to synthetic siren
          console.warn('External siren file not found, using synthetic siren');
          playSyntheticSiren(options);
        };

        await audioRef.current.play();
      } catch (error) {
        // Fallback to synthetic siren
        console.warn('Failed to load external siren, using synthetic siren');
        playSyntheticSiren(options);
      }
    } catch (error) {
      console.error('Failed to play siren sound:', error);
      setIsPlaying(false);
    }
  }, []);

  // Play synthetic siren using Web Audio API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playSyntheticSiren = useCallback(
    (_options: AudioAlertOptions = {}) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const audioContext = new (window.AudioContext || (window as unknown).webkitAudioContext)();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sirenBuffer = generateSirenSound();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const source = audioContext.createBufferSource();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const gainNode = audioContext.createGain();

        source.buffer = sirenBuffer;
        gainNode.gain.value = options.volume ?? 0.8;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.onended = () => {
          setIsPlaying(false);
        };

        source.start();

        // Store reference for stopping
        (audioRef as unknown).current = {
          stop: () => {
            source.stop();
            setIsPlaying(false);
          },
        };
      } catch (error) {
        console.error('Failed to play synthetic siren:', error);
        setIsPlaying(false);
      }
    },
    [generateSirenSound]
  );

  // Stop siren sound
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stopSiren = useCallback(() => {
    if (audioRef.current) {
      if (typeof audioRef.current.pause === 'function') {
        // Regular HTML Audio element
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else if (typeof (audioRef.current as unknown).stop === 'function') {
        // Synthetic audio source
        (audioRef.current as unknown).stop();
      }
      setIsPlaying(false);
    }
  }, []);

  // Text-to-speech function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const speak = useCallback((text: string, _options: TextToSpeechOptions = {}) => {
    // Stop any current speech
    if (speechRef.current) {
      speechSynthesis.cancel();
    }

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const utterance = new SpeechSynthesisUtterance(text);
    speechRef.current = utterance;

    // Configure speech options
    utterance.rate = options.rate ?? 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 0.9;

    // Use a specific voice if provided, otherwise use default
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to find a good English voice
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const voices = speechSynthesis.getVoices();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const englishVoice =
        voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) ||
        voices.find(voice => voice.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = error => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, []);

  // Stop speech
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stopSpeech = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Combined emergency alert: siren + speech
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playEmergencyAlert = useCallback(
    async (message?: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const defaultMessage = 'Driver, please check your safety issues and pull over if required.';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const alertMessage = message || defaultMessage;

      try {
        // Play siren first
        await playSiren({ volume: 0.7, loop: false });

        // Wait a moment, then speak the message
        setTimeout(() => {
          speak(alertMessage, {
            rate: 0.8, // Slower for emergency clarity
            volume: 0.9,
            pitch: 1.1, // Slightly higher pitch for urgency
          });
        }, 1000); // 1 second delay after siren starts
      } catch (error) {
        console.error('Failed to play emergency alert:', error);
        // Fallback to just speech if siren fails
        speak(alertMessage);
      }
    },
    [playSiren, speak]
  );

  // Get available voices
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getVoices = useCallback(() => {
    return speechSynthesis.getVoices();
  }, []);

  // Cleanup function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cleanup = useCallback(() => {
    stopSiren();
    stopSpeech();
  }, [stopSiren, stopSpeech]);

  return {
    // State
    isPlaying,
    isSpeaking,

    // Siren functions
    playSiren,
    stopSiren,

    // Speech functions
    speak,
    stopSpeech,
    getVoices,

    // Combined functions
    playEmergencyAlert,

    // Utility
    cleanup,
  };
};
