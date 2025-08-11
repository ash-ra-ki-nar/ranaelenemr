-- Media table for the enhanced media library
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK(file_type IN ('image', 'video', 'audio', 'document')),
  file_size INTEGER,
  mimetype TEXT,
  url TEXT NOT NULL,
  s3_key TEXT,
  s3_bucket TEXT,
  alt_text TEXT,
  folder TEXT DEFAULT 'media',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);

-- Add RLS (Row Level Security) policies
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policy safely (skip if it already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON media
          FOR ALL USING (true);
    END IF;
END $$;

-- Add media_id column to existing section_elements table (safe to run)
ALTER TABLE section_elements ADD COLUMN IF NOT EXISTS media_id INTEGER REFERENCES media(id) ON DELETE SET NULL;