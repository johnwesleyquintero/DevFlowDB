-- Add results column to query_history
ALTER TABLE query_history
ADD COLUMN results JSONB;

-- Create index on results column for faster querying
CREATE INDEX idx_query_results ON query_history USING gin (results);