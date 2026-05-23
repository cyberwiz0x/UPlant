from pathlib import Path

from PIL import Image

CLASS_MAP = {
    0: "healthy",
    1: "unhealthy",
}
IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]


def crop_yolo_dataset(dataset_dir: str, output_dir: str):
    dataset_path = Path(dataset_dir)
    output_path = Path(output_dir)

    for class_name in CLASS_MAP.values():
        (output_path / class_name).mkdir(parents=True, exist_ok=True)

    total_crops = 0
    for split in ["train", "valid", "test"]:
        images_dir = dataset_path / split / "images"
        labels_dir = dataset_path / split / "labels"
        if not images_dir.exists() or not labels_dir.exists():
            continue

        for label_path in labels_dir.glob("*.txt"):
            image_path = _find_image(images_dir, label_path.stem)
            if not image_path:
                continue

            with Image.open(image_path) as image:
                image = image.convert("RGB")
                width, height = image.size

                for box_index, line in enumerate(label_path.read_text(encoding="utf-8").splitlines()):
                    parts = line.split()
                    if len(parts) != 5:
                        continue

                    class_id = int(float(parts[0]))
                    class_name = CLASS_MAP.get(class_id)
                    if not class_name:
                        continue

                    x_center, y_center, box_width, box_height = map(float, parts[1:])
                    crop_box = _to_pixel_box(x_center, y_center, box_width, box_height, width, height)
                    crop = image.crop(crop_box)
                    crop_name = f"{split}_{label_path.stem}_{box_index}.jpg"
                    crop.save(output_path / class_name / crop_name, quality=92)
                    total_crops += 1

    print(f"Wrote {total_crops} crops to {output_path}")
    for class_name in CLASS_MAP.values():
        count = len(list((output_path / class_name).glob("*.jpg")))
        print(f"{count:5d}  {class_name}")


def _find_image(images_dir: Path, stem: str):
    for extension in IMAGE_EXTENSIONS:
        image_path = images_dir / f"{stem}{extension}"
        if image_path.exists():
            return image_path
    return None


def _to_pixel_box(x_center: float, y_center: float, box_width: float, box_height: float, width: int, height: int):
    left = int((x_center - box_width / 2) * width)
    top = int((y_center - box_height / 2) * height)
    right = int((x_center + box_width / 2) * width)
    bottom = int((y_center + box_height / 2) * height)

    return (
        max(0, left),
        max(0, top),
        min(width, right),
        min(height, bottom),
    )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("dataset_dir", help="Path to YOLO dataset root containing data.yaml")
    parser.add_argument("--output-dir", default="data/leaf-health-crops")
    args = parser.parse_args()
    crop_yolo_dataset(args.dataset_dir, args.output_dir)
