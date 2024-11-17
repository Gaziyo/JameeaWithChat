import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor
import numpy as np
from pydub import AudioSegment
import io

class SpeechHandler:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Initialize speech-to-text model
        self.processor = AutoProcessor.from_pretrained("openai/whisper-large-v3")
        self.speech_to_text = AutoModelForSpeechSeq2Seq.from_pretrained("openai/whisper-large-v3")
        self.speech_to_text.to(self.device)
        
        # Initialize text-to-speech model
        self.tts_model = AutoModelForSpeechSeq2Seq.from_pretrained("facebook/mms-tts-eng")
        self.tts_model.to(self.device)

    async def speech_to_text(self, audio_data: bytes) -> str:
        # Convert audio bytes to numpy array
        audio = AudioSegment.from_file(io.BytesIO(audio_data))
        audio_array = np.array(audio.get_array_of_samples())
        
        # Process audio
        inputs = self.processor(audio_array, return_tensors="pt", sampling_rate=16000).to(self.device)
        generated_ids = self.speech_to_text.generate(**inputs)
        transcription = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        return transcription

    async def text_to_speech(self, text: str) -> bytes:
        # Generate speech
        inputs = self.processor(text=text, return_tensors="pt").to(self.device)
        speech = self.tts_model.generate_speech(**inputs)
        
        # Convert to audio bytes
        audio_segment = AudioSegment(
            speech.cpu().numpy(),
            frame_rate=16000,
            sample_width=2,
            channels=1
        )
        
        buffer = io.BytesIO()
        audio_segment.export(buffer, format="wav")
        return buffer.getvalue()