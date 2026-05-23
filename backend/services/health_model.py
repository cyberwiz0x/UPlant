from functools import lru_cache
from io import BytesIO
from pathlib import Path
import colorsys

import numpy as np
from PIL import Image
import tensorflow as tf

IMAGE_SIZE = (224, 224)
MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "leaf-health"
MODEL_CONFIDENCE_THRESHOLD = 0.7


def predict_leaf_health(image_bytes: bytes):
    symptom_scores = _detect_leaf_color_symptoms(image_bytes)

    if not MODEL_PATH.exists():
        return _fallback_prediction(symptom_scores)

    model, class_names = _load_model()
    image_batch = _prepare_image(image_bytes)
    prediction = model.serve(image_batch).numpy()[0]
    predicted_index = int(np.argmax(prediction))
    predicted_class = class_names[predicted_index]
    confidence = float(prediction[predicted_index])

    if predicted_class == "healthy":
        if confidence < MODEL_CONFIDENCE_THRESHOLD:
            return {
                "status": "uncertain",
                "condition": "uncertain leaf health",
                "confidence": confidence,
                "signals": symptom_scores,
            }

        return {
            "status": "healthy",
            "condition": "healthy",
            "confidence": confidence,
            "signals": symptom_scores,
        }

    return {
        "status": "unhealthy",
        "condition": "unhealthy leaves",
        "confidence": confidence,
        "signals": symptom_scores,
    }


@lru_cache(maxsize=1)
def _load_model():
    model = tf.saved_model.load(str(MODEL_PATH))
    class_names = (MODEL_PATH / "classes.txt").read_text(encoding="utf-8").splitlines()
    return model, class_names


def _prepare_image(image_bytes: bytes):
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMAGE_SIZE)
    image_array = np.asarray(image, dtype=np.float32)
    return np.expand_dims(image_array, axis=0)


def _detect_leaf_color_symptoms(image_bytes: bytes):
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image.thumbnail((480, 480))
    pixels = np.asarray(image, dtype=np.uint8).reshape(-1, 3)

    green_mask = []
    yellow_mask = []
    brown_mask = []

    for red, green, blue in pixels:
        hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
        hue_degrees = hue * 360

        is_colored_leaf_pixel = saturation > 0.22 and value > 0.18
        is_green = is_colored_leaf_pixel and 55 <= hue_degrees <= 170
        is_yellow = is_colored_leaf_pixel and 28 <= hue_degrees < 70 and red > 95 and green > 75
        is_brown = saturation > 0.2 and 10 <= hue_degrees < 38 and 0.14 < value < 0.75

        green_mask.append(is_green)
        yellow_mask.append(is_yellow)
        brown_mask.append(is_brown)

    green_count = int(np.sum(green_mask))
    yellow_count = int(np.sum(yellow_mask))
    brown_count = int(np.sum(brown_mask))
    leaf_like_count = max(1, green_count + yellow_count + brown_count)

    return {
        "yellowRatio": yellow_count / leaf_like_count,
        "brownRatio": brown_count / leaf_like_count,
        "leafPixelCount": leaf_like_count,
    }


def _fallback_prediction(symptom_scores: dict):
    return {
        "status": "unknown",
        "condition": "model not trained",
        "confidence": 0.0,
        "signals": symptom_scores,
    }
