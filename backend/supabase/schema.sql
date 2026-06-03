-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop existing objects if recreating
DROP FUNCTION IF EXISTS match_design_vocabulary;
DROP TABLE IF EXISTS design_vocabulary;

-- 3. Create design vocabulary embeddings table
CREATE TABLE design_vocabulary (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  keywords TEXT[] NOT NULL,
  description TEXT NOT NULL,
  snippet TEXT NOT NULL,
  example_prompt TEXT NOT NULL,
  embedding vector(3072) -- 3072 dimensions for Gemini gemini-embedding-001/gemini-embedding-2
);

-- 3b. NOTE: HNSW vector index is intentionally omitted.
--     pgvector HNSW supports a maximum of 2000 dimensions.
--     gemini-embedding-001 produces 3072-dim vectors — applying HNSW will error:
--       ERROR 54000: column cannot have more than 2000 dimensions for hnsw index
--     At current corpus size (~30-100 rows) sequential scan is <10ms — no index needed.
--     FUTURE PATH when corpus exceeds ~5k rows:
--       ALTER TABLE design_vocabulary ALTER COLUMN embedding TYPE halfvec(3072);
--       CREATE INDEX ON design_vocabulary USING hnsw (embedding halfvec_cosine_ops)
--         WITH (m = 16, ef_construction = 64);

-- 3c. GIN index on keywords array for fast category/keyword filtering (safe at any dim)
CREATE INDEX IF NOT EXISTS design_vocab_keywords_gin_idx
  ON design_vocabulary
  USING gin (keywords);


-- 4. Enable Row Level Security (RLS)
ALTER TABLE design_vocabulary ENABLE ROW LEVEL SECURITY;

-- 5. Create policy to allow anonymous SELECT access
CREATE POLICY "Allow anonymous read access"
ON design_vocabulary
FOR SELECT
TO anon, authenticated
USING (true);

-- 6. Create policy to allow service_role write access
CREATE POLICY "Allow service_role full write access"
ON design_vocabulary
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Create similarity search match function
CREATE OR REPLACE FUNCTION match_design_vocabulary (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  boost_category varchar DEFAULT NULL
)
RETURNS TABLE (
  id varchar,
  name varchar,
  category varchar,
  keywords text[],
  description text,
  snippet text,
  example_prompt text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dv.id,
    dv.name,
    dv.category,
    dv.keywords,
    dv.description,
    dv.snippet,
    dv.example_prompt,
    1 - (dv.embedding <=> query_embedding) AS similarity
  FROM design_vocabulary dv
  WHERE 1 - (dv.embedding <=> query_embedding) > match_threshold
  ORDER BY 
    CASE 
      WHEN boost_category IS NOT NULL AND dv.category ILIKE '%' || boost_category || '%' THEN (1 - (dv.embedding <=> query_embedding)) * 1.25
      ELSE 1 - (dv.embedding <=> query_embedding)
    END DESC
  LIMIT match_count;
END;
$$;
