import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Users } from 'lucide-react';
import { useSportdbTeam, type SportdbSquadPlayer } from '../hooks/useSportdbTeam';
import { TeamBadge } from '../components/TeamBadge';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

const POSITION_ORDER = ['Goalkeepers', 'Defenders', 'Midfielders', 'Forwards'];

interface SportdbTeamProfileProps {
  slug: string;
  teamId: string;
}

/** Team profile backed by SportDB, which supplies crest, venue and full squad. */
export const SportdbTeamProfile = ({ slug, teamId }: SportdbTeamProfileProps) => {
  const navigate = useNavigate();
  const { team, loading, error } = useSportdbTeam(slug, teamId);

  const groupedSquad = useMemo(() => {
    if (!team) return [];
    const groups = new Map<string, SportdbSquadPlayer[]>();
    for (const player of team.squad) {
      const bucket = groups.get(player.position);
      if (bucket) bucket.push(player);
      else groups.set(player.position, [player]);
    }

    const rank = (position: string) => {
      const index = POSITION_ORDER.indexOf(position);
      return index === -1 ? POSITION_ORDER.length : index;
    };

    return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [team]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-full h-40 rounded-2xl" />
        <Skeleton className="w-full h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors self-start">
          <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
        </button>
        <EmptyState variant="error" description={error ?? 'Team not found'} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>

      {/* Hero */}
      <div className="bg-surface rounded-2xl border border-border/50 shadow-card p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-hover/40 border border-border/40 flex items-center justify-center p-3 shrink-0">
            <TeamBadge name={team.name} badgeUrl={team.logo} className="w-full h-full text-lg" />
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary text-center sm:text-left">
              {team.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-text-secondary">
              {team.countryName && (
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-accent" />{team.countryName}</span>
              )}
              {team.stadiumName && (
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" />{team.stadiumName}</span>
              )}
              {team.stadiumCapacity !== null && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  {team.stadiumCapacity.toLocaleString()} capacity
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Squad */}
      {groupedSquad.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Squad <span className="text-text-muted font-medium normal-case">({team.squad.length} players)</span>
          </h2>
          {groupedSquad.map(([position, players]) => (
            <section key={position} className="bg-surface rounded-xl border border-border/50 shadow-card overflow-hidden">
              <header className="px-4 py-2.5 bg-surface-hover/40 border-b border-border/40 flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-primary">{position}</h3>
                <span className="text-[10px] text-text-muted">{players.length}</span>
              </header>
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0 divide-border/25">
                {players.map((player) => (
                  <li
                    key={player.id ?? player.name}
                    className="flex items-center gap-3 px-4 py-2.5 sm:border-b sm:border-border/25 hover:bg-surface-hover/50 transition-colors"
                  >
                    <span className="w-7 shrink-0 text-center text-xs font-bold font-score text-accent">
                      {player.jerseyNumber ?? '–'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary truncate">{player.name}</p>
                      {player.countryName && (
                        <p className="text-[11px] text-text-muted truncate">{player.countryName}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState variant="no-players" description="Squad information is not available for this team." />
      )}
    </div>
  );
};
