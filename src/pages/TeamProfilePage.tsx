import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTeamDetails } from '../hooks/useTeamDetails';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { cn, isMatchCompleted } from '../lib/utils';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeft, MapPin, Calendar, Users, Globe, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';

export const TeamProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { team, nextMatches, lastMatches, players, loading, error } = useTeamDetails(id);

  const groupedPlayers = useMemo(() => {
    const groups: Record<string, typeof players> = {
      Goalkeepers: [],
      Defenders: [],
      Midfielders: [],
      Forwards: [],
      'Staff / Others': []
    };

    players.forEach(p => {
      const pos = (p.strPosition || '').toLowerCase();
      if (pos.includes('goalkeeper')) {
        groups.Goalkeepers.push(p);
      } else if (pos.includes('back') || pos.includes('defender')) {
        groups.Defenders.push(p);
      } else if (pos.includes('midfield') || pos.includes('midfielder')) {
        groups.Midfielders.push(p);
      } else if (pos.includes('forward') || pos.includes('winger') || pos.includes('striker')) {
        groups.Forwards.push(p);
      } else {
        groups['Staff / Others'].push(p);
      }
    });

    return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0));
  }, [players]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-full h-48 rounded-xl" />
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
        <EmptyState variant="error" description={error || 'Team not found'} />
      </div>
    );
  }

  const bannerUrl = team.strTeamBanner || team.strTeamFanart1;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">{team.strLeague || 'Back'}</span>
      </button>

      {/* Hero Banner */}
      <div className="relative bg-surface rounded-2xl overflow-hidden border border-divider/30">
        {bannerUrl && (
          <div className="absolute inset-0">
            <img src={bannerUrl} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
          </div>
        )}
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <img
            src={team.strTeamBadge ? `${getProxiedImageUrl(team.strTeamBadge)}/small` : FALLBACK_BADGE}
            alt={team.strTeam}
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
            onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
          />
          <div className="flex flex-col items-center sm:items-start gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-display">{team.strTeam}</h1>
            {team.strTeamAlternate && <p className="text-text-secondary text-sm">{team.strTeamAlternate}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
              {team.strStadium && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{team.strStadium}</span>
              )}
              {team.intFormedYear && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Est. {team.intFormedYear}</span>
              )}
              {team.strCountry && (
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{team.strCountry}</span>
              )}
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-2 mt-3">
              {[
                { url: team.strWebsite, label: 'Web' },
                { url: team.strTwitter, label: '𝕏' },
                { url: team.strInstagram, label: 'IG' },
                { url: team.strYoutube, label: 'YT' },
              ].filter(s => s.url).map(s => (
                <a
                  key={s.label}
                  href={s.url!.startsWith('http') ? s.url : `https://${s.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-surface-hover rounded-full text-[10px] font-medium text-text-secondary hover:text-accent transition-colors flex items-center gap-1"
                >
                  {s.label} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Stadium', value: team.strStadium || 'N/A', sub: team.intStadiumCapacity ? `Capacity: ${parseInt(team.intStadiumCapacity).toLocaleString()}` : undefined },
          { label: 'Manager', value: team.strManager || 'N/A' },
          { label: 'League', value: team.strLeague || 'N/A' },
          { label: 'Country', value: team.strCountry || 'N/A' },
        ].map(card => (
          <div key={card.label} className="bg-surface rounded-xl p-3 sm:p-4 border border-divider/30">
            <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wide mb-1">{card.label}</p>
            <p className="text-text-primary font-medium text-sm truncate">{card.value}</p>
            {card.sub && <p className="text-text-muted text-[10px] mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Recent Results */}
      {lastMatches.length > 0 && (
        <div className="bg-surface rounded-xl overflow-hidden border border-divider/30">
          <div className="px-4 py-3 border-b border-divider/30">
            <h2 className="text-text-primary font-semibold text-sm">Recent Results</h2>
          </div>
          <div className="divide-y divide-divider/20">
            {lastMatches.slice(0, 5).map(match => {
              const isHome = match.strHomeTeam === team.strTeam;
              const homeScore = parseInt(match.intHomeScore || '0');
              const awayScore = parseInt(match.intAwayScore || '0');
              const isWin = isHome ? homeScore > awayScore : awayScore > homeScore;
              const isDraw = homeScore === awayScore;
              const resultColor = isWin ? 'bg-accent text-black' : isDraw ? 'bg-text-muted/30 text-text-secondary' : 'bg-danger text-white';
              const resultText = isWin ? 'W' : isDraw ? 'D' : 'L';
              const opponent = isHome ? match.strAwayTeam : match.strHomeTeam;

              return (
                <div
                  key={match.idEvent}
                  onClick={() => navigate(`/match/${match.idEvent}`, { state: { match } })}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', resultColor)}>
                    {resultText}
                  </span>
                  <span className="text-text-primary text-sm flex-1 truncate">
                    {isHome ? 'vs' : '@'} {opponent}
                  </span>
                  <span className="text-text-primary font-bold text-sm">{homeScore} - {awayScore}</span>
                  <span className="text-text-muted text-[10px]">
                    {match.dateEvent ? format(parseISO(match.dateEvent), 'd MMM') : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Fixtures */}
      {nextMatches.length > 0 && (
        <div className="bg-surface rounded-xl overflow-hidden border border-divider/30">
          <div className="px-4 py-3 border-b border-divider/30">
            <h2 className="text-text-primary font-semibold text-sm">Upcoming Fixtures</h2>
          </div>
          <div className="divide-y divide-divider/20">
            {nextMatches.slice(0, 5).map(match => {
              const isHome = match.strHomeTeam === team.strTeam;
              const opponent = isHome ? match.strAwayTeam : match.strHomeTeam;
              return (
                <div
                  key={match.idEvent}
                  onClick={() => navigate(`/match/${match.idEvent}`, { state: { match } })}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center text-[10px] font-medium text-text-muted shrink-0">
                    {isHome ? 'H' : 'A'}
                  </span>
                  <span className="text-text-primary text-sm flex-1 truncate">
                    {isHome ? 'vs' : '@'} {opponent}
                  </span>
                  <span className="text-text-secondary text-xs">
                    {match.dateEvent ? format(parseISO(match.dateEvent), 'd MMM') : ''} {match.strTime?.slice(0, 5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Squad */}
      {Object.keys(groupedPlayers).length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-text-primary font-semibold text-base px-1">Squad</h2>
          <div className="flex flex-col gap-6">
            {Object.entries(groupedPlayers).map(([groupName, groupPlayers]) => (
              <div key={groupName} className="flex flex-col gap-3">
                <h3 className="text-text-secondary font-medium text-xs uppercase tracking-wider px-1">
                  {groupName} ({groupPlayers.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupPlayers.map((player) => (
                    <Link
                      to={`/player/${player.idPlayer}`}
                      key={player.idPlayer}
                      className="bg-surface border border-divider/30 hover:border-accent/40 rounded-xl p-3 flex items-center gap-3 hover:bg-surface-hover transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-hover border border-divider/30 flex items-center justify-center shrink-0">
                        <img
                          src={player.strCutout || player.strThumb ? getProxiedImageUrl(player.strCutout || player.strThumb) : FALLBACK_BADGE}
                          alt={player.strPlayer}
                          className="w-full h-full object-cover"
                          onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary text-sm font-semibold truncate group-hover:text-accent transition-colors">
                          {player.strPlayer}
                        </p>
                        <p className="text-text-muted text-xs truncate">{player.strPosition}</p>
                      </div>
                      {player.strNumber && (
                        <span className="text-text-secondary text-sm font-bold opacity-60">
                          #{player.strNumber}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {team.strDescriptionEN && (
        <div className="bg-surface rounded-xl p-4 sm:p-6 border border-divider/30">
          <h2 className="text-text-primary font-semibold text-sm mb-3">About</h2>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-[12]">
            {team.strDescriptionEN}
          </p>
        </div>
      )}
    </div>
  );
};
