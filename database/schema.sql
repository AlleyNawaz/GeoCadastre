CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS parcels (
  id            SERIAL PRIMARY KEY,
  parcel_id     VARCHAR(50) UNIQUE NOT NULL,
  department    VARCHAR(3) NOT NULL DEFAULT '02',
  geometry      GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  area_m2       FLOAT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcels_geometry
  ON parcels USING GIST(geometry);

CREATE INDEX IF NOT EXISTS idx_parcels_parcel_id
  ON parcels(parcel_id);

CREATE TABLE IF NOT EXISTS owners (
  id            SERIAL PRIMARY KEY,
  parcel_id     VARCHAR(50) NOT NULL REFERENCES parcels(parcel_id),
  siren         VARCHAR(9) NOT NULL,
  company_name  VARCHAR(255),
  ownership_pct FLOAT DEFAULT 100.0,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owners_parcel_id
  ON owners(parcel_id);

CREATE INDEX IF NOT EXISTS idx_owners_siren
  ON owners(siren);

CREATE OR REPLACE VIEW parcels_with_owners AS
SELECT
  p.parcel_id,
  p.department,
  p.area_m2,
  ST_AsGeoJSON(p.geometry)::json AS geometry,
  o.siren,
  o.company_name,
  o.ownership_pct
FROM parcels p
LEFT JOIN owners o ON p.parcel_id = o.parcel_id;