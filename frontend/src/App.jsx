import { useEffect, useState } from 'react';
import Map from './components/Map';
import { useParcels } from './hooks/useParcels';
import './index.css';

export default function App() {
  const { parcels, loading, error, count, fetchParcels } = useParcels();

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  return (
    <div className="app">
      <header className="header">
        <h1>GeoCadastre</h1>
        <span>Department 02 — Aisne, France</span>
        {count > 0 && (
          <span style={{ marginLeft: 'auto' }}>
            {count} parcels loaded
          </span>
        )}
      </header>

      {error && (
        <div style={{
          background: '#fef2f2',
          color: '#dc2626',
          padding: '8px 16px',
          fontSize: '13px'
        }}>
          Error loading parcels: {error}
        </div>
      )}

      <Map
        parcels={parcels}
        loading={loading}
        onBoundsChange={fetchParcels}
      />

      <div className="stats-bar">
        <span>Parcels: {count}</span>
        <span>Department: 02 (Aisne)</span>
        <span>Click any parcel to see ownership details</span>
      </div>
    </div>
  );
}
