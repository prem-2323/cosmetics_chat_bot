import numpy as np
import faiss
from pathlib import Path

BASE_DIR = Path(__file__).parent
EMBEDDINGS_PATH = BASE_DIR / "data" / "embeddings.npy"
INDEX_PATH = BASE_DIR / "data" / "faiss.index"

print("Loading embeddings...")
embeddings = np.load(str(EMBEDDINGS_PATH))
print(f"Embeddings shape: {embeddings.shape}")

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)

print("Adding vectors to index...")
index.add(embeddings)
print(f"Total vectors in index: {index.ntotal}")

faiss.write_index(index, str(INDEX_PATH))
print(f"Index saved to {INDEX_PATH}")
print("Done!")
