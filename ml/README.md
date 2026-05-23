# UPlant ML

Training workspace for the leaf health classifier.

## First ML Goal

Use the Kaggle healthy-vs-unhealthy indoor plant leaf dataset:

```text
gauravsaklani00/indoor-plant-leaf-health-dataset
```

This is a better first model than detailed disease diagnosis because the app currently needs a
simple live health signal:

```text
leaf image -> healthy / unhealthy
```

Later, we can upgrade from binary health classification to symptom classes such as yellowing,
brown edges, leaf spots, or pest damage.

## Download With KaggleHub

From the repo root:

```powershell
.\.venv\Scripts\python.exe -m pip install -r ml\requirements.txt
.\.venv\Scripts\python.exe ml\download_dataset.py
```

The script defaults to:

```text
gauravsaklani00/indoor-plant-leaf-health-dataset
```

It prints the local Kaggle cache path plus image counts for each folder.

## Inspect Another Dataset

To inspect the older disease dataset instead:

```powershell
.\.venv\Scripts\python.exe ml\download_dataset.py --dataset abdulahad0296/indoor-plant-disease-detection-dataset
```

## Train Baseline Model

After the downloader prints the dataset path, run:

```powershell
.\.venv\Scripts\python.exe ml\train_health_model.py "PASTE_DATASET_PATH_HERE"
```

## Optional: Add Roboflow YOLO Crops

This is experimental. In local testing, the Roboflow crops made the model more aggressive about
predicting `unhealthy` on real houseplant photos, so the recommended demo model is Kaggle-only.

If you still want to experiment, download the Roboflow healthy/unhealthy dataset as YOLOv8 and
unzip it under:

```text
data/roboflow-healthy-unhealthy
```

Convert YOLO bounding boxes into classifier crops:

```powershell
.\.venv\Scripts\python.exe ml\crop_yolo_dataset.py data\roboflow-healthy-unhealthy --output-dir data\leaf-health-crops
```

Merge the Roboflow crops with the Kaggle classification dataset:

```powershell
.\.venv\Scripts\python.exe ml\merge_classification_datasets.py --output-dir data\leaf-health-combined data\leaf-health-crops "C:\Users\primi\.cache\kagglehub\datasets\gauravsaklani00\indoor-plant-leaf-health-dataset\versions\1\indoor-plant-dataset"
```

Retrain on the combined dataset:

```powershell
.\.venv\Scripts\python.exe ml\train_health_model.py data\leaf-health-combined
```

The script trains MobileNetV2 transfer learning and exports:

```text
models/leaf-health/
  classes.txt
  saved_model files
```

## Backend Contract

The backend expects `backend/services/health_model.py` to return:

```json
{
  "status": "healthy",
  "condition": "healthy",
  "confidence": 0.92
}
```

or:

```json
{
  "status": "unhealthy",
  "condition": "unhealthy leaves",
  "confidence": 0.86
}
```

For the demo, care advice can map `unhealthy leaves` to broad guidance:

- check watering and drainage
- inspect undersides of leaves for pests
- move to bright indirect light
- track new yellowing, brown edges, and spots
