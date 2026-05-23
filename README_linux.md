# UPlant

Phone-first plant health demo for the hackathon.

## Current Status

What works now:

- Expo Go opens the mobile app.
- The phone camera captures a plant photo.
- The app sends the photo to the FastAPI backend.
- The backend calls Pl@ntNet and returns a real plant identification.
- The backend can load a trained healthy-vs-unhealthy TensorFlow model from `models/leaf-health`.
- The backend returns rule-based care advice.

What still needs work:

- If `models/leaf-health` is missing, the backend returns a `model not trained` fallback.
- The current model only predicts `healthy` vs `unhealthy`.
- Detailed symptom diagnosis, such as yellowing, brown edges, spots, or pests, is a later model upgrade.

Current live pipeline:

```text
phone camera
-> FastAPI /analyze
-> real Pl@ntNet plant identification
-> trained healthy/unhealthy leaf model, if available
-> rule-based care advice
-> Expo result screen
```

## Project Layout

- `UPlant/`: Expo mobile app.
- `backend/`: FastAPI service for plant ID, health inference, and care rules.
- `ml/`: Kaggle dataset download/training workspace.

## Requirements

- Node.js 20.19.4 or newer is recommended.
- Python 3.11.
- Expo Go 54.x on iOS for the current project version.
- A Pl@ntNet API key.
- Phone and laptop on the same Wi-Fi network.

## First-Time Setup

From the repo root:

```console
./setup-local.sh
```

This creates local-only files:

- `backend/.env`
- `UPlant/src/config.local.ts`

These files are ignored by git.

## Configure Backend API Key

Edit `backend/.env`:

```text
PLANTNET_API_KEY=your-plantnet-key
```

## Configure Mobile App Backend URL

Find your computer Wi-Fi IPv4 address:

```console
ip a
```

Look for something like `wlo1`, `wlp1s0` or something similar, or `eno1`, `enp1s0` for ethernet,
then edit `UPlant/src/config.local.ts`:

```ts
export const API_BASE_URL = 'http://YOUR_WIFI_IPV4:8000';
```

Example:

```ts
export const API_BASE_URL = 'http://10.0.0.69:8000';
```

## Install Dependencies

Backend:

```console
cd /path/to/UPlant
python -m venv .venv
source .venv/bin/activate
python3 -m ensurepip --upgrade
python3 -m pip install --upgrade pip
python3 -m pip install -r backend/requirements.txt
deactivate
```

Mobile app:

```console
cd /path/to/UPlant/UPlant
npm install --legacy-peer-deps
```

## Train The Leaf Health Model

The trained model is intentionally not committed because `models/` is ignored. Each teammate should
train it locally before running the full demo:

```console
cd /path/to/UPlant/UPlant
source .venv/bin/activate
python -m pip install -r ml/requirements.txt
python ml/download_dataset.py
python ml/train_health_model.py "/home/yourusername/.cache/kagglehub/datasets/gauravsaklani00/indoor-plant-leaf-health-dataset/versions/1/indoor-plant-dataset"
deactivate
```

The training command creates:

```text
models/leaf-health/
```

Restart the backend after training so `/analyze` loads the new model.

## Run The Demo

Terminal 1, from repo root:

```console
./start-backend.sh
```

Terminal 2, from repo root:

```console
./start-app.sh
```

Scan the Expo QR code with Expo Go.

If Expo shows stale SDK/cache issues:

```console
cd UPlant
npx expo start -c
```

## Test Pl@ntNet With A Local Photo

```console
./.venv/bin/python backend/test_plant_id.py /path/to/plant-photo.jpg
```

Expected output:

```text
{'commonName': 'Golden pothos', 'scientificName': 'Epipremnum aureum', 'confidence': 0.75}
```

## ML Next Step

Download and inspect the Kaggle healthy-vs-unhealthy leaf dataset:

```console
source .venv/bin/activate
python.exe -m pip install -r ml/requirements.txt
python.exe ml/download_dataset.py
deactivate
```

Then map the dataset folders into app-friendly labels like:

- `healthy`
- `unhealthy leaves`

After training, restart the backend so `/analyze` loads the model from `models/leaf-health`.
More detailed labels like `yellowing leaves`, `brown leaf edges`, `leaf spots`, and `pest damage`
can come after the binary model works.
