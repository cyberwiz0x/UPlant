# UPlant

Phone-first plant health demo for the hackathon.

## Current Status

What works now:

- Expo Go opens the mobile app.
- The phone camera captures a plant photo.
- The app sends the photo to the FastAPI backend.
- The backend calls Pl@ntNet and returns a real plant identification.
- The backend returns rule-based care advice.

What is still mocked:

- Leaf health classification is currently hardcoded in `backend/services/health_model.py`.
- The next ML step is training a model on the Kaggle indoor plant disease dataset and replacing that mock.

Current live pipeline:

```text
phone camera
-> FastAPI /analyze
-> real Pl@ntNet plant identification
-> mocked leaf health label
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

```powershell
.\setup-local.cmd
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

```powershell
ipconfig
```

Look under `Wireless LAN adapter Wi-Fi`, then edit `UPlant/src/config.local.ts`:

```ts
export const API_BASE_URL = 'http://YOUR_WIFI_IPV4:8000';
```

Example:

```ts
export const API_BASE_URL = 'http://10.0.0.69:8000';
```

## Install Dependencies

Backend:

```powershell
cd C:\path\to\UPlant
python -m venv .venv
.\.venv\Scripts\python.exe -m ensurepip --upgrade
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Mobile app:

```powershell
cd C:\path\to\UPlant\UPlant
npm install --legacy-peer-deps
```

## Run The Demo

Terminal 1, from repo root:

```powershell
.\start-backend.cmd
```

Terminal 2, from repo root:

```powershell
.\start-app.cmd
```

Scan the Expo QR code with Expo Go.

If Expo shows stale SDK/cache issues:

```powershell
cd UPlant
npx expo start -c
```

## Test Pl@ntNet With A Local Photo

```powershell
.\.venv\Scripts\python.exe backend\test_plant_id.py C:\path\to\plant-photo.jpg
```

Expected output:

```text
{'commonName': 'Golden pothos', 'scientificName': 'Epipremnum aureum', 'confidence': 0.75}
```

## ML Next Step

Download and inspect the Kaggle dataset:

```powershell
.\.venv\Scripts\python.exe -m pip install -r ml\requirements.txt
.\.venv\Scripts\python.exe ml\download_dataset.py
```

Then map the dataset folders into app-friendly labels like:

- `healthy`
- `yellowing leaves`
- `brown leaf edges`
- `leaf spots`
- `pest damage`

After training, replace `backend/services/health_model.py` so `/analyze` returns a real model prediction.
