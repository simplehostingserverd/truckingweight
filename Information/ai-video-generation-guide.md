<!--

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
 

-->

# AI Video Generation Guide

This guide will help you create an AI-generated video for the Trucking Weight Management System using Hugging Face models and other AI tools.

## Option 1: Using Hugging Face Models

### Step 1: Text-to-Speech Generation
Use a text-to-speech model to convert the script into natural-sounding speech.

**Recommended Models:**
- [Microsoft SpeechT5](https://huggingface.co/microsoft/speecht5_tts)
- [XTTS v2](https://huggingface.co/coqui/XTTS-v2)
- [MMS TTS](https://huggingface.co/facebook/mms-tts)

**Example Code:**
```python
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
import torch
import soundfile as sf
from datasets import load_dataset

# Load the model and processor
processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")

# Load xvector containing speaker's voice characteristics
embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
speaker_embeddings = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0)

# Process the text
with open("ai-video-script.md", "r") as f:
    script = f.read()

inputs = processor(text=script, return_tensors="pt")
speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)

# Save the audio file
sf.write("ai_speech.wav", speech.numpy(), samplerate=16000)
```

### Step 2: Avatar Generation
Use an AI avatar generator to create a virtual presenter.

**Recommended Tools:**
- [D-ID](https://www.d-id.com/)
- [Synthesia](https://www.synthesia.io/)
- [HeyGen](https://www.heygen.com/)
- [Hugging Face Diffusion Models](https://huggingface.co/models?pipeline_tag=text-to-image)

### Step 3: Video Generation
Combine the avatar with the speech audio.

**Option A: Using D-ID API:**
```python
import requests
import json

url = "https://api.d-id.com/talks"

payload = {
    "script": {
        "type": "audio",
        "audio_url": "https://your-server.com/ai_speech.wav"
    },
    "presenter_id": "presenter-1",
    "driver_id": "driver-1"
}

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": "Basic YOUR_API_KEY"
}

response = requests.post(url, json=payload, headers=headers)
print(response.text)
```

**Option B: Using Hugging Face Video Generation Models:**
- [ModelScope Text-to-Video](https://huggingface.co/damo-vilab/text-to-video-ms-1.7b)
- [Stable Video Diffusion](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt)

## Option 2: Using All-in-One AI Video Platforms

Several platforms offer end-to-end AI video generation with virtual presenters:

1. **Synthesia** (https://www.synthesia.io/)
   - Upload your script
   - Select an AI avatar
   - Generate the video with synchronized lip movements

2. **HeyGen** (https://www.heygen.com/)
   - Offers customizable AI avatars
   - Supports multiple languages
   - Provides studio-quality video output

3. **Elai.io** (https://elai.io/)
   - Specializes in business presentations
   - Offers customizable backgrounds and scenes

4. **Hour One** (https://hourone.ai/)
   - Creates realistic human presenters
   - Good for professional business videos

## Option 3: Using Hugging Face Spaces

You can also use pre-built Hugging Face Spaces that combine multiple models:

1. **Talking Head Generation**:
   - [Wav2Lip](https://huggingface.co/spaces/fcakyon/wav2lip-demo)
   - [SadTalker](https://huggingface.co/spaces/vinthony/SadTalker)

2. **Text-to-Video Generation**:
   - [ModelScope Text-to-Video](https://huggingface.co/spaces/damo-vilab/modelscope-text-to-video-synthesis)

## Recommended Approach

For the best quality with minimal technical complexity:

1. Use Microsoft SpeechT5 or XTTS v2 to generate natural-sounding speech from your script
2. Use HeyGen or Synthesia to create a professional AI presenter video
3. Add B-roll footage of trucks, weigh stations, and dashboard screenshots
4. Add captions and graphics to highlight key points
5. Add background music to enhance engagement

## Resources

- Script: `/Information/ai-video-script.md`
- Recommended video length: 2-3 minutes
- Aspect ratio: 16:9 (1920x1080)
- Format: MP4 with H.264 encoding
