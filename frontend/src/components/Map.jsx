import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
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

// Department 02 (Aisne) center coordinates
const AISNE_CENTER = [49.567, 3.621];
const AISNE_ZOOM = 10;

// Auto-zoom component
function MapAutoBounds({ data }) {
  const map = useMap();
  useEffect(() => {
    if (data && data.features && data.features.length > 0) {
      const geojsonLayer = L.geoJSON(data);
      map.fitBounds(geojsonLayer.getBounds(), { padding: [20, 20], maxZoom: 16 });
    }
  }, [data, map]);
  return null;
}

// Map events handler
function MapEvents({ onBoundsChange }) {
  const map = useMap();
  useEffect(() => {
    const handleMove = () => {
      const bounds = map.getBounds();
      const bbox = [
        bounds.getWest(), bounds.getSouth(),
        bounds.getEast(), bounds.getNorth()
      ].join(',');
      onBoundsChange(bbox);
    };
    
    map.on('moveend', handleMove);
    return () => map.off('moveend', handleMove);
  }, [map, onBoundsChange]);
  return null;
}

function parcelStyle(feature) {
  const hasOwner = feature.properties.siren &&
                   feature.properties.siren !== 'Unknown';
  return {
    fillColor:   hasOwner ? '#1a56db' : '#9ca3af',
    fillOpacity: 0.3,
    color:       hasOwner ? '#1e40af' : '#6b7280',
    weight:      1,
    opacity:     0.8,
  };
}

function parcelStyleHover() {
  return {
    fillColor:   '#f59e0b',
    fillOpacity: 0.5,
    color:       '#d97706',
    weight:      2,
    opacity:     1,
  };
}

export default function Map({ parcels, loading, onBoundsChange }) {
  const geoJsonRef = useRef(null);

  const onEachFeature = useCallback((feature, layer) => {
    const { properties } = feature;

    // Hover effects
    layer.on('mouseover', () => {
      layer.setStyle(parcelStyleHover());
      layer.bringToFront();
    });
    layer.on('mouseout', () => {
      layer.setStyle(parcelStyle(feature));
    });

    // Click — show popup
    layer.on('click', () => {
      const popupContent = renderToStaticMarkup(
        <ParcelPopup properties={properties} />
      );
      layer
        .bindPopup(popupContent, { maxWidth: 280 })
        .openPopup();
    });
  }, []);

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      {loading && (
        <div className="loading-overlay">
          Loading parcels...
        </div>
      )}
      <MapContainer
        center={AISNE_CENTER}
        zoom={AISNE_ZOOM}
        preferCanvas={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapAutoBounds data={parcels} />
        <MapEvents onBoundsChange={onBoundsChange} />
        {parcels && (
          <GeoJSON
            ref={geoJsonRef}
            key={JSON.stringify(parcels.features?.length)}
            data={parcels}
            style={parcelStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
