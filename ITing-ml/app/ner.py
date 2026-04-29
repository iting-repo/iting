"""
Skill NER (Named Entity Recognition) Module.
Extracts IT skills from JD/CV text using pattern matching + custom rules.
Falls back to rule-based extraction since spaCy NER requires training data.
"""
import re
import logging

logger = logging.getLogger(__name__)

# Comprehensive IT skill dictionary (lowercase)
IT_SKILLS = {
    # Programming Languages
    "java", "python", "javascript", "typescript", "c#", "c++", "go", "golang",
    "rust", "kotlin", "swift", "php", "ruby", "scala", "dart", "r", "sql",
    "html", "css", "sass", "scss", "html5", "css3", "solidity",

    # Frameworks & Libraries
    "spring", "spring boot", "spring mvc", "spring security", "hibernate",
    "react", "reactjs", "react.js", "react native", "next.js", "nextjs",
    "vue", "vuejs", "vue.js", "angular", "svelte",
    "node.js", "nodejs", "express", "express.js", "nestjs", "nest.js",
    "django", "flask", "fastapi",
    ".net", "asp.net", "asp.net core",
    "laravel", "ruby on rails", "rails",
    "flutter", "jquery", "bootstrap", "tailwind", "tailwindcss",
    "pytorch", "tensorflow", "keras", "scikit-learn", "sklearn",
    "pandas", "numpy", "opencv", "huggingface",
    "unity", "unreal engine",

    # Databases
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
    "oracle", "sql server", "cassandra", "neo4j", "dynamodb", "firebase",
    "sqlite", "mariadb", "couchdb",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud",
    "docker", "kubernetes", "k8s", "jenkins", "terraform", "ansible",
    "github actions", "gitlab ci", "ci/cd", "nginx", "apache",
    "grafana", "prometheus", "datadog",
    "aws ec2", "aws s3", "aws lambda", "aws rds",

    # Tools & Platforms
    "git", "github", "gitlab", "bitbucket",
    "jira", "confluence", "trello", "slack",
    "figma", "sketch", "adobe xd",
    "postman", "swagger",
    "linux", "ubuntu", "centos",

    # Testing
    "selenium", "cypress", "playwright", "jest", "junit", "mocha",
    "pytest", "testng", "cucumber",

    # Concepts & Skills
    "machine learning", "deep learning", "nlp", "computer vision",
    "artificial intelligence", "ai", "ml",
    "rest api", "restful", "graphql", "grpc", "websocket",
    "microservices", "monolith",
    "agile", "scrum", "kanban",
    "tdd", "bdd", "ddd", "clean architecture", "design patterns",
    "oauth", "oauth2", "jwt", "sso",
    "blockchain", "web3", "smart contract", "defi",
    "data science", "big data", "data engineering",
    "devops", "sre", "cloud computing",
    "ui/ux", "ux design", "ui design",
    "cybersecurity", "pentesting", "security",

    # Messaging & Streaming
    "kafka", "rabbitmq", "celery", "redis queue",

    # ORM & Data
    "jpa", "hibernate", "sequelize", "prisma", "typeorm", "mongoose",
}

# Multi-word skills sorted by length (longest first for greedy matching)
MULTI_WORD_SKILLS = sorted(
    [s for s in IT_SKILLS if " " in s or "/" in s or "." in s],
    key=len,
    reverse=True
)

SINGLE_WORD_SKILLS = {s for s in IT_SKILLS if " " not in s and "/" not in s and "." not in s}


def extract_skills(text: str) -> list[str]:
    """
    Extract IT skills from text using rule-based pattern matching.
    
    Args:
        text: Raw text from JD or CV
    
    Returns:
        List of unique extracted skills (preserving original casing)
    """
    if not text or not text.strip():
        return []

    found_skills = []
    text_lower = text.lower()

    # Phase 1: Multi-word skill extraction (greedy, longest first)
    remaining_text = text_lower
    for skill in MULTI_WORD_SKILLS:
        # Use word boundary matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, remaining_text):
            # Find original casing from text
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                found_skills.append(match.group())
            else:
                found_skills.append(skill)

    # Phase 2: Single-word skill extraction
    # Tokenize remaining text
    words = re.findall(r'[a-zA-Z0-9#\+\.]+', text)
    for word in words:
        word_lower = word.lower()
        if word_lower in SINGLE_WORD_SKILLS and len(word_lower) >= 2:
            found_skills.append(word)

    # Deduplicate while preserving order and original casing
    seen = set()
    unique_skills = []
    for skill in found_skills:
        key = skill.lower().strip()
        if key not in seen:
            seen.add(key)
            unique_skills.append(skill)

    return unique_skills


def extract_skills_with_categories(text: str) -> list[dict]:
    """
    Extract skills with category labels.
    
    Returns:
        List of {"skill": str, "category": str}
    """
    skills = extract_skills(text)

    categorized = []
    for skill in skills:
        category = categorize_skill(skill.lower())
        categorized.append({"skill": skill, "category": category})

    return categorized


CATEGORY_MAP = {
    "Language": {"java", "python", "javascript", "typescript", "c#", "c++", "go", "golang",
                 "rust", "kotlin", "swift", "php", "ruby", "scala", "dart", "r", "sql",
                 "html", "css", "sass", "scss", "solidity"},
    "Framework": {"spring", "spring boot", "react", "reactjs", "vue", "vuejs", "angular",
                  "node.js", "nodejs", "express", "django", "flask", "fastapi", ".net",
                  "laravel", "rails", "flutter", "react native", "next.js", "nestjs",
                  "pytorch", "tensorflow", "bootstrap", "tailwind", "unity"},
    "Database": {"postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
                 "oracle", "sql server", "cassandra", "neo4j", "dynamodb", "firebase"},
    "Cloud": {"aws", "azure", "gcp", "google cloud", "aws ec2", "aws s3", "aws lambda"},
    "DevOps": {"docker", "kubernetes", "k8s", "jenkins", "terraform", "ansible",
               "ci/cd", "nginx", "grafana", "prometheus"},
    "Testing": {"selenium", "cypress", "playwright", "jest", "junit", "pytest"},
    "AI/ML": {"machine learning", "deep learning", "nlp", "computer vision", "ai", "ml",
              "data science", "big data"},
}

def categorize_skill(skill_lower: str) -> str:
    """Categorize a skill into a domain."""
    for category, skills in CATEGORY_MAP.items():
        if skill_lower in skills:
            return category
    return "Other"
