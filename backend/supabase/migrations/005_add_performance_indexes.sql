-- Migration: 005_add_performance_indexes
-- Purpose: Create indexes on kb_entities, kb_relationships, knowledge_gaps, and prompt_history to support rapid metrics generation at scale.

-- Indexes for kb_entities
CREATE INDEX IF NOT EXISTS idx_kb_entities_kb_type ON kb_entities(kb_type);
CREATE INDEX IF NOT EXISTS idx_kb_entities_entity_type ON kb_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_kb_entities_is_active ON kb_entities(is_active);

-- Indexes for kb_relationships
CREATE INDEX IF NOT EXISTS idx_kb_relationships_source_id ON kb_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_kb_relationships_target_id ON kb_relationships(target_id);

-- Indexes for knowledge_gaps
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_status ON knowledge_gaps(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_priority ON knowledge_gaps(priority);

-- Indexes for prompt_history
CREATE INDEX IF NOT EXISTS idx_prompt_history_engine_version ON prompt_history(engine_version);
CREATE INDEX IF NOT EXISTS idx_prompt_history_telemetry_source ON prompt_history(telemetry_source);
