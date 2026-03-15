# ITing Job Portal - Database Setup Guide

## Files Generated

### 1. schema.sql
Complete database schema with all tables, foreign keys, indexes, and constraints.

**Location**: `F:\HK252\ITing\schema.sql`

**Contents**:
- 23 tables with proper PostgreSQL data types
- All foreign key relationships
- Indexes for performance optimization
- Constraints (NOT NULL, UNIQUE, CHECK)

### 2. data_with_embeddings.sql
Sample data with full 768-dimensional embeddings for jobs and CVs.

**Location**: `F:\HK252\ITing\data_with_embeddings.sql`

**Contents**:
- Reference data (10 locations, 3 web info, social networks)
- 20 user accounts (3 admins, 7 companies, 10 job seekers)
- 10 companies (real Vietnamese tech companies)
- **10 jobs with 768-dimensional embeddings** (25M - 80M VND salary range)
- **10 CVs with 768-dimensional embeddings** (user profiles)
- Relationships (follows, saves, applications, notifications)
- User profile components (education, certificates, skills, experience)

### 3. embeddings_update.sql
Standalone SQL file with just the embedding UPDATE statements.

**Location**: `F:\HK252\ITing\embeddings_update.sql`

**Contents**:
- 10 job embedding updates
- 10 CV embedding updates
- All embeddings are 768-dimensional normalized vectors

### 4. generate_embeddings.py
Python script to generate new embeddings if needed.

**Location**: `F:\HK252\ITing\generate_embeddings.py`

## Database Setup Instructions

### Option 1: Complete Fresh Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE "job-web";

# Exit and reconnect to new database
\c job-web

# Run schema creation
\i F:/HK252/ITing/schema.sql

# Run data insertion with embeddings
\i F:/HK252/ITing/data_with_embeddings.sql
```

### Option 2: Using Command Line

```bash
# Create database and run schema
psql -U postgres -c "CREATE DATABASE \"job-web\";"

# Run schema
psql -U postgres -d job-web -f "F:\HK252\ITing\schema.sql"

# Insert data with embeddings
psql -U postgres -d job-web -f "F:\HK252\ITing\data_with_embeddings.sql"
```

### Option 3: Update Existing Database (Embeddings Only)

If you already have data and just want to add embeddings:

```bash
psql -U postgres -d job-web -f "F:\HK252\ITing\embeddings_update.sql"
```

## Embedding Details

### Vector Dimensions
- **Size**: 768 dimensions (standard for semantic embeddings)
- **Type**: Float values normalized to unit vectors
- **Range**: Approximately [-0.15, 0.15] with most values near 0

### Job Embeddings
Generated from combined text of:
- Position title
- Tech requirements
- Job description

**Example Jobs**:
1. Senior Backend Developer (Python, FastAPI, PostgreSQL)
2. Backend Engineer (Node.js, Express, MongoDB)
3. Frontend Developer (React, TypeScript, Redux)
4. DevOps Engineer (AWS, Docker, Kubernetes)
5. Mobile Developer (Flutter, Dart)
6. AI/ML Engineer (Python, TensorFlow, PyTorch)
7. Data Engineer (Python, Spark, Airflow)
8. QA Engineer (Selenium, Java, Python)
9. Java Backend Developer (Spring Boot, Microservices)
10. Tech Lead (System Design, Leadership)

### CV Embeddings
Generated from combined text of:
- User skills
- Experience
- Technologies
- Role descriptions

**Example CVs**:
1. Java Developer (Spring Boot, 2 years)
2. Frontend Developer (React, Vue.js, UI/UX)
3. DevOps Engineer (AWS, Docker, Kubernetes)
4. Full Stack Developer (Node.js, React, TypeScript)
5. Data Engineer (Python, Spark, ETL)
6. Mobile Developer (Flutter, React Native)
7. QA Engineer (Selenium, Automation)
8. UI/UX Designer (Figma, Adobe XD)
9. Fresher Backend Developer (Java)
10. Senior Backend Developer (Java, 7 years)

## Generating New Embeddings

If you need to generate embeddings for new data:

```bash
cd F:\HK252\ITing
python generate_embeddings.py > new_embeddings.sql
psql -U postgres -d job-web -f new_embeddings.sql
```

## Database Statistics

After running both schema.sql and data_with_embeddings.sql, you will have:

| Table | Rows | Description |
|-------|------|-------------|
| VN_location | 10 | Vietnamese provinces/cities |
| Web_infor | 3 | Website information |
| Social_network | 3 | Social media platforms |
| Account | 20 | User accounts (hashed passwords) |
| User | 10 | Job seeker profiles |
| Admin | 3 | Administrator accounts |
| Company | 10 | Employer profiles |
| Job | 10 | Job postings with embeddings |
| CV | 9 | User CVs with embeddings |
| Company_upload_job | 10 | Job-company relationships |
| User_follow_company | 10 | Follow relationships |
| User_save_job | 12 | Saved jobs |
| User_contact_company | 5 | Messages |
| Notification | 10 | System notifications |
| Apply_form | 7 | Application forms |
| Apply_form_user_to_job | 8 | Applications tracking |
| Education | 10 | Education records |
| Certificate | 7 | Certificates |
| Skill | 10 | Skills |
| Experience | 8 | Work experience |
| Reported_account_id | 3 | Reported accounts |
| Account_report_account | 3 | Report relationships |

**Total**: ~150 sample records across 23 tables

## Testing Embeddings

To verify embeddings are working correctly:

```sql
-- Check job embeddings
SELECT Id, Position, 
       array_length(Job_embedding, 1) as embedding_dimensions
FROM Job 
WHERE Job_embedding IS NOT NULL;

-- Check CV embeddings
SELECT Email, F_name, L_name,
       array_length(Cv_embedding, 1) as embedding_dimensions
FROM User 
WHERE Cv_embedding IS NOT NULL;

-- Test similarity search (cosine similarity example)
-- Requires pgvector extension
SELECT j1.Position as job1, j2.Position as job2,
       1 - (j1.Job_embedding <=> j2.Job_embedding) as similarity
FROM Job j1, Job j2
WHERE j1.Id = 1 AND j2.Id != 1
ORDER BY similarity DESC
LIMIT 5;
```

## Important Notes

1. **PostgreSQL Vector Extension**: For similarity search, install `pgvector`:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Password**: All sample accounts use the same hashed password:
   ```
   $2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6
   ```
   This is bcrypt hash of a test password (for development only!)

3. **Embeddings**: These are synthetic embeddings for testing. In production:
   - Use a proper embedding model (e.g., sentence-transformers, OpenAI)
   - Generate embeddings from actual job/CV content
   - Update embeddings when content changes

4. **Data Consistency**: All foreign key relationships are properly maintained.
   Jobs reference companies, users reference locations, etc.

## Troubleshooting

### If you get "embedding dimension mismatch" errors:
```sql
-- Check the vector column type
\d+ Job

-- If needed, alter the column
ALTER TABLE Job ALTER COLUMN Job_embedding TYPE vector(768);
ALTER TABLE User ALTER COLUMN Cv_embedding TYPE vector(768);
```

### If sequences are out of sync:
```sql
-- Run the sequence updates at the end of data_with_embeddings.sql
SELECT setval('job_id_seq', (SELECT MAX(Id) FROM Job));
SELECT setval('company_company_id_seq', (SELECT MAX(Company_id) FROM Company));
-- etc.
```

## Next Steps

After loading the data:

1. **Test the application** with Spring Boot
2. **Verify relationships** between tables
3. **Test search functionality** with embeddings
4. **Add more sample data** as needed
5. **Implement similarity search** using pgvector

## Contact

For issues or questions about the database setup, refer to the ITing project documentation.

---

**Generated**: March 4, 2026  
**Database**: PostgreSQL 16+  
**Embeddings**: 768-dimensional normalized vectors  
**Records**: ~150 sample records across 23 tables
