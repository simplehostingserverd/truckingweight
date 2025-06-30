/*
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { 
  MicrophoneIcon as MicrophoneIconSolid
} from '@heroicons/react/24/solid';

interface VoiceInputProps {
  onVoiceCommand: (command: string, transcript: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  disabled?: boolean;
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceInput({ onVoiceCommand, onTranscriptUpdate, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        startAudioLevelMonitoring();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioLevelMonitoring();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          if (result.isFinal) {
            finalTranscript += transcript;
            maxConfidence = Math.max(maxConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        setConfidence(maxConfidence);
        
        if (onTranscriptUpdate) {
          onTranscriptUpdate(fullTranscript);
        }

        // Process final transcript for commands
        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setError(event.error);
        setIsListening(false);
        stopAudioLevelMonitoring();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopAudioLevelMonitoring();
    };
  }, []);

  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255 * 100);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioLevelMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Define voice commands
    const commands = {
      'report hazard': 'REPORT_HAZARD',
      'take break': 'TAKE_BREAK',
      'start break': 'TAKE_BREAK',
      'update status': 'UPDATE_STATUS',
      'call dispatch': 'CALL_DISPATCH',
      'emergency': 'EMERGENCY',
      'help': 'EMERGENCY',
      'check weight': 'CHECK_WEIGHT',
      'current location': 'GET_LOCATION',
      'fuel status': 'CHECK_FUEL',
      'vehicle status': 'CHECK_VEHICLE'
    };

    // Find matching command
    let matchedCommand = null;
    for (const [phrase, command] of Object.entries(commands)) {
      if (lowerText.includes(phrase)) {
        matchedCommand = command;
        break;
      }
    }

    if (matchedCommand) {
      onVoiceCommand(matchedCommand, text);
      
      // Provide audio feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Command received');
        utterance.volume = 0.5;
        utterance.rate = 1.2;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || disabled) return;
    
    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
      
      // Auto-stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);
    } catch (error) {
      setError('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-gray-600 rounded-full p-4 shadow-lg">
          <MicrophoneIcon className="w-6 h-6 text-gray-400" />
          <div className="absolute -top-12 left-0 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
            Voice not supported
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative">
        {/* Audio Level Indicator */}
        {isListening && (
          <div className="absolute inset-0 rounded-full">
            <div 
              className="absolute inset-0 rounded-full bg-blue-500 opacity-30 transition-all duration-100"
              style={{ 
                transform: `scale(${1 + (audioLevel / 100) * 0.5})`,
                opacity: 0.3 + (audioLevel / 100) * 0.4
              }}
            ></div>
          </div>
        )}
        
        {/* Voice Input Button */}
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`
            relative w-16 h-16 rounded-full shadow-lg transition-all duration-200
            ${disabled 
              ? 'bg-gray-600 cursor-not-allowed' 
              : isListening 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            }
            border-2 border-white
            focus:outline-none focus:ring-4 focus:ring-blue-300
          `}
        >
          {isListening ? (
            <StopIcon className="w-8 h-8 text-white mx-auto" />
          ) : (
            <MicrophoneIconSolid className="w-8 h-8 text-white mx-auto" />
          )}
        </button>
        
        {/* Status Indicator */}
        {isListening && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span>Listening...</span>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
            Error: {error}
          </div>
        )}
        
        {/* Transcript Display */}
        {transcript && (
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg max-w-xs">
            <div className="text-center">
              <div className="font-medium">{transcript}</div>
              {confidence > 0 && (
                <div className="text-gray-400 mt-1">
                  Confidence: {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        {!isListening && !transcript && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200">
            Tap to speak
          </div>
        )}
      </div>
      
      {/* Voice Commands Help */}
      {isListening && (
        <div className="absolute -right-4 top-0 bg-gray-800 text-white text-xs p-3 rounded-lg w-48">
          <div className="font-medium mb-2">Voice Commands:</div>
          <div className="space-y-1 text-gray-300">
            <div>• "Report hazard"</div>
            <div>• "Take break"</div>
            <div>• "Update status"</div>
            <div>• "Call dispatch"</div>
            <div>• "Check weight"</div>
            <div>• "Emergency"</div>
          </div>
        </div>
      )}
    </div>
  );
}