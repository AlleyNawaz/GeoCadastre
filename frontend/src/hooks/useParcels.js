import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/_/backend/api';
// Fallback for local development if VITE_API_BASE is not set and we're not on Vercel
const FINAL_API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : API_BASE;

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

      const response = await axios.get(`${FINAL_API_BASE}/parcels`, { params });
      setParcels(response.data);
      setCount(response.data.features?.length || 0);
    } catch (err) {
      const error = err.response?.data?.error || err.message;
      const details = err.response?.data?.details ? ` - ${err.response.data.details}` : '';
      setError(`${error}${details}`);
      console.error('Failed to fetch parcels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParcelById = useCallback(async (parcelId) => {
    try {
      const response = await axios.get(`${FINAL_API_BASE}/parcels/${parcelId}`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch parcel:', err);
      return null;
    }
  }, []);

  return { parcels, loading, error, count, fetchParcels, fetchParcelById };
}
