import { useMemo, useState } from 'react';
import { Radio, RefreshCw, Search, PauseCircle } from 'lucide-react';
import { useLiveMatches } from '../hooks/useLiveMatches';
import { LiveMatchRow } from '../components/LiveMatchRow';
import { EmptyState } from '../components/EmptyState';
import { MatchCardSkeleton } from '../components/Skeleton';
import { cn } from '../lib/utils';
import type { SportMatch } from '../services/sportdb/models';

type Filter = 'live' | 'finished' | 'scheduled' | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'live', label: 'Live' },
  { key: 'scheduled', label: 'Upcoming' },
  { key: 'finished', label: 'Finished' },
  { key: 'all', label: 'All' },
];

const relativeTime = (date: Date | null): string => {
  if (!date) return '';
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
};

export const LiveScoresPage = () => {
  const { matches, loading, error, lastUpdated, stale, autoRefreshPaused, refresh } = useLiveMatches();
  const [filter, setFilter] = useState<Filter>('live');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => ({
    live: matches.filter((m) => m.state === 'live').length,
    scheduled: matches.filter((m) => m.state === 'scheduled').length,
    finished: matches.filter((m) => m.state === 'finished').length,
    all: matches.length,
  }), [matches]);

  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = matches.filter((match) => {
      if (filter !== 'all' && match.state !== filter) return false;
      if (!term) return true;
      return (
        match.home.name.toLowerCase().includes(term) ||
        match.away.name.toLowerCase().includes(term) ||
        (match.competition ?? '').toLowerCase().includes(term)
      );
    });

    const map = new Map<string, SportMatch[]>();
    for (const match of filtered) {
      const key = match.competition ?? 'Other';
      const bucket = map.get(key);
      if (bucket) bucket.push(match);
      else map.set(key, [match]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [matches, filter, query]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Header */}
      <div className="bg-surface rounded-xl border border-border/50 shadow-card p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-live/15 border border-live/30 flex items-center justify-center text-live shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-text-primary">Live Scores</h1>
              <p className="text-xs text-text-muted">
                {counts.live > 0 ? `${counts.live} match${counts.live === 1 ? '' : 'es'} in play` : 'No matches in play'}
                {lastUpdated && ` · updated ${relativeTime(lastUpdated)}`}
                {stale && ' · showing cached data'}
              </p>
            </div>
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-hover border border-border/60 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {autoRefreshPaused && (
          <div className="flex items-center gap-2 text-[11px] text-text-muted bg-background/60 border border-border/40 rounded-lg px-3 py-2">
            <PauseCircle className="w-3.5 h-3.5 shrink-0" />
            Auto-refresh paused while you were away, to preserve the API quota. Hit refresh to resume.
          </div>
        )}

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 bg-background/60 p-1 rounded-xl border border-border/40 overflow-x-auto scrollbar-hide">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                  filter === key
                    ? key === 'live'
                      ? 'bg-live/20 text-live border border-live/40'
                      : 'bg-surface-hover text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {label}
                <span className="text-[10px] px-1.5 rounded-full bg-surface-hover/80 font-score">
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team or competition"
              className="w-full bg-background border border-border/60 rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      {loading && matches.length === 0 && (
        <div className="bg-surface rounded-xl border border-border/50 divide-y divide-border/30 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => <MatchCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && matches.length === 0 && (
        <EmptyState
          variant="error"
          title="Live scores unavailable"
          description={error}
          action={
            <button onClick={refresh} className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors">
              Try again
            </button>
          }
        />
      )}

      {!loading && !error && grouped.length === 0 && (
        <EmptyState
          variant="no-matches"
          title={filter === 'live' ? 'No matches in play' : 'Nothing to show'}
          description={
            filter === 'live'
              ? 'There are no live matches right now. Try the Upcoming or Finished tabs.'
              : 'No matches match your filters.'
          }
        />
      )}

      {grouped.map(([competition, list]) => (
        <section key={competition} className="bg-surface rounded-xl border border-border/50 shadow-card overflow-hidden">
          <header className="px-4 py-2.5 bg-surface-hover/40 border-b border-border/40 flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-text-primary truncate">{competition}</h2>
            <span className="text-[10px] text-text-muted font-medium shrink-0">
              {list.length} {list.length === 1 ? 'match' : 'matches'}
            </span>
          </header>
          <div className="divide-y divide-border/25">
            {list.map((match) => <LiveMatchRow key={match.id} match={match} />)}
          </div>
        </section>
      ))}
    </div>
  );
};
