'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakerWaveIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AudioAlertTest() {
  // Audio alerts hook - import the hook dynamically for now
  const { useAudioAlerts } = require('@/hooks/useAudioAlerts');
  const { playEmergencyAlert, playSiren, speak, isPlaying, isSpeaking, cleanup } = useAudioAlerts();

  const testEmergencyAlert = () => {
    playEmergencyAlert("Driver, please check your safety issues and pull over if required.");
  };

  const testBrakeAlert = () => {
    playEmergencyAlert("Driver, brake system alert detected. Please check your brakes and pull over safely if required.");
  };

  const testElectricalAlert = () => {
    playEmergencyAlert("Driver, electrical system alert detected. Please check your lights and pull over safely if required.");
  };

  const testSirenOnly = () => {
    playSiren({ volume: 0.7 });
  };

  const testSpeechOnly = () => {
    speak("Driver, please check your safety issues and pull over if required.", {
      rate: 0.8,
      volume: 0.9,
      pitch: 1.1,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SpeakerWaveIcon className="h-6 w-6 mr-2" />
            Audio Alert System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <Badge variant={isPlaying ? "destructive" : "secondary"}>
              Siren: {isPlaying ? "Playing" : "Stopped"}
            </Badge>
            <Badge variant={isSpeaking ? "destructive" : "secondary"}>
              Speech: {isSpeaking ? "Speaking" : "Silent"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-red-700">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Emergency Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testEmergencyAlert}
                  variant="destructive"
                  className="w-full"
                  disabled={isPlaying || isSpeaking}
                >
                  Test General Emergency Alert
                </Button>
                <Button 
                  onClick={testBrakeAlert}
                  variant="destructive"
                  className="w-full"
                  disabled={isPlaying || isSpeaking}
                >
                  Test Brake System Alert
                </Button>
                <Button 
                  onClick={testElectricalAlert}
                  variant="destructive"
                  className="w-full"
                  disabled={isPlaying || isSpeaking}
                >
                  Test Electrical System Alert
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-blue-700">
                  <SpeakerWaveIcon className="h-5 w-5 mr-2" />
                  Individual Components
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testSirenOnly}
                  variant="outline"
                  className="w-full"
                  disabled={isPlaying}
                >
                  Test Siren Only
                </Button>
                <Button 
                  onClick={testSpeechOnly}
                  variant="outline"
                  className="w-full"
                  disabled={isSpeaking}
                >
                  Test Speech Only
                </Button>
                <Button 
                  onClick={cleanup}
                  variant="secondary"
                  className="w-full"
                >
                  Stop All Audio
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              🔊 Audio Alert Features:
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• <strong>Emergency Siren:</strong> Loud attention-getting sound (SIREN11.wav)</li>
              <li>• <strong>Text-to-Speech:</strong> Clear spoken safety instructions</li>
              <li>• <strong>Customized Messages:</strong> Different messages for different alert types</li>
              <li>• <strong>Fallback Support:</strong> Synthetic siren if audio file fails to load</li>
              <li>• <strong>Browser Compatibility:</strong> Works with Web Audio API and Speech Synthesis</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
              ⚠️ Safety Message:
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              "Driver, please check your safety issues and pull over if required."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
