import os
import logging
import scipy.io.wavfile as wavfile
from kokoro_onnx import Kokoro

logger = logging.getLogger(__name__)

OUTPUT_DIR = os.path.join("data", "outputs")


class KokoroClient:
    def __init__(self, model_path: str, voices_path: str):
        self.model_path = model_path
        self.voices_path = voices_path
        self.kokoro = None

        # Ensure the output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Validate model files before loading
        if not os.path.exists(model_path):
            logger.error(
                "Model file not found at '%s'. "
                "Download kokoro-v1.0.onnx from the Kokoro-82M HuggingFace repo "
                "and place it in data/models/.",
                model_path,
            )
            return

        if not os.path.exists(voices_path):
            logger.error(
                "Voices file not found at '%s'. "
                "Download voices.bin from the Kokoro-82M HuggingFace repo "
                "and place it in data/models/.",
                voices_path,
            )
            return

        try:
            self.kokoro = Kokoro(model_path, voices_path)
            logger.info("Kokoro ONNX model loaded successfully.")
        except Exception as exc:
            logger.error("Failed to initialize Kokoro model: %s", exc)

    def generate(self, text: str, voice_id: str, output_path: str) -> bool:
        """
        Synthesize text to audio and save as .wav in data/outputs/.
        Returns True on success, False on failure.
        """
        if not self.kokoro:
            logger.warning("Generate called but model is not loaded.")
            return False

        try:
            samples, sample_rate = self.kokoro.create(
                text,
                voice=voice_id,
                speed=1.0,
                lang="en-us",
            )
            wavfile.write(output_path, sample_rate, samples)
            logger.info("Audio written to %s", output_path)
            return True
        except Exception as exc:
            logger.error("Error during synthesis: %s", exc)
            return False

    def is_ready(self) -> bool:
        return self.kokoro is not None
