"""
ITing ML Microservice - FastAPI Entry Point.

Provides:
  - POST /rerank         → Cross-Encoder reranking
  - POST /embed          → Bi-Encoder text embedding
  - POST /embed/batch    → Batch embedding
  - POST /semantic-search → Semantic search
  - POST /extract-skills → Skill NER extraction
  - GET  /health         → Health check
"""
import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app import reranker, embedder, ner

# ─── Logging ───────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("iting-ml")


# ─── Lifespan (preload models on startup) ──────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 ITing ML Service starting up...")
    # Preload models in background (lazy - loaded on first request)
    logger.info("✅ ML Service ready! Models will be loaded on first request.")
    yield
    logger.info("👋 ML Service shutting down...")


# ─── FastAPI App ───────────────────────────────────────────
app = FastAPI(
    title="ITing ML Microservice",
    description="Cross-Encoder Reranking, Bi-Encoder Embedding, Skill NER",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Models ──────────────────────────────

class RerankRequest(BaseModel):
    query: str = Field(..., description="Search query")
    documents: list[str] = Field(..., description="List of document texts to rerank")
    doc_ids: list[int] = Field(..., description="Corresponding document IDs")

class RerankResponse(BaseModel):
    results: list[dict] = Field(..., description="Reranked results with id and score")
    latency_ms: float = Field(..., description="Processing time in ms")

class EmbedRequest(BaseModel):
    text: str = Field(..., description="Text to embed")

class EmbedBatchRequest(BaseModel):
    texts: list[str] = Field(..., description="List of texts to embed")

class EmbedResponse(BaseModel):
    embedding: list[float]
    dimensions: int

class EmbedBatchResponse(BaseModel):
    embeddings: list[list[float]]
    count: int
    dimensions: int

class SemanticSearchRequest(BaseModel):
    query: str
    documents: list[str]
    doc_ids: list[int]
    top_k: int = Field(default=20, ge=1, le=100)

class SemanticSearchResponse(BaseModel):
    results: list[dict]
    latency_ms: float

class TextRequest(BaseModel):
    text: str = Field(..., description="Text to extract skills from")

class SkillExtractionResponse(BaseModel):
    skills: list[str]
    skills_with_categories: list[dict]
    count: int


# ─── Endpoints ─────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "iting-ml",
        "version": "1.0.0"
    }


@app.post("/rerank", response_model=RerankResponse)
async def rerank_endpoint(request: RerankRequest):
    """
    Rerank documents against a query using Cross-Encoder.
    Used by Spring Boot to reorder search results for precision.
    """
    if len(request.documents) != len(request.doc_ids):
        raise HTTPException(400, "documents and doc_ids must have same length")

    if len(request.documents) == 0:
        return RerankResponse(results=[], latency_ms=0.0)

    start = time.time()
    try:
        results = reranker.rerank(request.query, request.documents, request.doc_ids)
        latency = (time.time() - start) * 1000
        logger.info(f"✅ Reranked {len(request.documents)} docs in {latency:.1f}ms")
        return RerankResponse(results=results, latency_ms=round(latency, 1))
    except Exception as e:
        logger.error(f"❌ Rerank error: {e}")
        raise HTTPException(500, f"Rerank failed: {str(e)}")


@app.post("/embed", response_model=EmbedResponse)
async def embed_endpoint(request: EmbedRequest):
    """
    Embed a single text using Bi-Encoder.
    Self-hosted alternative to OpenAI Embedding API.
    """
    try:
        embedding = embedder.embed_text(request.text)
        return EmbedResponse(
            embedding=embedding,
            dimensions=len(embedding)
        )
    except Exception as e:
        logger.error(f"❌ Embed error: {e}")
        raise HTTPException(500, f"Embedding failed: {str(e)}")


@app.post("/embed/batch", response_model=EmbedBatchResponse)
async def embed_batch_endpoint(request: EmbedBatchRequest):
    """Batch embed multiple texts."""
    try:
        embeddings = embedder.embed_batch(request.texts)
        dims = len(embeddings[0]) if embeddings else 0
        return EmbedBatchResponse(
            embeddings=embeddings,
            count=len(embeddings),
            dimensions=dims
        )
    except Exception as e:
        logger.error(f"❌ Batch embed error: {e}")
        raise HTTPException(500, f"Batch embedding failed: {str(e)}")


@app.post("/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search_endpoint(request: SemanticSearchRequest):
    """
    Semantic search using Bi-Encoder.
    Encodes query + all docs, returns top-K by cosine similarity.
    """
    if len(request.documents) != len(request.doc_ids):
        raise HTTPException(400, "documents and doc_ids must have same length")

    start = time.time()
    try:
        results = embedder.semantic_search(
            request.query, request.documents, request.doc_ids, request.top_k
        )
        latency = (time.time() - start) * 1000
        logger.info(f"✅ Semantic search over {len(request.documents)} docs in {latency:.1f}ms")
        return SemanticSearchResponse(results=results, latency_ms=round(latency, 1))
    except Exception as e:
        logger.error(f"❌ Semantic search error: {e}")
        raise HTTPException(500, f"Semantic search failed: {str(e)}")


@app.post("/extract-skills", response_model=SkillExtractionResponse)
async def extract_skills_endpoint(request: TextRequest):
    """
    Extract IT skills from text using NER.
    Used to auto-tag jobs/CVs and enrich Knowledge Graph.
    """
    try:
        skills = ner.extract_skills(request.text)
        skills_with_cats = ner.extract_skills_with_categories(request.text)
        return SkillExtractionResponse(
            skills=skills,
            skills_with_categories=skills_with_cats,
            count=len(skills)
        )
    except Exception as e:
        logger.error(f"❌ Skill extraction error: {e}")
        raise HTTPException(500, f"Skill extraction failed: {str(e)}")


# ─── Main ──────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
