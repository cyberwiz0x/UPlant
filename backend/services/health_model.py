def predict_leaf_health(image_bytes: bytes):
    """Temporary mock. Bit 3 will load the trained indoor disease model."""
    return {
        "status": "mild issue",
        "condition": "yellowing leaves",
        "confidence": 0.84,
    }
