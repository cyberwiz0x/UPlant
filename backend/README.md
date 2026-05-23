# UPlant Backend

FastAPI service for the hackathon demo.

## Target endpoint

`POST /analyze`

Input:

- `image`: camera frame from the Expo app

Output:

```json
{
  "plant": {
    "commonName": "Golden pothos",
    "scientificName": "Epipremnum aureum",
    "confidence": 0.92
  },
  "health": {
    "status": "mild issue",
    "condition": "yellowing leaves",
    "confidence": 0.84
  },
  "care": {
    "diagnosis": "Yellowing often points to overwatering, low light, or poor drainage.",
    "fixes": ["Let the top 1-2 inches of soil dry before watering."],
    "track": ["watering dates", "soil moisture", "new yellow leaves"]
  }
}
```

## Planned services

- `plant_id.py`: calls Plant.id or Pl@ntNet.
- `health_model.py`: runs the Kaggle-trained image classifier.
- `care_rules.py`: maps health labels to plain-language fixes and tracking fields.

## Pl@ntNet setup

Create `backend/.env`:

```text
PLANTNET_API_KEY=your-key-here
```

Test with a local plant photo:

```powershell
pip install -r backend\requirements.txt
python backend\test_plant_id.py C:\path\to\plant-photo.jpg
```
