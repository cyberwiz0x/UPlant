# UPlant ML

Training workspace for the Kaggle indoor plant disease detection dataset.

## Bit 2 goal

Inspect the dataset folder names and decide the final class labels. The health model should start
simple:

- `healthy`
- `yellowing leaves`
- `brown leaf edges`
- `leaf spots`
- `pest damage`
- `other issue`

If the Kaggle dataset uses more specific labels, map them into these demo-friendly categories.

## Download with KaggleHub

From `C:\Users\primi\OneDrive\Desktop\code\UPlant`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ml\requirements.txt
python ml\download_dataset.py
```

The script prints the local Kaggle cache path plus image counts for each folder. That folder path is
what you pass into training later.

## Download as zip

If you download a zip from Kaggle instead, unzip it somewhere like:

```text
C:\Users\primi\OneDrive\Desktop\code\UPlant\data\indoor-plant-disease-detection
```

Then inspect the folders:

```powershell
Get-ChildItem data\indoor-plant-disease-detection -Directory -Recurse -Depth 4
```

## Bit 3 goal

Train a transfer-learning image classifier:

- MobileNetV2 or EfficientNetB0
- 224x224 input images
- train/validation split
- export saved model for the backend

The backend contract expects:

```json
{
  "status": "mild issue",
  "condition": "yellowing leaves",
  "confidence": 0.84
}
```
