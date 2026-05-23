import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

PLANTNET_ENDPOINT = "https://my-api.plantnet.org/v2/identify/all"


def identify_plant(image_bytes: bytes):
    api_key = os.getenv("PLANTNET_API_KEY")
    if not api_key:
        return _mock_identification()

    response = requests.post(
        PLANTNET_ENDPOINT,
        params={
            "api-key": api_key,
            "lang": "en",
            "include-related-images": "false",
        },
        files={
            "images": ("plant.jpg", image_bytes, "image/jpeg"),
        },
        data={"organs": "leaf"},
        timeout=30,
    )
    if response.status_code == 401:
        raise RuntimeError(
            "Pl@ntNet rejected the API key. Check backend/.env and copy the key from your Pl@ntNet dashboard."
        )
    response.raise_for_status()

    return _parse_plantnet_response(response.json())


def _parse_plantnet_response(payload: dict):
    suggestions = payload.get("results", [])

    if not suggestions:
        return {
            "commonName": "Unknown plant",
            "scientificName": "Unknown",
            "confidence": 0.0,
        }

    top_match = suggestions[0]
    species = top_match.get("species") or {}
    common_names = species.get("commonNames") or []
    scientific_name = species.get("scientificNameWithoutAuthor") or species.get("scientificName") or "Unknown"

    return {
        "commonName": common_names[0] if common_names else scientific_name,
        "scientificName": scientific_name,
        "confidence": top_match.get("score", 0.0),
    }


def _mock_identification():
    return {
        "commonName": "Golden pothos",
        "scientificName": "Epipremnum aureum",
        "confidence": 0.92,
    }
