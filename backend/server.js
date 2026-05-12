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

// GET /parcels
// Serving GeoJSON from static file as requested for demo
app.get('/parcels', (req, res) => {
  console.log(`--- GET /parcels hit ---`);
  console.log(`Attempting to load from: ${SAMPLE_DATA_PATH}`);

  try {
    if (!fs.existsSync(SAMPLE_DATA_PATH)) {
      console.error(`File not found: ${SAMPLE_DATA_PATH}`);
      return res.status(404).json({ error: 'Sample data file not found' });
    }

    const geojson = JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf8'));
    
    console.log(`Successfully served ${geojson.features?.length || 0} features`);
    res.json(geojson);
  } catch (err) {
    console.error('Error serving GeoJSON:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', demoMode: true });
});

app.get('/', (req, res) => {
  res.json({ message: 'GeoCadastre API running (Demo Mode)', parcels_endpoint: '/parcels' });
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