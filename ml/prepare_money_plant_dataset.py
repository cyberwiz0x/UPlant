import random
import shutil
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
SEED = 42

FOLDER_TO_CLASS = {
    "Healthy": "healthy",
    "Yellow Leaf": "yellowing",
    "Un-Healthy": "other_unhealthy",
}


def prepare_dataset(source_dir: str, output_dir: str, max_per_class: int = 0, augment_yellowing_to: int = 500):
    random.seed(SEED)
    source_path = Path(source_dir)
    output_path = Path(output_dir)

    if not source_path.exists():
        raise FileNotFoundError(f"Source dataset does not exist: {source_path}")

    for class_name in set(FOLDER_TO_CLASS.values()):
        (output_path / class_name).mkdir(parents=True, exist_ok=True)

    counts = {}
    for folder_name, class_name in FOLDER_TO_CLASS.items():
        folder_path = source_path / folder_name
        images = [
            path
            for path in folder_path.rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ]
        selected = images
        if max_per_class > 0:
            random.shuffle(selected)
            selected = selected[:max_per_class]

        for index, image_path in enumerate(selected):
            destination = output_path / class_name / f"{folder_name.replace(' ', '_')}_{index:04d}{image_path.suffix.lower()}"
            shutil.copy2(image_path, destination)

        counts[class_name] = len(selected)

    if augment_yellowing_to > counts.get("yellowing", 0):
        counts["yellowing"] = _augment_class(output_path / "yellowing", augment_yellowing_to)

    print(f"Prepared money plant dataset at {output_path}")
    for class_name, count in sorted(counts.items()):
        print(f"{count:5d}  {class_name}")


def _augment_class(class_dir: Path, target_count: int):
    originals = [
        path
        for path in class_dir.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS and "_aug_" not in path.stem
    ]
    if not originals:
        return 0

    current_count = len(list(class_dir.glob("*")))
    index = 0
    while current_count < target_count:
        source = originals[index % len(originals)]
        with Image.open(source) as image:
            image = image.convert("RGB")
            variant = _make_augmented_variant(image, index)
            destination = class_dir / f"{source.stem}_aug_{index:04d}.jpg"
            variant.save(destination, quality=92)
        current_count += 1
        index += 1

    return current_count


def _make_augmented_variant(image: Image.Image, index: int):
    variant = image
    if index % 2 == 0:
        variant = ImageOps.mirror(variant)
    if index % 3 == 0:
        variant = variant.rotate(7, expand=True, fillcolor=(0, 0, 0))
    elif index % 3 == 1:
        variant = variant.rotate(-7, expand=True, fillcolor=(0, 0, 0))

    brightness = 0.9 + (index % 5) * 0.05
    contrast = 0.92 + (index % 4) * 0.06
    variant = ImageEnhance.Brightness(variant).enhance(brightness)
    variant = ImageEnhance.Contrast(variant).enhance(contrast)
    return variant


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", help="Path to Money Plant dataset root")
    parser.add_argument("--output-dir", default="data/money-plant-health")
    parser.add_argument("--max-per-class", type=int, default=0)
    parser.add_argument("--augment-yellowing-to", type=int, default=500)
    args = parser.parse_args()
    prepare_dataset(args.source_dir, args.output_dir, args.max_per_class)
