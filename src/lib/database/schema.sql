-- =====================================================
-- SCHEMA DATABASE OTTIMIZZATO PER URBANOVA
-- Sistema completo per comuni e zone urbane italiane
-- =====================================================

-- Estensioni PostgreSQL necessarie
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =====================================================
-- TABELLE PRINCIPALI
-- =====================================================

-- Tabella regioni
CREATE TABLE regioni (
  id SERIAL PRIMARY KEY,
  codice_istat VARCHAR(2) UNIQUE NOT NULL,
  nome VARCHAR(50) NOT NULL,
  nome_ascii VARCHAR(50),
  codice_nuts VARCHAR(3),
  latitudine DECIMAL(10,8),
  longitudine DECIMAL(11,8),
  geometry GEOMETRY(POINT, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella province
CREATE TABLE province (
  id SERIAL PRIMARY KEY,
  codice_istat VARCHAR(3) UNIQUE NOT NULL,
  nome VARCHAR(50) NOT NULL,
  nome_ascii VARCHAR(50),
  sigla VARCHAR(2),
  regione_id INTEGER REFERENCES regioni(id) ON DELETE CASCADE,
  latitudine DECIMAL(10,8),
  longitudine DECIMAL(11,8),
  geometry GEOMETRY(POINT, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella comuni principale
CREATE TABLE comuni (
  id SERIAL PRIMARY KEY,
  codice_istat VARCHAR(6) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  nome_ascii VARCHAR(100),
  nome_altri VARCHAR(200),
  regione_id INTEGER NOT NULL REFERENCES regioni(id) ON DELETE CASCADE,
  provincia_id INTEGER NOT NULL REFERENCES province(id) ON DELETE CASCADE,
  cap VARCHAR(5),
  popolazione INTEGER DEFAULT 0,
  superficie DECIMAL(10,2) DEFAULT 0,
  altitudine INTEGER DEFAULT 0,
  zona_climatica VARCHAR(20),
  zona_sismica VARCHAR(20),
  codice_catastale VARCHAR(4),
  prefisso_telefonico VARCHAR(4),
  latitudine DECIMAL(10,8) NOT NULL,
  longitudine DECIMAL(11,8) NOT NULL,
  geometry GEOMETRY(POINT, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Vincoli di integrità
  CONSTRAINT chk_latitudine CHECK (latitudine >= -90 AND latitudine <= 90),
  CONSTRAINT chk_longitudine CHECK (longitudine >= -180 AND longitudine <= 180),
  CONSTRAINT chk_popolazione CHECK (popolazione >= 0),
  CONSTRAINT chk_superficie CHECK (superficie >= 0),
  CONSTRAINT chk_altitudine CHECK (altitudine >= -500 AND altitudine <= 5000)
);

-- Tabella zone urbane
CREATE TABLE zone_urbane (
  id SERIAL PRIMARY KEY,
  comune_id INTEGER REFERENCES comuni(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo_zona VARCHAR(50) NOT NULL CHECK (tipo_zona IN (
    'quartiere', 'frazione', 'località', 'zona_industriale', 
    'centro_storico', 'periferia', 'zona_residenziale',
    'zona_commerciale', 'zona_artigianale', 'zona_agricola'
  )),
  codice_istat VARCHAR(10),
  popolazione INTEGER DEFAULT 0,
  superficie DECIMAL(10,2) DEFAULT 0,
  altitudine INTEGER DEFAULT 0,
  latitudine DECIMAL(10,8),
  longitudine DECIMAL(11,8),
  geometry GEOMETRY(POINT, 4326),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Vincoli di integrità
  CONSTRAINT chk_zona_latitudine CHECK (latitudine IS NULL OR (latitudine >= -90 AND latitudine <= 90)),
  CONSTRAINT chk_zona_longitudine CHECK (longitudine IS NULL OR (longitudine >= -180 AND longitudine <= 180)),
  CONSTRAINT chk_zona_popolazione CHECK (popolazione >= 0),
  CONSTRAINT chk_zona_superficie CHECK (superficie >= 0)
);

-- =====================================================
-- TABELLE DI SUPPORTO
-- =====================================================

-- Tabella per audit e monitoraggio
CREATE TABLE audit_results (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  version VARCHAR(20) NOT NULL,
  system_status VARCHAR(20) NOT NULL,
  metrics JSONB NOT NULL,
  issues JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella per cache ricerche
CREATE TABLE search_cache (
  id SERIAL PRIMARY KEY,
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  query_params JSONB NOT NULL,
  results JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella per statistiche utilizzo
CREATE TABLE usage_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  total_searches INTEGER DEFAULT 0,
  successful_searches INTEGER DEFAULT 0,
  failed_searches INTEGER DEFAULT 0,
  avg_response_time DECIMAL(10,3) DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDICI PER PERFORMANCE OTTIMALE
-- =====================================================

-- Indici per comuni
CREATE INDEX idx_comuni_codice_istat ON comuni(codice_istat);
CREATE INDEX idx_comuni_nome ON comuni USING gin(nome gin_trgm_ops);
CREATE INDEX idx_comuni_nome_ascii ON comuni USING gin(nome_ascii gin_trgm_ops);
CREATE INDEX idx_comuni_geometry ON comuni USING gist(geometry);
CREATE INDEX idx_comuni_regione ON comuni(regione_id);
CREATE INDEX idx_comuni_provincia ON comuni(provincia_id);
CREATE INDEX idx_comuni_popolazione ON comuni(popolazione);
CREATE INDEX idx_comuni_coordinate ON comuni(latitudine, longitudine);

-- Indici per zone urbane
CREATE INDEX idx_zone_urbane_comune ON zone_urbane(comune_id);
CREATE INDEX idx_zone_urbane_tipo ON zone_urbane(tipo_zona);
CREATE INDEX idx_zone_urbane_nome ON zone_urbane USING gin(nome gin_trgm_ops);
CREATE INDEX idx_zone_urbane_geometry ON zone_urbane USING gist(geometry);
CREATE INDEX idx_zone_urbane_coordinate ON zone_urbane(latitudine, longitudine);

-- Indici per regioni e province
CREATE INDEX idx_regioni_codice_istat ON regioni(codice_istat);
CREATE INDEX idx_regioni_nome ON regioni USING gin(nome gin_trgm_ops);
CREATE INDEX idx_province_codice_istat ON province(codice_istat);
CREATE INDEX idx_province_nome ON province USING gin(nome gin_trgm_ops);
CREATE INDEX idx_province_regione ON province(regione_id);

-- Indici per ricerca geografica
CREATE INDEX idx_comuni_geo_search ON comuni USING gist(
  ST_Buffer(geometry::geography, 1000)::geometry
);
CREATE INDEX idx_zone_geo_search ON zone_urbane USING gist(
  ST_Buffer(geometry::geography, 1000)::geometry
);

-- Indici per ricerca full-text
CREATE INDEX idx_comuni_fulltext ON comuni USING gin(
  to_tsvector('italian', nome || ' ' || COALESCE(nome_ascii, '') || ' ' || COALESCE(nome_altri, ''))
);
CREATE INDEX idx_zone_fulltext ON zone_urbane USING gin(
  to_tsvector('italian', nome)
);

-- Indici per cache e statistiche
CREATE INDEX idx_search_cache_hash ON search_cache(query_hash);
CREATE INDEX idx_search_cache_expires ON search_cache(expires_at);
CREATE INDEX idx_usage_stats_date ON usage_stats(date);

-- =====================================================
-- FUNZIONI E TRIGGER
-- =====================================================

-- Funzione per aggiornare timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare timestamp
CREATE TRIGGER update_comuni_updated_at 
  BEFORE UPDATE ON comuni 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zone_urbane_updated_at 
  BEFORE UPDATE ON zone_urbane 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regioni_updated_at 
  BEFORE UPDATE ON regioni 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_province_updated_at 
  BEFORE UPDATE ON province 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per creare geometrie automaticamente
CREATE OR REPLACE FUNCTION create_geometry_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitudine IS NOT NULL AND NEW.longitudine IS NOT NULL THEN
    NEW.geometry = ST_SetSRID(ST_MakePoint(NEW.longitudine, NEW.latitudine), 4326);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per creare geometrie
CREATE TRIGGER create_comuni_geometry 
  BEFORE INSERT OR UPDATE ON comuni 
  FOR EACH ROW EXECUTE FUNCTION create_geometry_from_coordinates();

CREATE TRIGGER create_zone_geometry 
  BEFORE INSERT OR UPDATE ON zone_urbane 
  FOR EACH ROW EXECUTE FUNCTION create_geometry_from_coordinates();

-- =====================================================
-- VISTE PER FACILITARE LE QUERY
-- =====================================================

-- Vista per comuni con informazioni complete
CREATE VIEW comuni_completi AS
SELECT 
  c.id,
  c.codice_istat,
  c.nome,
  c.nome_ascii,
  c.nome_altri,
  c.cap,
  c.popolazione,
  c.superficie,
  c.altitudine,
  c.zona_climatica,
  c.zona_sismica,
  c.codice_catastale,
  c.prefisso_telefonico,
  c.latitudine,
  c.longitudine,
  c.geometry,
  r.nome as regione_nome,
  r.codice_istat as regione_codice,
  p.nome as provincia_nome,
  p.codice_istat as provincia_codice,
  p.sigla as provincia_sigla,
  c.created_at,
  c.updated_at
FROM comuni c
JOIN regioni r ON c.regione_id = r.id
JOIN province p ON c.provincia_id = p.id;

-- Vista per zone urbane con informazioni comuni
CREATE VIEW zone_urbane_complete AS
SELECT 
  z.id,
  z.nome,
  z.tipo_zona,
  z.codice_istat,
  z.popolazione,
  z.superficie,
  z.altitudine,
  z.latitudine,
  z.longitudine,
  z.geometry,
  z.metadata,
  c.nome as comune_nome,
  c.codice_istat as comune_codice,
  r.nome as regione_nome,
  p.nome as provincia_nome,
  z.created_at,
  z.updated_at
FROM zone_urbane z
JOIN comuni c ON z.comune_id = c.id
JOIN regioni r ON c.regione_id = r.id
JOIN province p ON c.provincia_id = p.id;

-- =====================================================
-- FUNZIONI DI RICERCA AVANZATA
-- =====================================================

-- Funzione per ricerca comuni per distanza
CREATE OR REPLACE FUNCTION find_comuni_by_distance(
  center_lat DECIMAL(10,8),
  center_lng DECIMAL(11,8),
  radius_km DECIMAL(10,2)
)
RETURNS TABLE (
  id INTEGER,
  nome VARCHAR(100),
  provincia VARCHAR(50),
  regione VARCHAR(50),
  latitudine DECIMAL(10,8),
  longitudine DECIMAL(11,8),
  popolazione INTEGER,
  distance_km DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nome,
    p.nome as provincia,
    r.nome as regione,
    c.latitudine,
    c.longitudine,
    c.popolazione,
    ST_Distance(
      c.geometry::geography,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
    ) / 1000 as distance_km
  FROM comuni c
  JOIN regioni r ON c.regione_id = r.id
  JOIN province p ON c.provincia_id = p.id
  WHERE ST_DWithin(
    c.geometry::geography,
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Funzione per ricerca full-text
CREATE OR REPLACE FUNCTION search_locations(
  search_query TEXT,
  location_type VARCHAR(20) DEFAULT 'all',
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id INTEGER,
  nome VARCHAR(100),
  tipo VARCHAR(50),
  provincia VARCHAR(50),
  regione VARCHAR(50),
  latitudine DECIMAL(10,8),
  longitudine DECIMAL(11,8),
  popolazione INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    -- Comuni
    SELECT 
      c.id,
      c.nome,
      'comune'::VARCHAR(50) as tipo,
      p.nome as provincia,
      r.nome as regione,
      c.latitudine,
      c.longitudine,
      c.popolazione,
      ts_rank(
        to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, '') || ' ' || COALESCE(c.nome_altri, '')),
        plainto_tsquery('italian', search_query)
      ) as rank
    FROM comuni c
    JOIN regioni r ON c.regione_id = r.id
    JOIN province p ON c.provincia_id = p.id
    WHERE to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, '') || ' ' || COALESCE(c.nome_altri, ''))
          @@ plainto_tsquery('italian', search_query)
      AND (location_type = 'all' OR location_type = 'comune')
    
    UNION ALL
    
    -- Zone urbane
    SELECT 
      z.id + 1000000 as id, -- Offset per evitare conflitti ID
      z.nome,
      z.tipo_zona as tipo,
      p.nome as provincia,
      r.nome as regione,
      z.latitudine,
      z.longitudine,
      z.popolazione,
      ts_rank(
        to_tsvector('italian', z.nome),
        plainto_tsquery('italian', search_query)
      ) as rank
    FROM zone_urbane z
    JOIN comuni c ON z.comune_id = c.id
    JOIN regioni r ON c.regione_id = r.id
    JOIN province p ON c.provincia_id = p.id
    WHERE to_tsvector('italian', z.nome) @@ plainto_tsquery('italian', search_query)
      AND (location_type = 'all' OR location_type = 'zona')
  )
  SELECT * FROM search_results
  ORDER BY rank DESC, popolazione DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATI INIZIALI
-- =====================================================

-- Inserimento regioni italiane
INSERT INTO regioni (codice_istat, nome, nome_ascii, latitudine, longitudine) VALUES
('01', 'Piemonte', 'Piemonte', 45.0703, 7.6869),
('02', 'Valle d''Aosta', 'Valle d''Aosta', 45.7375, 7.3136),
('03', 'Lombardia', 'Lombardia', 45.4642, 9.1900),
('04', 'Trentino-Alto Adige', 'Trentino-Alto Adige', 46.0748, 11.1217),
('05', 'Veneto', 'Veneto', 45.4408, 12.3155),
('06', 'Friuli-Venezia Giulia', 'Friuli-Venezia Giulia', 45.6495, 13.7684),
('07', 'Liguria', 'Liguria', 44.4056, 8.9463),
('08', 'Emilia-Romagna', 'Emilia-Romagna', 44.4949, 11.3426),
('09', 'Toscana', 'Toscana', 43.7711, 11.2486),
('10', 'Umbria', 'Umbria', 43.1067, 12.3888),
('11', 'Marche', 'Marche', 43.6169, 13.5187),
('12', 'Lazio', 'Lazio', 41.9028, 12.4964),
('13', 'Abruzzo', 'Abruzzo', 42.3540, 13.3917),
('14', 'Molise', 'Molise', 41.5579, 14.6591),
('15', 'Campania', 'Campania', 40.8518, 14.2681),
('16', 'Puglia', 'Puglia', 41.1177, 16.8719),
('17', 'Basilicata', 'Basilicata', 40.6395, 15.8053),
('18', 'Calabria', 'Calabria', 38.9059, 16.5845),
('19', 'Sicilia', 'Sicilia', 37.5994, 14.0154),
('20', 'Sardegna', 'Sardegna', 39.2238, 9.1217);

-- =====================================================
-- COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON TABLE comuni IS 'Tabella principale per tutti i comuni italiani con dati ISTAT';
COMMENT ON TABLE zone_urbane IS 'Tabella per zone urbane (quartieri, frazioni, località)';
COMMENT ON TABLE regioni IS 'Tabella regioni italiane';
COMMENT ON TABLE province IS 'Tabella province italiane';

COMMENT ON COLUMN comuni.codice_istat IS 'Codice ISTAT univoco a 6 cifre';
COMMENT ON COLUMN comuni.geometry IS 'Geometria PostGIS per ricerche spaziali';
COMMENT ON COLUMN zone_urbane.tipo_zona IS 'Tipo di zona urbana (quartiere, frazione, etc.)';
COMMENT ON COLUMN zone_urbane.metadata IS 'Metadati aggiuntivi in formato JSON';

-- =====================================================
-- FINE SCHEMA
-- =====================================================

