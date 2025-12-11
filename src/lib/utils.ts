import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMatchLive(status: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  
  // Known NOT live statuses
  const notLive = [
    'ns', 'not started',
    'ft', 'match finished', 'finished',
    'ppd', 'postponed', 'match postponed',
    'tbd',
    'abd', 'abandoned', 'match abandoned',
    'canc', 'cancelled', 'match cancelled',
    'int', 'interrupted',
    'pst'
  ];
  
  if (notLive.includes(s)) return false;
  
  // Check for substrings to be safe
  if (s.includes('postponed')) return false;
  if (s.includes('finished')) return false;
  if (s.includes('cancelled')) return false;
  if (s.includes('abandoned')) return false;
  
  // Check if it looks like a time (e.g. "15:00") -> Not Started
  // Also sometimes "2025-12-11"
  if (/^\d{1,2}:\d{2}$/.test(s)) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;

  // If it's not one of the above, assume it's live (1H, 2H, HT, ET, Pen, 45', etc.)
  return true;
}

export function isMatchFinished(status: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'ft' || s === 'match finished' || s === 'finished' || s === 'aet' || s === 'pen';
}

/**
 * Determines if a match is finished based on status, scores, and date.
 * More reliable than just checking status string.
 */
export function isMatchCompleted(
  status: string | undefined,
  homeScore: string | null | undefined,
  awayScore: string | null | undefined,
  matchDate: string | undefined
): boolean {
  // If status explicitly says finished
  if (status && isMatchFinished(status)) return true;
  
  // If match has scores and date is in the past, it's completed
  const hasScores = homeScore !== null && homeScore !== undefined && homeScore !== '' &&
                    awayScore !== null && awayScore !== undefined && awayScore !== '';
  
  if (hasScores && matchDate) {
    const matchDateTime = new Date(matchDate);
    const now = new Date();
    // If match date is more than 3 hours ago and has scores, consider it finished
    if (matchDateTime.getTime() < now.getTime() - 3 * 60 * 60 * 1000) {
      return true;
    }
  }
  
  return false;
}
