import shutil
from pathlib import Path

CLASS_MAP = {
    "healthy": "healthy",
    "unhealthy": "unhealthy",
    "Healthy": "healthy",
    "Unhealthy": "unhealthy",
}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def merge_datasets(output_dir: str, input_dirs: list[str]):
    output_path = Path(output_dir)
    for class_name in {"healthy", "unhealthy"}:
        (output_path / class_name).mkdir(parents=True, exist_ok=True)

    counts = {"healthy": 0, "unhealthy": 0}
    for input_dir in input_dirs:
        input_path = Path(input_dir)
        if not input_path.exists():
            raise FileNotFoundError(f"Input dataset does not exist: {input_path}")

        for image_path in input_path.rglob("*"):
            if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue

            mapped_class = CLASS_MAP.get(image_path.parent.name)
            if not mapped_class:
                continue

            output_name = f"{input_path.name}_{image_path.stem}{image_path.suffix.lower()}"
            destination = output_path / mapped_class / output_name
            suffix = 1
            while destination.exists():
                destination = output_path / mapped_class / f"{input_path.name}_{image_path.stem}_{suffix}{image_path.suffix.lower()}"
                suffix += 1

            shutil.copy2(image_path, destination)
            counts[mapped_class] += 1

    print(f"Merged datasets into {output_path}")
    for class_name, count in counts.items():
        print(f"{count:5d}  {class_name}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="data/leaf-health-combined")
    parser.add_argument("input_dirs", nargs="+")
    args = parser.parse_args()
    merge_datasets(args.output_dir, args.input_dirs)
