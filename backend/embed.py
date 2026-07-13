import json
from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "cosmetics.json"
EMBEDDINGS_PATH = BASE_DIR / "embeddings.npy"

print("Loading model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

print("Loading dataset...")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    documents = json.load(f)

print(f"Loaded {len(documents)} documents")

def doc_to_text(doc):
    benefits = " ".join(doc.get("benefits", []))
    skin_types = " ".join(doc.get("skin_types", []))
    skin_concerns = " ".join(doc.get("skin_concerns", []))
    keywords = " ".join(doc.get("keywords", []))
    avoid_with = " ".join(doc.get("avoid_with", []))
    usage = doc.get("usage", "") or ""
    description = doc.get("description", "") or ""

    return f"""Title: {doc['title']}
Category: {doc['category']}
Description: {description}
Benefits: {benefits}
Usage: {usage}
Skin Types: {skin_types}
Skin Concerns: {skin_concerns}
Avoid With: {avoid_with}
Keywords: {keywords}"""

print("Preparing texts...")
texts = [doc_to_text(doc) for doc in documents]

print("Generating embeddings...")
embeddings = model.encode(
    texts,
    convert_to_numpy=True,
    show_progress_bar=True
)

print(f"Embeddings shape: {embeddings.shape}")

np.save(EMBEDDINGS_PATH, embeddings)
print(f"Saved embeddings to {EMBEDDINGS_PATH}")
print("Done!")
