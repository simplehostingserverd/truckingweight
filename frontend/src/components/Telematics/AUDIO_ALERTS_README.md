# Audio Alert System for Driver Safety

## Overview

The Audio Alert System provides critical safety notifications to truck drivers through a combination of:
- **Emergency Siren Sound** (SIREN11.wav) - Loud attention-getting alert
- **Text-to-Speech** - Clear spoken safety instructions
- **Customized Messages** - Different messages based on alert type

## Key Features

### 🚨 Emergency Alert Function
```typescript
playEmergencyAlert(message?: string)
```
- Plays siren sound followed by spoken message
- Default message: "Driver, please check your safety issues and pull over if required."
- Customizable messages for different alert types

### 🔊 Audio Components

1. **Siren Sound**
   - File: `/sounds/emergency-siren.wav` (SIREN11.wav)
   - Fallback: Synthetic siren using Web Audio API
   - Volume: Configurable (default 70%)

2. **Text-to-Speech**
   - Uses browser's Speech Synthesis API
   - Rate: 0.8 (slower for emergency clarity)
   - Pitch: 1.1 (slightly higher for urgency)
   - Volume: 90%

### 📱 Integration with DriverAlertSystem

The `DriverAlertSystem` component automatically plays audio alerts when:
- Alert severity is `critical` or `emergency`
- Alert has `soundAlert: true`
- Sound is enabled by driver
- Alert hasn't been played before

### 🎯 Customized Safety Messages

- **Brake System**: "Driver, brake system alert detected. Please check your brakes and pull over safely if required."
- **Electrical System**: "Driver, electrical system alert detected. Please check your lights and pull over safely if required."
- **Tire System**: "Driver, tire system alert detected. Please check your tires and pull over safely if required."
- **Engine System**: "Driver, engine alert detected. Please check your engine and pull over safely if required."
- **General**: "Driver, please check your safety issues and pull over if required."

## Usage Example

```typescript
import { useAudioAlerts } from '@/hooks/useAudioAlerts';

function MyComponent() {
  const { playEmergencyAlert, isPlaying, isSpeaking } = useAudioAlerts();

  const handleCriticalAlert = () => {
    playEmergencyAlert("Driver, brake lights have failed. Pull over immediately.");
  };

  return (
    <button 
      onClick={handleCriticalAlert}
      disabled={isPlaying || isSpeaking}
    >
      Test Emergency Alert
    </button>
  );
}
```

## Browser Compatibility

- **Audio File Support**: Modern browsers supporting HTML5 Audio
- **Speech Synthesis**: Chrome, Firefox, Safari, Edge
- **Web Audio API**: For synthetic siren fallback

## File Structure

```
frontend/
├── public/sounds/
│   └── emergency-siren.wav     # Main siren sound file
├── src/hooks/
│   └── useAudioAlerts.ts       # Audio alerts hook
├── src/components/Telematics/
│   ├── DriverAlertSystem.tsx   # Main driver alert component
│   ├── AudioAlertTest.tsx      # Test component
│   └── AUDIO_ALERTS_README.md  # This file
```

## Testing

Use the `AudioAlertTest` component to test all audio functionality:
- Emergency alerts with different messages
- Individual siren and speech testing
- Audio state monitoring

## Safety Compliance

This system helps meet safety requirements by:
- Providing immediate audio warnings for critical mechanical issues
- Using clear, spoken instructions in English
- Ensuring drivers are alerted to pull over when safety is compromised
- Supporting the top 5 mechanical issues that cause truck accidents

## Notes

- Audio alerts require user interaction to start (browser security)
- Volume levels are optimized for in-cab use
- Fallback systems ensure alerts work even if audio files fail
- All audio can be disabled by the driver if needed
