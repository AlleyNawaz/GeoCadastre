import { useState, useEffect, useCallback } from 'react';

// Use environment variable or relative path for production
const API_URL = import.meta.env.VITE_API_URL || '/parcels';

export function useParcels() {
  const [parcels, setParcels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const fetchParcels = useCallback(async (bbox = null) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`--- Fetching parcels from ${API_URL} ---`);
      
      const url = new URL(API_URL, window.location.origin);
      if (bbox) url.searchParams.append('bbox', bbox);

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      console.log('GeoJSON response successfully received:', data);
      
      setParcels(data);
      setCount(data.features?.length || 0);
    } catch (err) {
      console.error('Fetch parcels failed:', err);
      setError(err.message || 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParcelById = useCallback(async (parcelId) => {
    try {
      const response = await fetch(`${API_URL}/${parcelId}`);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Fetch parcel by ID failed:', err);
      return null;
    }
  }, []);

  return { parcels, loading, error, count, fetchParcels, fetchParcelById };
}
