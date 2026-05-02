# ITing ML Microservice

Python FastAPI microservice providing AI-powered features for the ITing job portal:

## Features

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/rerank` | POST | Cross-Encoder reranking (ms-marco-MiniLM-L-6-v2) |
| `/embed` | POST | Bi-Encoder text embedding (all-MiniLM-L6-v2) |
| `/embed/batch` | POST | Batch embedding |
| `/semantic-search` | POST | Semantic search using Bi-Encoder |
| `/extract-skills` | POST | Skill NER extraction from JD/CV text |

## Quick Start

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run server
python -m app.main
# OR
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Docker

```bash
docker build -t iting-ml .
docker run -p 8000:8000 iting-ml
```

## API Documentation

After starting, visit: http://localhost:8000/docs

## Models Used

- **Cross-Encoder**: `cross-encoder/ms-marco-MiniLM-L-6-v2` (~80MB) — Pair-wise relevance scoring
- **Bi-Encoder**: `all-MiniLM-L6-v2` (~80MB) — Text embedding (384 dimensions)
- **NER**: Rule-based skill extraction (~200 IT skills dictionary)
