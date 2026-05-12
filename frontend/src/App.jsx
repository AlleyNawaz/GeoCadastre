import { useEffect, useState } from 'react';
import Map from './components/Map';
import LoadingScreen from './components/LoadingScreen';
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
        <div className="header-brand">
          <h1>GeoCadastre</h1>
          <span className="badge">PROD</span>
        </div>
        <div className="header-info">
          <span>Dept 02 — Aisne</span>
          {count > 0 && <span className="parcel-count">{count.toLocaleString()} parcels loaded</span>}
        </div>
        
        {/* Debug: confirm env var injection */}
        <div className="api-debug">
          API: {import.meta.env.VITE_API_URL || 'NOT_DEFINED'}
        </div>
      </header>

      <main className="main">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <strong>Unable to load parcel data.</strong>
              <p>{error}</p>
            </div>
            <button className="retry-btn" onClick={() => fetchParcels()}>Retry</button>
          </div>
        )}

        {loading && <LoadingScreen />}

        <Map
          parcels={parcels}
          loading={loading}
          onBoundsChange={fetchParcels}
        />
      </main>

      <footer className="stats-bar">
        <div className="stat">
          <span className="label">Status:</span>
          <span className="value success">● Online</span>
        </div>
        <div className="stat">
          <span className="label">Dataset:</span>
          <span className="value">Etalab Cadastre (02)</span>
        </div>
        <div className="stat highlight">
          <span>Click any parcel for details</span>
        </div>
      </footer>
    </div>
  );
}
