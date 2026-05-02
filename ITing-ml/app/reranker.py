"""
Cross-Encoder Reranker Module.
Uses cross-encoder/ms-marco-MiniLM-L-6-v2 for precise pair-wise scoring.
"""
import logging
from sentence_transformers import CrossEncoder

logger = logging.getLogger(__name__)

_model = None

def get_model() -> CrossEncoder:
    """Lazy-load the Cross-Encoder model (singleton)."""
    global _model
    if _model is None:
        logger.info("⏳ Loading Cross-Encoder model...")
        _model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)
        logger.info("✅ Cross-Encoder model loaded successfully")
    return _model


def rerank(query: str, documents: list[str], doc_ids: list[int]) -> list[dict]:
    """
    Rerank documents against a query using Cross-Encoder.
    
    Args:
        query: The search query (e.g., "Java Spring Boot Developer")
        documents: List of document texts (e.g., job descriptions)
        doc_ids: Corresponding document IDs
    
    Returns:
        List of {"id": int, "score": float} sorted by score descending
    """
    if not documents or not query:
        return []

    model = get_model()

    # Build pairs: (query, document) for each document
    pairs = [[query, doc] for doc in documents]

    # Predict relevance scores
    scores = model.predict(pairs, show_progress_bar=False)

    # Combine IDs with scores and sort
    results = sorted(
        zip(doc_ids, scores.tolist() if hasattr(scores, 'tolist') else list(scores)),
        key=lambda x: x[1],
        reverse=True
    )

    return [{"id": int(doc_id), "score": float(score)} for doc_id, score in results]
