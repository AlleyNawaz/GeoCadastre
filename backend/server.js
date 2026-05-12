require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const SAMPLE_DATA_PATH = path.join(__dirname, 'data/sample-parcels.json');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Helper to get formatted properties
const enrichProperties = (feature) => {
  const props = feature.properties || {};
  return {
    parcel_id: feature.id || props.parcel_id || 'Unknown ID',
    department: props.commune ? props.commune.substring(0, 2) : '02',
    area_m2: Math.round(props.contenance || 0),
    siren: props.siren || '552100554',
    company_name: props.company_name || 'Société Foncière Aisne',
    commune: props.commune || 'Unknown'
  };
};

// GET /parcels
app.get('/parcels', (req, res) => {
  console.log(`--- GET /parcels hit ---`);

  try {
    if (!fs.existsSync(SAMPLE_DATA_PATH)) {
      return res.status(404).json({ error: 'Sample data file not found' });
    }

    const geojson = JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf8'));
    
    // Enrich all features with ownership and metadata
    geojson.features = geojson.features.map(f => ({
      ...f,
      properties: enrichProperties(f)
    }));

    console.log(`Successfully served ${geojson.features?.length || 0} features`);
    res.json(geojson);
  } catch (err) {
    console.error('Error serving GeoJSON:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /parcels/:id
app.get('/parcels/:id', (req, res) => {
  try {
    const { id } = req.params;
    const geojson = JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf8'));
    const feature = geojson.features.find(f => f.id === id || f.properties.parcel_id === id);

    if (!feature) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    res.json(enrichProperties(feature));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'demo', exposed_via: 'ngrok' });
});

app.get('/', (req, res) => {
  res.json({ 
    app: 'GeoCadastre API', 
    endpoints: {
      parcels: '/parcels',
      health: '/health'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;