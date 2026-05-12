# GeoCadastre

Interactive map showing land parcel ownership for department 02
(Aisne, France). Click any parcel to see the owning company's
SIREN number and name.

## Stack
- Frontend: React + Leaflet
- Backend: Node.js + Express
- Database: PostgreSQL + PostGIS

## Prerequisites
- Node.js 18+
- PostgreSQL 15+ with PostGIS extension
- ogr2ogr (part of GDAL)

## Setup

### 1. Database
```bash
createdb cadastre
psql cadastre -c "CREATE EXTENSION postgis;"
psql cadastre -f database/schema.sql
psql cadastre -f database/seed.sql
```

### 2. Import parcel data
Download cadastre-02-parcelles.json from
https://cadastre.data.gouv.fr/data/etalab-cadastre/latest/geojson/departements/02/

```bash
ogr2ogr -f PostgreSQL \
  PG:"dbname=cadastre user=postgres" \
  data/cadastre-02-parcelles.json \
  -nln parcels_import -t_srs EPSG:4326

psql cadastre -c "
  INSERT INTO parcels (parcel_id, geometry, area_m2)
  SELECT id, ST_Multi(wkb_geometry), contenance
  FROM parcels_import;
  DROP TABLE parcels_import;
"
```

### 3. Backend
```bash
cd backend
cp ../.env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173 (Vite default)
```

## API Endpoints
- `GET /api/parcels`           All parcels as GeoJSON
- `GET /api/parcels/:id`       Single parcel details
- `GET /api/parcels/search/by-siren?siren=552100554`

## Known Limitations
- Uses seed ownership data not real MAJIC files
- Limited to 500 parcels per request for performance
- SIRENE company lookup not implemented (bonus)
