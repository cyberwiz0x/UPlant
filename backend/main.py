from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .services.care_rules import get_care_recommendation
from .services.health_model import predict_leaf_health
from .services.plant_id import identify_plant

app = FastAPI(title="UPlant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"ok": True}


@app.post("/analyze")
async def analyze(image: UploadFile):
    image_bytes = await image.read()

    plant = identify_plant(image_bytes)
    health = predict_leaf_health(image_bytes)
    care = get_care_recommendation(
        plant_name=plant["commonName"],
        condition=health["condition"],
    )

    return {
        "plant": plant,
        "health": health,
        "care": care,
    }
