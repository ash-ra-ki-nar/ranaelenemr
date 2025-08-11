-- Supabase Schema for Portfolio CMS
-- Run this in Supabase Dashboard SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  year INTEGER NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('works', 'parallel discourses')),
  main_image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  coming_soon BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- About table
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure there's only one record in the about table
CREATE UNIQUE INDEX IF NOT EXISTS about_single_row ON about ((1));

-- Sections table (for rich content)
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  columns INTEGER DEFAULT 1 CHECK(columns >= 1 AND columns <= 4),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section elements table (for individual content pieces)
CREATE TABLE IF NOT EXISTS section_elements (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('text', 'image', 'video', 'quote', 'embed')),
  content TEXT,
  media_url TEXT,
  media_id INTEGER,
  alt_text TEXT,
  caption TEXT,
  embed_url TEXT,
  order_index INTEGER DEFAULT 0,
  column_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media table (for Cloudflare R2 file management)
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mimetype TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  folder TEXT DEFAULT 'media',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO projects (title, subtitle, year, category, main_image_url, slug, coming_soon)
VALUES 
('Digital Art Installation', 'Interactive multimedia experience', 2024, 'works', 
 'https://pub-7c8b6de15604429f91020a1b08796bce.r2.dev/projects/sample-1.jpg', 
 'digital-art-installation', false),
('Urban Photography Series', 'Capturing city life through lens', 2024, 'parallel discourses',
 'https://pub-7c8b6de15604429f91020a1b08796bce.r2.dev/projects/sample-2.jpg',
 'urban-photography-series', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO about (content)
VALUES ('Welcome to my portfolio. I am a creative professional working at the intersection of technology and art.')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies (skip if they already exist)
DO $$ 
BEGIN
    -- Public read policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow public read access on projects') THEN
        CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'about' AND policyname = 'Allow public read access on about') THEN
        CREATE POLICY "Allow public read access on about" ON about FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'Allow public read access on sections') THEN
        CREATE POLICY "Allow public read access on sections" ON sections FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'section_elements' AND policyname = 'Allow public read access on section_elements') THEN
        CREATE POLICY "Allow public read access on section_elements" ON section_elements FOR SELECT USING (true);
    END IF;
    
    -- Authenticated write policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow authenticated insert on projects') THEN
        CREATE POLICY "Allow authenticated insert on projects" ON projects FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow authenticated update on projects') THEN
        CREATE POLICY "Allow authenticated update on projects" ON projects FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow authenticated delete on projects') THEN
        CREATE POLICY "Allow authenticated delete on projects" ON projects FOR DELETE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'about' AND policyname = 'Allow authenticated insert on about') THEN
        CREATE POLICY "Allow authenticated insert on about" ON about FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'about' AND policyname = 'Allow authenticated update on about') THEN
        CREATE POLICY "Allow authenticated update on about" ON about FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'Allow authenticated insert on sections') THEN
        CREATE POLICY "Allow authenticated insert on sections" ON sections FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'Allow authenticated update on sections') THEN
        CREATE POLICY "Allow authenticated update on sections" ON sections FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'Allow authenticated delete on sections') THEN
        CREATE POLICY "Allow authenticated delete on sections" ON sections FOR DELETE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'section_elements' AND policyname = 'Allow authenticated insert on section_elements') THEN
        CREATE POLICY "Allow authenticated insert on section_elements" ON section_elements FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'section_elements' AND policyname = 'Allow authenticated update on section_elements') THEN
        CREATE POLICY "Allow authenticated update on section_elements" ON section_elements FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'section_elements' AND policyname = 'Allow authenticated delete on section_elements') THEN
        CREATE POLICY "Allow authenticated delete on section_elements" ON section_elements FOR DELETE USING (true);
    END IF;
    
    -- Media table policies (MISSING!)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Allow public read access on media') THEN
        CREATE POLICY "Allow public read access on media" ON media FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Allow authenticated insert on media') THEN
        CREATE POLICY "Allow authenticated insert on media" ON media FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Allow authenticated update on media') THEN
        CREATE POLICY "Allow authenticated update on media" ON media FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Allow authenticated delete on media') THEN
        CREATE POLICY "Allow authenticated delete on media" ON media FOR DELETE USING (true);
    END IF;
END $$;