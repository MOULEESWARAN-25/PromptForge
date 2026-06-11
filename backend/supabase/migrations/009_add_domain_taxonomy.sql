-- SQL migration: 009_add_domain_taxonomy.sql
-- Add primary_domain, domains, and subdomain columns to kb_entities

ALTER TABLE kb_entities ADD COLUMN IF NOT EXISTS primary_domain VARCHAR DEFAULT 'common';
ALTER TABLE kb_entities ADD COLUMN IF NOT EXISTS domains VARCHAR[] DEFAULT ARRAY['common'];
ALTER TABLE kb_entities ADD COLUMN IF NOT EXISTS subdomain VARCHAR DEFAULT 'general';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS kb_entities_primary_domain_idx ON kb_entities (primary_domain);
CREATE INDEX IF NOT EXISTS kb_entities_domains_gin_idx ON kb_entities USING gin (domains);

-- Update pgvector similarity search match function to return taxonomy columns
DROP FUNCTION IF EXISTS match_kb_entities(vector(1024), float, int, varchar[]);

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
  similarity float,
  primary_domain varchar,
  domains varchar[],
  subdomain varchar
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
    1 - (k.embedding <=> query_embedding) AS similarity,
    k.primary_domain,
    k.domains,
    k.subdomain
  FROM kb_entities k
  WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
    AND k.is_active = TRUE
    AND (allowed_kb_types IS NULL OR k.kb_type = ANY(allowed_kb_types))
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
