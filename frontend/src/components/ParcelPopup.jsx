export default function ParcelPopup({ properties }) {
  const formatArea = (m2) => {
    if (m2 === undefined || m2 === null) return 'N/A';
    return `${m2.toLocaleString('fr-FR')} m²`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr;
  };

  const formatBoolean = (val) => {
    if (val === true) return 'Yes';
    if (val === false) return 'No';
    return 'N/A';
  };

  return (
    <div className="popup-container" style={{ 
      padding: '4px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      minWidth: '220px'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '16px', 
        fontWeight: '600',
        color: '#111',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '8px'
      }}>
        Parcel Information
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <DataRow label="Parcel ID" value={properties.id || properties.parcel_id} />
        <DataRow label="Commune" value={properties.commune} />
        <DataRow label="Section" value={properties.section} />
        <DataRow label="Number" value={properties.numero} />
        <DataRow label="Area" value={formatArea(properties.contenance || properties.area_m2)} />
        <DataRow label="Surveyed" value={formatBoolean(properties.arpente)} />
        <DataRow label="Created" value={formatDate(properties.created)} />
        <DataRow label="Updated" value={formatDate(properties.updated)} />
        
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
          <DataRow label="SIREN" value="Not available" muted />
          <DataRow label="Company" value="Not available" muted />
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value, muted }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      fontSize: '13px',
      lineHeight: '1.4'
    }}>
      <span style={{ color: '#6b7280', fontWeight: '400' }}>{label}</span>
      <span style={{ 
        color: muted ? '#9ca3af' : '#111', 
        fontWeight: '500',
        textAlign: 'right',
        marginLeft: '12px'
      }}>
        {value || 'N/A'}
      </span>
    </div>
  );
}
