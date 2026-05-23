CARE_RULES = {
    "yellowing leaves": {
        "diagnosis": "Yellowing often points to overwatering, low light, or poor drainage.",
        "fixes": [
            "Let the top 1-2 inches of soil dry before watering.",
            "Check that the pot drains fully after watering.",
            "Move the plant to bright indirect light.",
        ],
        "track": ["watering dates", "soil moisture", "new yellow leaves", "new growth"],
    },
    "brown leaf edges": {
        "diagnosis": "Brown edges can come from low humidity, inconsistent watering, or harsh sun.",
        "fixes": [
            "Keep the plant in bright indirect light.",
            "Water deeply when the top soil is dry.",
            "Increase humidity if new leaves keep crisping.",
        ],
        "track": ["humidity", "soil dryness", "new brown edges", "leaf uncurling"],
    },
    "leaf spots": {
        "diagnosis": "Spots may be fungal, bacterial, or caused by water sitting on leaves.",
        "fixes": [
            "Remove badly affected leaves with clean shears.",
            "Avoid wetting leaves when watering.",
            "Improve airflow and isolate the plant if spots spread.",
        ],
        "track": ["new spots", "spot size", "watering dates", "nearby plant symptoms"],
    },
    "healthy": {
        "diagnosis": "The visible leaves look healthy.",
        "fixes": [
            "Keep care consistent.",
            "Rotate the plant weekly for even light.",
            "Check soil moisture before watering.",
        ],
        "track": ["watering dates", "new growth", "soil moisture"],
    },
}


def get_care_recommendation(plant_name: str, condition: str):
    rule = CARE_RULES.get(condition, CARE_RULES["healthy"])
    return {
        "diagnosis": rule["diagnosis"],
        "fixes": rule["fixes"],
        "track": rule["track"],
        "plantContext": f"Advice tuned for {plant_name}.",
    }
