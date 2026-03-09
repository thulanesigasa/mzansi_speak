import os
import scipy.io.wavfile as wavfile
from kokoro_onnx import Kokoro

class KokoroClient:
    def __init__(self, model_path: str, voices_path: str):
        self.model_path = model_path
        self.voices_path = voices_path
        self.kokoro = None
        if os.path.exists(model_path) and os.path.exists(voices_path):
            self.kokoro = Kokoro(model_path, voices_path)
    
    def generate(self, text: str, voice_id: str, output_path: str):
        """
        Synthesize text to audio and save as .wav in data/outputs/.
        """
        if not self.kokoro:
            return False
            
        try:
            samples, sample_rate = self.kokoro.create(
                text, 
                voice=voice_id, 
                speed=1.0, 
                lang="en-us" # Defaulting for now
            )
            wavfile.write(output_path, sample_rate, samples)
            return True
        except Exception as e:
            print(f"Error during synthesis: {e}")
            return False

    def is_ready(self):
        return self.kokoro is not None

