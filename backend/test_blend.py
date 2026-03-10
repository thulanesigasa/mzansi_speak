from kokoro_onnx import Kokoro
import soundfile as sf
import json

kokoro = Kokoro("data/models/kokoro-v1.0.onnx", "data/models/voices.json")
try:
    samples, sample_rate = kokoro.create(
        "sawubona",
        voice=[("af_bella", 0.5), ("af_nicole", 0.5)],
        speed=1.0,
        lang="en-us",
    )
    print("Blend SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()

try:
    samples, sample_rate = kokoro.create(
        "sawubona",
        voice="af_sarah",
        speed=1.0,
        lang="en-gb",
    )
    print("Single SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
