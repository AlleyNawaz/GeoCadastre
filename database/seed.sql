-- Seed ownership data
INSERT INTO owners (parcel_id, siren, company_name, ownership_pct)
SELECT
  parcel_id,
  LPAD(FLOOR(RANDOM() * 999999999)::TEXT, 9, '0') AS siren,
  (ARRAY[
    'Société Foncière Aisne',
    'Agricole du Nord SAS',
    'Domaines Picardie SARL',
    'Terres et Cultures SA',
    'Exploitation Familiale Dubois',
    'Groupement Foncier Agricole 02',
    'SCI Les Champs du Nord',
    'EARL de la Vallée',
    'Coopérative Agricole Aisne',
    'Immobilier Rural France'
  ])[FLOOR(RANDOM() * 10 + 1)] AS company_name,
  100.0 AS ownership_pct
FROM parcels
LIMIT 10000;

-- Manual inserts for known SIRENs
INSERT INTO owners (parcel_id, siren, company_name) VALUES
('02001000AA0001', '552100554', 'EDF SA'),
('02001000AA0002', '542051180', 'SNCF Réseau'),
('02001000AB0001', '853514632', 'Mairie de Laon')
ON CONFLICT DO NOTHING;
