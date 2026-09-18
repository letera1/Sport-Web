import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, RefreshCw, Users, Whistle } from 'lucide-react';
import { cn } from '../lib/utils';
import { TeamBadge } from './TeamBadge';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { useSportdbMatch, type SportdbMatchTab, type SportdbResource } from '../hooks/useSportdbMatch';
import type {
  SportLineup,
  SportMatch,
  SportMatchInfo,
  SportOdds,
  SportStatPeriod,
  SportTimelineEvent,
} from '../services/sportdb/models';

const TABS: { key: SportdbMatchTab; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'stats', label: 'Stats' },
  { key: 'lineups', label: 'Lineups' },
  { key: 'odds', label: 'Odds' },
];

/** Leading numeric token, used only to size comparison bars. */
const numericOf = (value: string): number | null => {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const GOAL_TYPES = new Set(['goal', 'own goal', 'penalty']);

const isGoal = (event: SportTimelineEvent) =>
  event.type ? GOAL_TYPES.has(event.type.toLowerCase()) : false;

interface SportdbMatchDetailsProps {
  eventId: string;
  /** Passed through navigation so the header can show a score immediately. */
  seed?: SportMatch;
}

export const SportdbMatchDetails = ({ eventId, seed }: SportdbMatchDetailsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SportdbMatchTab>('summary');
  const { info, stats, lineups, odds, refresh } = useSportdbMatch(eventId, activeTab);

  const match = info.data;

  /**
   * The details endpoint carries no score. It comes from the list the visitor
   * navigated from; on a cold deep link the running score on the last goal in
   * the timeline is the provider's own record of the result.
   */
  const score = useMemo(() => {
    if (seed && seed.homeScore !== null && seed.awayScore !== null) {
      return { home: seed.homeScore, away: seed.awayScore };
    }
    const lastGoal = [...(match?.timeline ?? [])].reverse().find(isGoal);
    if (lastGoal && lastGoal.homeScore !== null && lastGoal.awayScore !== null) {
      return { home: lastGoal.homeScore, away: lastGoal.awayScore };
    }
    return null;
  }, [seed, match]);

  const home = match?.home ?? seed?.home ?? null;
  const away = match?.away ?? seed?.away ?? null;
  const isLive = seed?.state === 'live';

  if (info.loading && !home) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-full h-44 rounded-2xl" />
        <Skeleton className="w-full h-56 rounded-xl" />
      </div>
    );
  }

  if (!home || !away) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <BackButton onClick={() => navigate(-1)} label="Back" />
        <EmptyState variant="error" description={info.error ?? 'Match not found'} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 pb-8">
      <div className="flex items-center justify-between gap-3">
        <BackButton onClick={() => navigate(-1)} label={seed?.competition ?? 'Back'} />
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', info.loading && 'animate-spin')} />
          <span className="hidden xs:inline">Refresh</span>
        </button>
      </div>

      {/* Scoreboard */}
      <div className="bg-surface rounded-2xl border border-border/50 shadow-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 p-4 sm:p-6">
          <TeamColumn name={home.name} badgeUrl={home.badgeUrl} />

          <div className="flex flex-col items-center gap-1.5 px-1">
            {score ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={cn('text-3xl sm:text-4xl font-extrabold font-score tabular-nums', isLive ? 'text-live' : 'text-text-primary')}>
                  {score.home}
                </span>
                <span className="text-xl sm:text-2xl text-text-muted font-light">–</span>
                <span className={cn('text-3xl sm:text-4xl font-extrabold font-score tabular-nums', isLive ? 'text-live' : 'text-text-primary')}>
                  {score.away}
                </span>
              </div>
            ) : (
              <span className="text-2xl sm:text-3xl font-bold font-score text-text-muted">vs</span>
            )}
            {isLive ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-live">
                <span className="live-dot" />
                {seed?.statusLabel ? `${seed.statusLabel}'` : 'LIVE'}
              </span>
            ) : (
              seed?.state === 'finished' && (
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Full time</span>
              )
            )}
          </div>

          <TeamColumn name={away.name} badgeUrl={away.badgeUrl} />
        </div>

        {(match?.venue || match?.referee || match?.capacity) && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-2.5 border-t border-border/40 bg-surface-hover/30 text-[11px] text-text-secondary">
            {match.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                {match.venue}
                {match.venueCity && <span className="text-text-muted">· {match.venueCity}</span>}
              </span>
            )}
            {match.capacity && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                {match.capacity}
              </span>
            )}
            {match.referee && (
              <span className="flex items-center gap-1.5">
                <Whistle className="w-3.5 h-3.5 text-accent shrink-0" />
                {match.referee}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-xl border border-border/50 shadow-card overflow-hidden">
        <div className="flex items-center w-full border-b border-border/60 overflow-x-auto scrollbar-hide px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 min-w-fit px-4 py-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap',
                  isActive ? 'text-accent font-bold' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-3 sm:p-4">
          {activeTab === 'summary' && <SummaryTab match={match} loading={info.loading} error={info.error} />}
          {activeTab === 'stats' && <StatsTab resource={stats} />}
          {activeTab === 'lineups' && <LineupsTab resource={lineups} homeName={home.name} awayName={away.name} />}
          {activeTab === 'odds' && <OddsTab resource={odds} />}
        </div>
      </div>
    </div>
  );
};

const BackButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-w-0"
  >
    <ArrowLeft className="w-4 h-4 shrink-0" />
    <span className="text-sm truncate">{label}</span>
  </button>
);

const TeamColumn = ({ name, badgeUrl }: { name: string; badgeUrl: string | null }) => (
  <div className="flex flex-col items-center gap-2 min-w-0">
    <TeamBadge name={name} badgeUrl={badgeUrl} className="w-12 h-12 sm:w-16 sm:h-16 text-base" />
    <span className="text-xs sm:text-sm font-semibold text-text-primary text-center line-clamp-2 leading-tight">
      {name}
    </span>
  </div>
);

const TabState = ({ loading, error, empty, message }: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  message: string;
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 py-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="w-full h-8 rounded-lg" />)}
      </div>
    );
  }
  if (error) return <EmptyState variant="error" description={error} />;
  if (empty) return <EmptyState description={message} />;
  return null;
};

// ── Summary ────────────────────────────────────────────────────────────────

const SummaryTab = ({ match, loading, error }: {
  match: SportMatchInfo | null;
  loading: boolean;
  error: string | null;
}) => {
  const timeline = match?.timeline ?? [];
  const state = <TabState loading={loading} error={error} empty={timeline.length === 0} message="No match incidents recorded." />;
  if (loading || error || timeline.length === 0) return state;

  return (
    <ul className="flex flex-col">
      {timeline.map((event) => (
        <li
          key={event.id}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 border-b border-border/25 last:border-0"
        >
          <div className={cn('min-w-0', event.side === 'home' ? 'text-right' : 'opacity-0 pointer-events-none')}>
            {event.side === 'home' && <IncidentDetail event={event} align="right" />}
          </div>

          <div className="flex flex-col items-center shrink-0 px-1">
            <span className="text-[11px] font-bold font-score text-text-secondary tabular-nums">
              {event.minute ?? ''}
            </span>
            {isGoal(event) && event.homeScore !== null && event.awayScore !== null && (
              <span className="text-[11px] font-bold font-score text-accent tabular-nums">
                {event.homeScore}-{event.awayScore}
              </span>
            )}
          </div>

          <div className={cn('min-w-0', event.side === 'away' ? 'text-left' : 'opacity-0 pointer-events-none')}>
            {event.side === 'away' && <IncidentDetail event={event} align="left" />}
          </div>
        </li>
      ))}
    </ul>
  );
};

const IncidentDetail = ({ event, align }: { event: SportTimelineEvent; align: 'left' | 'right' }) => (
  <div className={cn('flex flex-col gap-0.5 min-w-0', align === 'right' ? 'items-end' : 'items-start')}>
    <span className="text-xs sm:text-sm text-text-primary truncate max-w-full">
      {event.player ?? event.type}
    </span>
    {event.type && event.player && (
      <span className="text-[10px] text-text-muted uppercase tracking-wide truncate max-w-full">
        {event.type}
      </span>
    )}
  </div>
);

// ── Stats ──────────────────────────────────────────────────────────────────

const StatsTab = ({ resource }: { resource: SportdbResource<SportStatPeriod[]> }) => {
  const periods = resource.data ?? [];
  const [period, setPeriod] = useState<string | null>(null);
  const active = periods.find((p) => p.period === period) ?? periods[0];

  const state = <TabState loading={resource.loading} error={resource.error} empty={periods.length === 0} message="No statistics published for this match." />;
  if (resource.loading || resource.error || !active) return state;

  return (
    <div className="flex flex-col gap-4">
      {periods.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {periods.map((p) => (
            <button
              key={p.period}
              onClick={() => setPeriod(p.period)}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-semibold transition-colors',
                p.period === active.period
                  ? 'bg-accent text-black'
                  : 'bg-surface-hover/60 text-text-secondary hover:text-text-primary'
              )}
            >
              {p.period}
            </button>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-3.5">
        {active.stats.map((stat) => {
          const homeValue = numericOf(stat.home);
          const awayValue = numericOf(stat.away);
          const total = (homeValue ?? 0) + (awayValue ?? 0);
          const homeShare = homeValue !== null && awayValue !== null && total > 0
            ? (homeValue / total) * 100
            : null;

          return (
            <li key={stat.id ?? stat.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold font-score text-text-primary tabular-nums shrink-0">{stat.home}</span>
                <span className="text-text-secondary text-center truncate">{stat.label}</span>
                <span className="font-bold font-score text-text-primary tabular-nums shrink-0">{stat.away}</span>
              </div>
              {homeShare !== null && (
                <div className="flex items-center gap-1 h-1.5" aria-hidden>
                  <div className="flex-1 flex justify-end h-full bg-surface-hover/50 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${homeShare}%` }} />
                  </div>
                  <div className="flex-1 flex justify-start h-full bg-surface-hover/50 rounded-full overflow-hidden">
                    <div className="h-full bg-text-secondary/70 rounded-full" style={{ width: `${100 - homeShare}%` }} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ── Lineups ────────────────────────────────────────────────────────────────

const LineupsTab = ({ resource, homeName, awayName }: {
  resource: SportdbResource<SportLineup>;
  homeName: string;
  awayName: string;
}) => {
  const lineup = resource.data;
  const state = <TabState loading={resource.loading} error={resource.error} empty={!lineup} message="Lineups have not been published for this match." />;
  if (resource.loading || resource.error || !lineup) return state;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 text-center">
        <TeamLineupHeader name={homeName} formation={lineup.homeFormation} rating={lineup.homeRating} />
        <TeamLineupHeader name={awayName} formation={lineup.awayFormation} rating={lineup.awayRating} />
      </div>

      {lineup.groups.map((group) => (
        <section key={group.group} className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{group.group}</h3>
          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4">
            <ul className="flex flex-col divide-y divide-border/25">
              {group.home.map((player, i) => (
                <PlayerRow key={player.id ?? `${player.name}-${i}`} player={player} />
              ))}
            </ul>
            <ul className="flex flex-col divide-y divide-border/25">
              {group.away.map((player, i) => (
                <PlayerRow key={player.id ?? `${player.name}-${i}`} player={player} />
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
};

const TeamLineupHeader = ({ name, formation, rating }: {
  name: string;
  formation: string | null;
  rating: string | null;
}) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <span className="text-xs font-bold text-text-primary truncate">{name}</span>
    <div className="flex items-center justify-center gap-2 text-[11px]">
      {formation && <span className="text-text-secondary font-score">{formation}</span>}
      {rating && <RatingChip value={rating} />}
    </div>
  </div>
);

const PlayerRow = ({ player }: { player: SportLineup['groups'][number]['home'][number] }) => (
  <li className="flex items-center gap-2 py-1.5 min-w-0">
    <span className="w-5 shrink-0 text-center text-[11px] font-bold font-score text-text-muted tabular-nums">
      {player.shirtNumber ?? ''}
    </span>
    <span className="flex-1 min-w-0 text-xs text-text-primary truncate" title={player.name}>
      {player.name}
    </span>
    {player.incident && (
      <span className="shrink-0 text-[10px] text-text-muted font-score" title={player.incidentType ?? undefined}>
        {player.incident}
      </span>
    )}
    {player.rating && <RatingChip value={player.rating} />}
  </li>
);

/** Provider ratings are on a 0-10 scale; 7 and 6 are its own quality breaks. */
const RatingChip = ({ value }: { value: string }) => {
  const numeric = Number.parseFloat(value);
  const tone = !Number.isFinite(numeric)
    ? 'bg-surface-hover text-text-secondary'
    : numeric >= 7
      ? 'bg-accent/15 text-accent'
      : numeric >= 6
        ? 'bg-surface-hover text-text-secondary'
        : 'bg-danger/15 text-danger';

  return (
    <span className={cn('shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold font-score tabular-nums', tone)}>
      {value}
    </span>
  );
};

// ── Odds ───────────────────────────────────────────────────────────────────

const OddsTab = ({ resource }: { resource: SportdbResource<SportOdds> }) => {
  const offers = resource.data?.offers ?? [];
  const state = <TabState loading={resource.loading} error={resource.error} empty={offers.length === 0} message="No bookmaker prices available for this match." />;
  if (resource.loading || resource.error || offers.length === 0) return state;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_repeat(3,3.5rem)] sm:grid-cols-[1fr_repeat(3,4.5rem)] gap-2 px-2 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
        <span>Bookmaker</span>
        <span className="text-center">1</span>
        <span className="text-center">X</span>
        <span className="text-center">2</span>
      </div>

      <ul className="flex flex-col divide-y divide-border/25">
        {offers.map((offer) => (
          <li
            key={offer.bookmaker}
            className="grid grid-cols-[1fr_repeat(3,3.5rem)] sm:grid-cols-[1fr_repeat(3,4.5rem)] gap-2 items-center px-2 py-2"
          >
            <span className="text-xs text-text-primary truncate" title={offer.bookmaker}>
              {offer.bookmaker}
            </span>
            {offer.selections.map((selection) => (
              <OddsCell key={selection.label} value={selection.value} opening={selection.opening} active={selection.active} />
            ))}
          </li>
        ))}
      </ul>

      <p className="px-2 pt-1 text-[10px] text-text-muted">
        Full-time match result prices as published by each bookmaker. Arrows show movement from the opening price.
      </p>
    </div>
  );
};

const OddsCell = ({ value, opening, active }: { value: string; opening: string | null; active: boolean }) => {
  const current = Number.parseFloat(value);
  const start = opening === null ? null : Number.parseFloat(opening);
  const drift =
    start === null || !Number.isFinite(current) || !Number.isFinite(start) || current === start
      ? null
      : current > start
        ? 'up'
        : 'down';

  return (
    <span
      className={cn(
        'flex items-center justify-center gap-0.5 py-1 rounded-md text-xs font-bold font-score tabular-nums',
        active ? 'bg-surface-hover/60 text-text-primary' : 'bg-surface-hover/30 text-text-muted line-through'
      )}
      title={opening ? `Opened at ${opening}` : undefined}
    >
      {value}
      {drift && (
        <span className={cn('text-[9px] leading-none', drift === 'up' ? 'text-accent' : 'text-danger')} aria-hidden>
          {drift === 'up' ? '▲' : '▼'}
        </span>
      )}
    </span>
  );
};
