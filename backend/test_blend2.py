from kokoro_onnx import Kokoro
import soundfile as sf
import json
import numpy as np

kokoro = Kokoro("data/models/kokoro-v1.0.onnx", "data/models/voices.json")
try:
    style1 = kokoro.get_voice_style("af_bella")
    style2 = kokoro.get_voice_style("af_nicole")
    blended_style = (style1 * 0.5) + (style2 * 0.5)
    
    samples, sample_rate = kokoro.create(
        "sawubona",
        voice=blended_style,
        speed=1.0,
        lang="en-us",
    )
    print("Blend SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
