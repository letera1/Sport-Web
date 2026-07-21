import { useState, useEffect, useRef, useCallback } from 'react';
import { lookupEvent } from '../services/sportsApi';
import { POLLING_INTERVAL } from '../constants';
import type { MatchDetails } from '../types';

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
      const data = await lookupEvent(id);

      if (data) {
        if (data.idEvent && String(data.idEvent) !== String(id)) {
          console.error(`Server returned wrong match: requested ${id}, got ${data.idEvent}`);
          setError('Server returned incorrect data. Please try again.');
          return;
        }
        setMatch(data);
        setError(null);
      } else {
        if (!hasInitialMatchRef.current) {
          setMatch(null);
          setError('No details available for this match');
        }
      }
    } catch (err) {
      console.error('Error fetching match details:', err);
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

    hasInitialMatchRef.current = !!initialMatch;

    if (initialMatch) {
      setMatch(initialMatch as MatchDetails);
      setError(null);
      setLoading(false);
    }

    fetchDetails();

    timerRef.current = setInterval(fetchDetails, POLLING_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, fetchDetails]);

  return { match, loading, error };
};
