const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/parcels
// Returns all parcels as GeoJSON FeatureCollection
router.get('/', async (req, res) => {
  try {
    const { bbox, limit = 500 } = req.query;

    let whereClause = '';
    let params = [parseInt(limit)];

    if (bbox) {
      // bbox format: minLng,minLat,maxLng,maxLat
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      whereClause = `WHERE ST_Intersects(p.geometry, ST_MakeEnvelope($2, $3, $4, $5, 4326))`;
      params = [parseInt(limit), minLng, minLat, maxLng, maxLat];
    }

    const query = `
      SELECT
        p.parcel_id,
        p.area_m2,
        ST_AsGeoJSON(
          ST_Simplify(p.geometry, 0.00001)
        )::json AS geometry,
        o.siren,
        o.company_name
      FROM parcels p
      LEFT JOIN owners o ON p.parcel_id = o.parcel_id
      ${whereClause}
      LIMIT $1
    `;

    const result = await pool.query(query, params);

    const featureCollection = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          parcel_id:    row.parcel_id,
          area_m2:      row.area_m2,
          siren:        row.siren || 'Unknown',
          company_name: row.company_name || 'Unknown owner',
        }
      }))
    };

    res.json(featureCollection);
  } catch (err) {
    console.error('Fetch parcels error:', err);
    res.status(500).json({ 
      error: err.message, 
      details: 'Check if the parcels table exists and is populated in the production database.' 
    });
  }
});

// GET /api/parcels/search/by-siren?siren=552100554
// Returns all parcels owned by a company
router.get('/search/by-siren', async (req, res) => {
  try {
    const { siren } = req.query;

    if (!siren) {
      return res.status(400).json({ error: 'siren parameter required' });
    }

    const query = `
      SELECT
        p.parcel_id,
        p.area_m2,
        ST_AsGeoJSON(p.geometry)::json AS geometry,
        o.siren,
        o.company_name
      FROM parcels p
      JOIN owners o ON p.parcel_id = o.parcel_id
      WHERE o.siren = $1
    `;

    const result = await pool.query(query, [siren]);

    res.json({
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          parcel_id:    row.parcel_id,
          area_m2:      row.area_m2,
          siren:        row.siren,
          company_name: row.company_name,
        }
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/health
// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: err.message,
      hint: 'Check your database environment variables and connectivity.'
    });
  }
});

// GET /api/parcels/:id
// Returns single parcel with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        p.parcel_id,
        p.department,
        p.area_m2,
        ST_AsGeoJSON(p.geometry)::json AS geometry,
        o.siren,
        o.company_name,
        o.ownership_pct
      FROM parcels p
      LEFT JOIN owners o ON p.parcel_id = o.parcel_id
      WHERE p.parcel_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch parcel by ID error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;