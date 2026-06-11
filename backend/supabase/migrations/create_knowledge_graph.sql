-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables if recreating
DROP FUNCTION IF EXISTS match_kb_entities;
DROP TABLE IF EXISTS kb_relationships;
DROP TABLE IF EXISTS kb_entities;

-- Create Knowledge Graph entities table (using BGE-large-en-v1.5 1024-dimensional vectors)
CREATE TABLE kb_entities (
  id VARCHAR PRIMARY KEY,
  kb_type VARCHAR NOT NULL,                      -- 'fullstack', 'spa', 'component', 'common'
  entity_type VARCHAR NOT NULL,                  -- 'application', 'feature', 'page', 'component', 'typography', 'theme', 'wizard_step', 'backend_module', 'database_entity'
  name VARCHAR NOT NULL,
  overview TEXT NOT NULL,
  business_goals TEXT[],
  target_users TEXT[],
  common_features TEXT[],
  advanced_features TEXT[],
  recommended_pages TEXT[],
  recommended_components TEXT[],
  recommended_backend_modules TEXT[],
  recommended_database_entities TEXT[],
  security_considerations TEXT[],
  scalability_considerations TEXT[],
  accessibility_considerations TEXT[],
  mobile_considerations TEXT[],
  analytics_considerations TEXT[],
  integrations TEXT[],
  design_patterns TEXT[],
  implementation_guidelines TEXT[],
  anti_patterns TEXT[],
  prompt_fragments JSONB,                        -- structured object with categorized fragments
  keywords TEXT[] NOT NULL,
  embedding vector(1024),                        -- 1024 dimensions for bge-large-en-v1.5
  metadata JSONB,
  -- Step metadata fields
  purpose TEXT,
  why_exists TEXT,
  common_mistakes TEXT[],
  impact_on_generation TEXT[],
  -- Versioning & operational fields
  entity_version INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create GIN index on keywords for fast filter matching
CREATE INDEX IF NOT EXISTS kb_entities_keywords_gin_idx ON kb_entities USING gin (keywords);
CREATE INDEX IF NOT EXISTS kb_entities_kb_type_idx ON kb_entities (kb_type);
CREATE INDEX IF NOT EXISTS kb_entities_entity_type_idx ON kb_entities (entity_type);

-- Create Knowledge Graph relationships table
CREATE TABLE kb_relationships (
  source_id VARCHAR NOT NULL REFERENCES kb_entities(id) ON DELETE CASCADE,
  target_id VARCHAR NOT NULL REFERENCES kb_entities(id) ON DELETE CASCADE,
  relation_type VARCHAR NOT NULL,                 -- 'has_feature', 'renders_page', 'contains_component', 'requires_backend', 'uses_db_model', 'implements_pattern'
  PRIMARY KEY (source_id, target_id, relation_type)
);

CREATE INDEX IF NOT EXISTS kb_relationships_source_idx ON kb_relationships (source_id);
CREATE INDEX IF NOT EXISTS kb_relationships_target_idx ON kb_relationships (target_id);

-- Enable Row Level Security (RLS)
ALTER TABLE kb_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_relationships ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access
CREATE POLICY "Allow anonymous read access on kb_entities" ON kb_entities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anonymous read access on kb_relationships" ON kb_relationships FOR SELECT TO anon, authenticated USING (true);

-- Create policy to allow service_role full write access
CREATE POLICY "Allow service_role write access on kb_entities" ON kb_entities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role write access on kb_relationships" ON kb_relationships FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create similarity search match function for BGE 1024d vectors with type/category filtering
CREATE OR REPLACE FUNCTION match_kb_entities (
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  allowed_kb_types varchar[] DEFAULT NULL
)
RETURNS TABLE (
  id varchar,
  kb_type varchar,
  entity_type varchar,
  name varchar,
  overview text,
  keywords text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.kb_type,
    k.entity_type,
    k.name,
    k.overview,
    k.keywords,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM kb_entities k
  WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
    AND k.is_active = TRUE
    AND (allowed_kb_types IS NULL OR k.kb_type = ANY(allowed_kb_types))
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
