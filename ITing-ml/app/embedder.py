"""
Bi-Encoder Embedder Module.
Self-hosted alternative to OpenAI Embedding API.
Uses all-MiniLM-L6-v2 for fast semantic encoding.
"""
import logging
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

_model = None

def get_model() -> SentenceTransformer:
    """Lazy-load the Bi-Encoder model (singleton)."""
    global _model
    if _model is None:
        logger.info("⏳ Loading Bi-Encoder model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("✅ Bi-Encoder model loaded successfully")
    return _model


def embed_text(text: str) -> list[float]:
    """Encode a single text into a vector."""
    if not text or not text.strip():
        return []
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Encode a batch of texts into vectors."""
    if not texts:
        return []
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return embeddings.tolist()


def semantic_search(query: str, documents: list[str], doc_ids: list[int], top_k: int = 20) -> list[dict]:
    """
    Perform semantic search using Bi-Encoder embeddings.
    
    Args:
        query: Search query text
        documents: List of document texts
        doc_ids: Corresponding document IDs
        top_k: Number of top results to return
    
    Returns:
        List of {"id": int, "score": float} sorted by cosine similarity
    """
    if not query or not documents:
        return []

    model = get_model()

    # Encode query and documents
    query_embedding = model.encode(query, normalize_embeddings=True)
    doc_embeddings = model.encode(documents, normalize_embeddings=True, show_progress_bar=False)

    # Compute cosine similarities (dot product since normalized)
    similarities = np.dot(doc_embeddings, query_embedding)

    # Get top-k indices
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        if similarities[idx] > 0.2:  # Threshold
            results.append({
                "id": int(doc_ids[idx]),
                "score": float(similarities[idx])
            })

    return results
