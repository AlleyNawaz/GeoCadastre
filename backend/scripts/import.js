require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const chain = require(path.join(__dirname, '../node_modules/stream-chain/src/index.js')).chain;
const parser = require(path.join(__dirname, '../node_modules/stream-json/src/parser.js')).parser;
const pick = require(path.join(__dirname, '../node_modules/stream-json/src/filters/pick.js')).pick;
const streamArray = require(path.join(__dirname, '../node_modules/stream-json/src/streamers/stream-array.js')).streamArray;

const BATCH_SIZE = 1000;
const DATA_FILE = path.join(__dirname, '../../cadastre-02-parcelles.json');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runSchema() {
  console.log('--- Running Schema ---');
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Schema applied successfully.');
}

async function importParcels() {
  console.log('--- Importing Parcels ---');
  console.log(`Reading from: ${DATA_FILE}`);

  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Data file not found at ${DATA_FILE}`);
  }

  let count = 0;
  let batch = [];

  const pipeline = chain([
    fs.createReadStream(DATA_FILE),
    parser(),
    pick({ filter: 'features' }),
    streamArray()
  ]);

  return new Promise((resolve, reject) => {
    pipeline.on('data', async (data) => {
      const feature = data.value;
      const { id, properties, geometry } = feature;

      batch.push({
        parcel_id: id,
        department: properties.commune ? properties.commune.substring(0, 2) : '02',
        geometry: JSON.stringify(geometry),
        area_m2: properties.contenance || 0
      });

      if (batch.length >= BATCH_SIZE) {
        pipeline.pause();
        await insertBatch(batch);
        count += batch.length;
        console.log(`Imported ${count} parcels...`);
        batch = [];
        pipeline.resume();
      }
    });

    pipeline.on('end', async () => {
      if (batch.length > 0) {
        await insertBatch(batch);
        count += batch.length;
      }
      console.log(`Finished! Total parcels imported: ${count}`);
      resolve();
    });

    pipeline.on('error', (err) => {
      console.error('Pipeline error:', err);
      reject(err);
    });
  });
}

async function insertBatch(batch) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = `
      INSERT INTO parcels (parcel_id, department, geometry, area_m2)
      VALUES ${batch.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, ST_SetSRID(ST_GeomFromGeoJSON($${i * 4 + 3}), 4326), $${i * 4 + 4})`).join(',')}
      ON CONFLICT (parcel_id) DO NOTHING
    `;
    const values = batch.flatMap(p => [p.parcel_id, p.department, p.geometry, p.area_m2]);
    await client.query(query, values);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function seedOwners() {
  console.log('--- Seeding Owners ---');
  const seedPath = path.join(__dirname, '../../database/seed.sql');
  const seed = fs.readFileSync(seedPath, 'utf8');
  // Run seed in chunks if it's large, but here it's fine
  await pool.query(seed);
  console.log('Seed data applied successfully.');
}

async function main() {
  try {
    await runSchema();
    await importParcels();
    await seedOwners();
    console.log('Deployment setup complete!');
  } catch (err) {
    console.error('Fatal error during setup:', err);
  } finally {
    await pool.end();
  }
}

main();
