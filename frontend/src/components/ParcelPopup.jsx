export default function ParcelPopup({ properties }) {
  const formatArea = (m2) => {
    if (!m2 && m2 !== 0) return 'Unknown';
    if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`;
    return `${m2.toLocaleString()} m²`;
  };

  return (
    <div className="popup-content">
      <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Parcel Information
      </h3>
      
      <div className="popup-row">
        <span className="popup-label">Parcel ID</span>
        <span className="popup-value" style={{ fontWeight: 'bold' }}>
          {properties.id || properties.parcel_id || 'N/A'}
        </span>
      </div>

      <div className="popup-row">
        <span className="popup-label">Commune</span>
        <span className="popup-value">{properties.commune || 'N/A'}</span>
      </div>

      <div className="popup-row">
        <span className="popup-label">Section</span>
        <span className="popup-value">{properties.section || 'N/A'}</span>
      </div>

      <div className="popup-row">
        <span className="popup-label">Number</span>
        <span className="popup-value">{properties.numero || 'N/A'}</span>
      </div>

      <div className="popup-row">
        <span className="popup-label">Area</span>
        <span className="popup-value">
          {formatArea(properties.contenance || properties.area_m2)}
        </span>
      </div>

      <div style={{ marginTop: '10px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
        Ownership data unavailable for this demo.
      </div>
    </div>
  );
}
