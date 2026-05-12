import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export function useParcels() {
  const [parcels, setParcels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const fetchParcels = useCallback(async (bbox = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 500 };
      if (bbox) params.bbox = bbox;

      const response = await axios.get(`${API_BASE}/parcels`, { params });
      setParcels(response.data);
      setCount(response.data.features?.length || 0);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch parcels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParcelById = useCallback(async (parcelId) => {
    try {
      const response = await axios.get(`${API_BASE}/parcels/${parcelId}`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch parcel:', err);
      return null;
    }
  }, []);

  return { parcels, loading, error, count, fetchParcels, fetchParcelById };
}
