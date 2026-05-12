import { useState, useEffect, useCallback } from 'react';

// Strict use of environment variable for production
const API_URL = import.meta.env.VITE_API_URL;

export function useParcels() {
  const [parcels, setParcels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const fetchParcels = useCallback(async (bbox = null) => {
    setLoading(true);
    setError(null);
    try {
      console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
      const baseUrl = import.meta.env.VITE_API_URL;
      
      if (!baseUrl) {
        throw new Error("VITE_API_URL is not defined. Please check your Vercel environment variables.");
      }

      // Ensure we use the exact URL provided in env, appending /parcels
      const fetchUrl = `${baseUrl}/parcels${bbox ? `?bbox=${bbox}` : ''}`;
      console.log("Using API:", fetchUrl);

      const response = await fetch(fetchUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true' // Required to bypass ngrok landing page
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("GeoJSON received:", data);
      
      setParcels(data);
      setCount(data.features?.length || 0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch parcels");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParcelById = useCallback(async (parcelId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/parcels/${parcelId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Fetch parcel by ID failed:", err);
      return null;
    }
  }, []);

  return { parcels, loading, error, count, fetchParcels, fetchParcelById };
}
