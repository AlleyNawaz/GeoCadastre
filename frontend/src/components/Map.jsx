import { useEffect, useRef, useCallback, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import ParcelPopup from './ParcelPopup';

// Fix Leaflet default marker icon bug with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const AISNE_CENTER = [49.567, 3.621];
const AISNE_ZOOM = 10;

// Neutral professional styles
const STYLES = {
  default: {
    fillColor:   '#cbd5e1', // Light Blue/Gray (Slate 300)
    fillOpacity: 0.4,
    color:       '#64748b', // Slate 500
    weight:      1,
  },
  hover: {
    fillColor:   '#94a3b8', // Slate 400
    fillOpacity: 0.6,
    color:       '#334155', // Slate 700
    weight:      2,
  },
  selected: {
    fillColor:   '#fb923c', // Orange 400
    fillOpacity: 0.7,
    color:       '#ea580c', // Orange 600
    weight:      3,
  }
};

export default function Map({ parcels, loading }) {
  const geoJsonRef = useRef(null);
  const [selectedParcelId, setSelectedParcelId] = useState(null);

  const getStyle = useCallback((feature) => {
    const id = feature.id || feature.properties.id || feature.properties.parcel_id;
    if (id === selectedParcelId) return STYLES.selected;
    return STYLES.default;
  }, [selectedParcelId]);

  const onEachFeature = useCallback((feature, layer) => {
    const id = feature.id || feature.properties.id || feature.properties.parcel_id;

    layer.on({
      mouseover: (e) => {
        if (id !== selectedParcelId) {
          e.target.setStyle(STYLES.hover);
          e.target.bringToFront();
        }
      },
      mouseout: (e) => {
        if (id !== selectedParcelId) {
          e.target.setStyle(STYLES.default);
        }
      },
      click: (e) => {
        setSelectedParcelId(id);
        
        // Render popup
        const popupContent = renderToStaticMarkup(
          <ParcelPopup properties={feature.properties} />
        );
        layer.bindPopup(popupContent, { maxWidth: 300, className: 'custom-parcel-popup' }).openPopup();
        
        // Center view slightly if needed
        e.target.setStyle(STYLES.selected);
        e.target.bringToFront();
      }
    });
  }, [selectedParcelId]);

  // Reset highlight when popup closes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(getStyle);
    }
  }, [selectedParcelId, getStyle]);

  return (
    <div className="map-container" style={{ position: 'relative', height: '100%', width: '100%' }}>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Loading spatial data...</span>
        </div>
      )}
      <MapContainer
        center={AISNE_CENTER}
        zoom={AISNE_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parcels && (
          <GeoJSON
            ref={geoJsonRef}
            key={selectedParcelId ? `selected-${selectedParcelId}` : 'no-selection'}
            data={parcels}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
