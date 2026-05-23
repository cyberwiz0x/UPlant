from collections import Counter
from pathlib import Path

import kagglehub

DEFAULT_DATASET_HANDLE = "gauravsaklani00/indoor-plant-leaf-health-dataset"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def count_images_by_folder(dataset_path: Path):
    counts = Counter()

    for image_path in dataset_path.rglob("*"):
        if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        parent = image_path.parent.relative_to(dataset_path)
        counts[str(parent)] += 1

    return counts


def main(dataset_handle: str = DEFAULT_DATASET_HANDLE):
    path = Path(kagglehub.dataset_download(dataset_handle))
    print(f"Dataset: {dataset_handle}")
    print(f"Path to dataset files: {path}")

    counts = count_images_by_folder(path)
    if not counts:
        print("No image files found. Check whether the dataset downloaded correctly.")
        return

    print("\nImage folders:")
    for folder, count in sorted(counts.items()):
        print(f"{count:5d}  {folder}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dataset",
        default=DEFAULT_DATASET_HANDLE,
        help="Kaggle dataset handle to download",
    )
    args = parser.parse_args()
    main(args.dataset)
