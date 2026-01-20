-- ============================================
-- AI Integration Database Migration
-- ============================================
-- This migration adds tables for AI features:
-- - Vector embeddings for semantic search
-- - Document analysis (summaries, keywords)
-- - Plagiarism reports
-- - Chat history
-- - User interactions for recommendations
-- - AI usage logs
-- ============================================

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- DOCUMENT EMBEDDINGS TABLE
-- ============================================
-- Stores vector embeddings for semantic search
-- Note: Vector dimension (768) is for Google Gemini embeddings
-- Change to 1536 if using OpenAI embeddings

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID REFERENCES research(id) ON DELETE CASCADE,
  embedding vector(768), -- Google Gemini: 768d, OpenAI: 1536d
  content_hash TEXT, -- For cache invalidation
  model_used TEXT DEFAULT 'text-embedding-004',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_document_embeddings_research 
  ON document_embeddings(research_id);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector 
  ON document_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- DOCUMENT ANALYSIS TABLE
-- ============================================
-- Stores AI-generated analysis (summaries, keywords, etc.)

CREATE TABLE IF NOT EXISTS document_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID REFERENCES research(id) ON DELETE CASCADE UNIQUE,
  summary TEXT,
  keywords TEXT[], -- Array of keywords
  suggested_category UUID REFERENCES departments(id),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  language_issues JSONB, -- Detected language problems
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_version TEXT DEFAULT '1.0'
);

CREATE INDEX IF NOT EXISTS idx_document_analysis_research 
  ON document_analysis(research_id);

-- ============================================
-- PLAGIARISM REPORTS TABLE
-- ============================================
-- Stores plagiarism check results
-- DISCLAIMER: This is for internal repository checks only,
-- not a replacement for commercial plagiarism tools

CREATE TABLE IF NOT EXISTS plagiarism_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID REFERENCES research(id) ON DELETE CASCADE,
  similarity_score DECIMAL(5,2), -- 0-100
  matched_documents JSONB, -- Array of similar documents with scores
  external_matches JSONB, -- External plagiarism check results (if available)
  status TEXT CHECK (status IN ('clean', 'suspicious', 'flagged')),
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  checked_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_plagiarism_reports_research 
  ON plagiarism_reports(research_id);

CREATE INDEX IF NOT EXISTS idx_plagiarism_reports_status 
  ON plagiarism_reports(status);

-- ============================================
-- AI CHAT HISTORY TABLE
-- ============================================
-- Stores chatbot conversations

CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  context JSONB, -- Referenced documents, search results, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_conversation 
  ON ai_chat_history(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user 
  ON ai_chat_history(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created 
  ON ai_chat_history(created_at);

-- ============================================
-- USER INTERACTIONS TABLE
-- ============================================
-- Tracks user interactions for recommendations

CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  research_id UUID REFERENCES research(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('view', 'download', 'rate', 'bookmark')),
  interaction_data JSONB, -- Additional context (time spent, rating, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user 
  ON user_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_research 
  ON user_interactions(research_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_type 
  ON user_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_user_interactions_created 
  ON user_interactions(created_at);

-- ============================================
-- AI USAGE LOGS TABLE
-- ============================================
-- Tracks AI API usage and costs

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  feature TEXT NOT NULL, -- 'summarize', 'chat', 'search', etc.
  tokens_used INTEGER,
  estimated_cost DECIMAL(10,4),
  request_data JSONB,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature 
  ON ai_usage_logs(feature);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created 
  ON ai_usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user 
  ON ai_usage_logs(user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to match documents by vector similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  research_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.research_id,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  WHERE 
    (filter_ids IS NULL OR de.research_id = ANY(filter_ids))
    AND (1 - (de.embedding <=> query_embedding)) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get popular papers (most interactions)
CREATE OR REPLACE FUNCTION get_popular_papers(
  result_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  abstract text,
  author text,
  department_id uuid,
  access_level text,
  file_url text,
  created_at timestamptz,
  interaction_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.abstract,
    r.author,
    r.department_id,
    r.access_level,
    r.file_url,
    r.created_at,
    COUNT(ui.id) AS interaction_count
  FROM research r
  LEFT JOIN user_interactions ui ON r.id = ui.research_id
  GROUP BY r.id
  ORDER BY interaction_count DESC, r.created_at DESC
  LIMIT result_limit;
END;
$$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'document_embeddings',
    'document_analysis',
    'plagiarism_reports',
    'ai_chat_history',
    'user_interactions',
    'ai_usage_logs'
  )
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ AI Integration Migration Complete!';
  RAISE NOTICE 'Created 6 tables for AI features:';
  RAISE NOTICE '  - document_embeddings (semantic search)';
  RAISE NOTICE '  - document_analysis (summaries & keywords)';
  RAISE NOTICE '  - plagiarism_reports (similarity detection)';
  RAISE NOTICE '  - ai_chat_history (chatbot conversations)';
  RAISE NOTICE '  - user_interactions (recommendation tracking)';
  RAISE NOTICE '  - ai_usage_logs (cost monitoring)';
END $$;
