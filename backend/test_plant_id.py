from pathlib import Path

from services.plant_id import identify_plant


def main(image_path: str):
    path = Path(image_path)
    result = identify_plant(path.read_bytes())
    print(result)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("image_path", help="Path to a plant image")
    args = parser.parse_args()
    main(args.image_path)
