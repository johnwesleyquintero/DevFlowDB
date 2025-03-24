-- Create query history table
CREATE TABLE query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  query_text TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT CHECK(status IN ('success', 'failed')) NOT NULL,
  error_message TEXT
);

-- Create visualization preferences table
CREATE TABLE visualization_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES query_history(id) NOT NULL,
  chart_type TEXT CHECK(chart_type IN ('line', 'bar', 'pie', 'table')) NOT NULL,
  options JSONB
);

-- Create indexes for faster filtering
CREATE INDEX idx_query_history_user ON query_history(user_id);
CREATE INDEX idx_query_history_created ON query_history(created_at);