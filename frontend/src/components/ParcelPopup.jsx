export default function ParcelPopup({ properties }) {
  const formatArea = (m2) => {
    if (!m2) return 'Unknown';
    if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`;
    return `${m2.toFixed(0)} m²`;
  };

  return (
    <div className="popup-content">
      <h3>Parcel Information</h3>
      <div className="popup-row">
        <span className="popup-label">Parcel ID</span>
        <span className="popup-value">{properties.parcel_id}</span>
      </div>
      <div className="popup-row">
        <span className="popup-label">SIREN</span>
        <span className="siren-badge">
          {properties.siren || 'Not registered'}
        </span>
      </div>
      <div className="popup-row">
        <span className="popup-label">Company</span>
        <span className="popup-value">
          {properties.company_name || 'Unknown'}
        </span>
      </div>
      <div className="popup-row">
        <span className="popup-label">Area</span>
        <span className="popup-value">
          {formatArea(properties.area_m2)}
        </span>
      </div>
    </div>
  );
}
