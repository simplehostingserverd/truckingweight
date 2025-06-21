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

export const useAudioAlerts = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate synthetic siren sound using Web Audio API
  const generateSirenSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as unknown).webkitAudioContext)();
    const duration = 3; // 3 seconds
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = arrayBuffer.getChannelData(0);

    // Generate siren waveform (alternating high and low frequency)
    for (let i = 0; i < frameCount; i++) {
      const time = i / sampleRate;
      const frequency = 800 + 400 * Math.sin(2 * Math.PI * 2 * time); // Oscillate between 400Hz and 1200Hz
      const amplitude = 0.3 * Math.sin(2 * Math.PI * frequency * time);
      channelData[i] = amplitude;
    }

    return arrayBuffer;
  }, []);

  // Play siren sound
  const playSiren = useCallback(async (options: AudioAlertOptions = {}) => {
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
  const playSyntheticSiren = useCallback(
    (options: AudioAlertOptions = {}) => {
      try {
        const audioContext = new (window.AudioContext || (window as unknown).webkitAudioContext)();
        const sirenBuffer = generateSirenSound();
        const source = audioContext.createBufferSource();
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
  const speak = useCallback((text: string, options: TextToSpeechOptions = {}) => {
    // Stop any current speech
    if (speechRef.current) {
      speechSynthesis.cancel();
    }

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

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
      const voices = speechSynthesis.getVoices();
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
  const stopSpeech = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Combined emergency alert: siren + speech
  const playEmergencyAlert = useCallback(
    async (message?: string) => {
      const defaultMessage = 'Driver, please check your safety issues and pull over if required.';
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
  const getVoices = useCallback(() => {
    return speechSynthesis.getVoices();
  }, []);

  // Cleanup function
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
