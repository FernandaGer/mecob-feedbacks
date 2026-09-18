-- Execute este SQL no Supabase SQL Editor
-- Settings > SQL Editor > New query > cole e execute

CREATE TABLE IF NOT EXISTS store (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER store_updated_at
  BEFORE UPDATE ON store
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Desativa Row Level Security (acesso via service key no backend)
ALTER TABLE store DISABLE ROW LEVEL SECURITY;
