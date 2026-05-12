const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const SAMPLE_DATA_PATH = path.join(__dirname, '../data/sample-parcels.json');

// GET /api/parcels
// Returns sample parcels GeoJSON
router.get('/', (req, res) => {
  console.log('--- GET /api/parcels ---');
  console.log(`Loading GeoJSON from: ${SAMPLE_DATA_PATH}`);

  try {
    if (!fs.existsSync(SAMPLE_DATA_PATH)) {
      console.error('File not found:', SAMPLE_DATA_PATH);
      return res.status(404).json({ error: 'Sample data file not found' });
    }

    const geojson = JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf8'));
    
    // Inject mock ownership data for demo purposes if not present
    geojson.features = geojson.features.map(f => ({
      ...f,
      properties: {
        ...f.properties,
        siren: f.properties.siren || '552100554', // Mock SIREN
        company_name: f.properties.company_name || 'GeoCadastre Demo Corp'
      }
    }));

    console.log(`Successfully loaded ${geojson.features?.length || 0} features`);
    res.json(geojson);
  } catch (err) {
    console.error('Error serving GeoJSON:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/parcels/:id
// Returns single parcel details from the sample file
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const geojson = JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf8'));
    const feature = geojson.features.find(f => f.id === id || f.properties.parcel_id === id);

    if (!feature) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    // Return in the format the UI expects
    res.json({
      parcel_id: feature.id || feature.properties.parcel_id,
      geometry: feature.geometry,
      ...feature.properties
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;