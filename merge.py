import json, os, glob

dataset_dir = os.path.join(os.path.dirname(__file__), "dataset")
output_path = os.path.join(os.path.dirname(__file__), "backend", "data", "cosmetics.json")

all_docs = []
for fpath in sorted(glob.glob(os.path.join(dataset_dir, "*.json"))):
    with open(fpath, "r", encoding="utf-8") as f:
        docs = json.load(f)
        all_docs.extend(docs)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(all_docs, f, ensure_ascii=False, indent=2)

print(f"Merged {len(all_docs)} documents into {output_path}")
