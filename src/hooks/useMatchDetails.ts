import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS, POLLING_INTERVAL } from '../constants';
import { MatchDetails } from '../types';

export const useMatchDetails = (id: string | undefined, initialMatch?: Partial<MatchDetails> | null) => {
  const [match, setMatch] = useState<MatchDetails | null>(initialMatch ? (initialMatch as MatchDetails) : null);
  const [loading, setLoading] = useState(!initialMatch);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitialMatchRef = useRef(!!initialMatch);

  const fetchDetails = useCallback(async () => {
    if (!id) {
      setError('No match ID provided');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`${API_ENDPOINTS.LOOKUP_EVENT}?id=${id}`);
      const data = response.data?.events?.[0];

      if (data) {
        // Check if the returned data matches the requested ID
        if (data.idEvent && String(data.idEvent) !== String(id)) {
          console.error(`Server returned wrong match: requested ${id}, got ${data.idEvent}`);
          setError('Server returned incorrect data. Please try again.');
          return;
        }
        setMatch(data);
        setError(null);
      } else {
        // Only set error if we don't have initial match data
        if (!hasInitialMatchRef.current) {
          setMatch(null);
          setError('No details available for this match');
        }
      }
    } catch (err) {
      console.error("Error fetching match details:", err);
      // Only set error if we don't have initial match data
      if (!hasInitialMatchRef.current) {
        setMatch(null);
        setError('Failed to fetch match details');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError('No match ID provided');
      setLoading(false);
      return;
    }

    // Update ref when initialMatch changes
    hasInitialMatchRef.current = !!initialMatch;

    // Seed with initial match (from navigation state)
    if (initialMatch) {
      setMatch(initialMatch as MatchDetails);
      setError(null);
      setLoading(false);
    }
    
    // Fetch fresh data
    fetchDetails();

    // Start polling
    timerRef.current = setInterval(fetchDetails, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, fetchDetails]);

  return { match, loading, error };
};
