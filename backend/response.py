import json
import numpy as np
import faiss
from pathlib import Path
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "cosmetics.json"
INDEX_PATH = BASE_DIR / "data" / "faiss.index"

_model = None
_index = None
_docs = None

def _ensure_loaded():
    global _model, _index, _docs
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    if _index is None:
        _index = faiss.read_index(str(INDEX_PATH))
    if _docs is None:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            _docs = json.load(f)
    return _model, _index, _docs

MODEL_CONFIGS = {
    "cosmo-v1": {
        "k": 5,
        "max_benefits": 3,
        "include_usage": True,
        "style": "standard",
    },
    "cosmo-pro": {
        "k": 10,
        "max_benefits": 5,
        "include_usage": True,
        "style": "detailed",
    },
    "minilm": {
        "k": 3,
        "max_benefits": 1,
        "include_usage": False,
        "style": "concise",
    },
}


def build_response(docs, style="standard", max_benefits=3, include_usage=True):
    categories = {}
    for doc in docs:
        cat = doc.get("category", "General")
        categories.setdefault(cat, []).append(doc)

    lines = []
    for cat, items in categories.items():
        lines.append(f"**{cat}**")
        for item in items:
            title = item.get("title", "")
            desc = item.get("description", "")
            benefits = item.get("benefits", [])
            usage = item.get("usage", "")

            if style == "detailed":
                lines.append(f"• **{title}** — {desc}")
                if benefits:
                    lines.append("  *Benefits:* " + ", ".join(benefits[:max_benefits]))
                if include_usage and usage:
                    lines.append(f"  *How to use:* {usage}")
                ingredients = item.get("ingredients", [])
                if ingredients:
                    lines.append("  *Key ingredients:* " + ", ".join(ingredients[:5]))
            elif style == "concise":
                lines.append(f"• **{title}** — {desc}")
                if benefits:
                    lines.append("  " + ", ".join(benefits[:max_benefits]))
            else:
                lines.append(f"• **{title}** — {desc}")
                if benefits:
                    lines.append("  Benefits: " + ", ".join(benefits[:max_benefits]))
                if include_usage and usage:
                    lines.append(f"  Usage: {usage}")
        lines.append("")

    return "\n".join(lines).strip()


def answer_question(question, model="cosmo-v1"):
    cfg = MODEL_CONFIGS.get(model, MODEL_CONFIGS["cosmo-v1"])

    model_instance, index, docs = _ensure_loaded()
    query_emb = model_instance.encode(question, convert_to_numpy=True)
    distances, indices = index.search(query_emb.reshape(1, -1), cfg["k"])
    retrieved = [docs[idx] for idx in indices[0]]
    answer = build_response(
        retrieved,
        style=cfg["style"],
        max_benefits=cfg["max_benefits"],
        include_usage=cfg["include_usage"],
    )
    sources = [doc["title"] for doc in retrieved]
    return {
        "answer": answer,
        "sources": sources,
    }


if __name__ == "__main__":
    while True:
        q = input("\nAsk a question (or 'quit'): ").strip()
        if q.lower() == "quit":
            break
        result = answer_question(q)
        print(f"\nCosmoGPT:\n{result['answer']}")
        print("\nSources:", ", ".join(result["sources"]))