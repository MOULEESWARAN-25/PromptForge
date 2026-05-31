-- Migration: 001_add_keyword_index
-- Purpose: Add GIN index on the keywords array for fast category filtering.
--
-- NOTE: HNSW vector index is NOT applied here.
-- Reason: pgvector's HNSW operator supports a maximum of 2000 dimensions.
-- The design_vocabulary.embedding column uses gemini-embedding-001 (3072 dimensions),
-- which exceeds this limit. Attempting to add an HNSW index will produce:
--   ERROR 54000: column cannot have more than 2000 dimensions for hnsw index
--
-- Current scale: 30 rows. Sequential cosine scan completes in <10ms.
-- No vector index is needed until the corpus exceeds ~5,000 rows.
--
-- FUTURE PATH (when corpus grows):
-- Option A — Switch to halfvec column type (pgvector >= 0.7, Supabase >=2024-11):
--   ALTER TABLE design_vocabulary ALTER COLUMN embedding TYPE halfvec(3072);
--   CREATE INDEX design_vocab_embedding_hnsw_idx
--     ON design_vocabulary
--     USING hnsw (embedding halfvec_cosine_ops)
--     WITH (m = 16, ef_construction = 64);
--
-- Option B — Re-embed using text-embedding-3-small (1536 dims) and rebuild the table.

-- GIN index on the keywords text[] array — safe to apply now, no dimension limit.
CREATE INDEX IF NOT EXISTS design_vocab_keywords_gin_idx
  ON design_vocabulary
  USING gin (keywords);

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'design_vocabulary';
