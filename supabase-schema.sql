-- Supabase schema for GSC Workshop form submissions
-- Run this in your Supabase SQL editor

-- Main submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relacion_areas TEXT,
  sistemas_herramientas TEXT,
  expectativas_ia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants per submission
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Areas per submission
CREATE TABLE areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  como_trabaja TEXT DEFAULT '',
  herramientas TEXT DEFAULT '',
  coordina TEXT DEFAULT '',
  tareas TEXT DEFAULT '',
  ia_ayuda TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files (linked to areas or standalone additional files)
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  cloudinary_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_participants_submission ON participants(submission_id);
CREATE INDEX idx_areas_submission ON areas(submission_id);
CREATE INDEX idx_files_submission ON files(submission_id);
CREATE INDEX idx_files_area ON files(area_id);

-- Enable RLS (optional but recommended)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by our API)
CREATE POLICY "Service role access" ON submissions FOR ALL USING (true);
CREATE POLICY "Service role access" ON participants FOR ALL USING (true);
CREATE POLICY "Service role access" ON areas FOR ALL USING (true);
CREATE POLICY "Service role access" ON files FOR ALL USING (true);
