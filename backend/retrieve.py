import json
import numpy as np
import faiss
from pathlib import Path
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "cosmetics.json"
INDEX_PATH = BASE_DIR / "data" / "faiss.index"

print("Loading model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

print("Loading FAISS index...")
index = faiss.read_index(str(INDEX_PATH))

print("Loading documents...")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    documents = json.load(f)

def retrieve(query, k=5):
    query_embedding = model.encode(query, convert_to_numpy=True)
    distances, indices = index.search(query_embedding.reshape(1, -1), k)
    results = []
    for i, idx in enumerate(indices[0]):
        doc = documents[idx]
        results.append({
            "rank": i + 1,
            "title": doc["title"],
            "category": doc["category"],
            "distance": float(distances[0][i])
        })
    return results

if __name__ == "__main__":
    while True:
        q = input("\nAsk a question (or 'quit'): ").strip()
        if q.lower() == "quit":
            break
        results = retrieve(q)
        print(f"\nTop {len(results)} results for: {q}\n")
        for r in results:
            print(f"  #{r['rank']}  {r['title']}  ({r['category']})  — distance: {r['distance']:.4f}")
