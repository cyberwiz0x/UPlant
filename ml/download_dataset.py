from collections import Counter
from pathlib import Path

import kagglehub

DATASET_HANDLE = "abdulahad0296/indoor-plant-disease-detection-dataset"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def count_images_by_folder(dataset_path: Path):
    counts = Counter()

    for image_path in dataset_path.rglob("*"):
        if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        parent = image_path.parent.relative_to(dataset_path)
        counts[str(parent)] += 1

    return counts


def main():
    path = Path(kagglehub.dataset_download(DATASET_HANDLE))
    print(f"Path to dataset files: {path}")

    counts = count_images_by_folder(path)
    if not counts:
        print("No image files found. Check whether the dataset downloaded correctly.")
        return

    print("\nImage folders:")
    for folder, count in sorted(counts.items()):
        print(f"{count:5d}  {folder}")


if __name__ == "__main__":
    main()
