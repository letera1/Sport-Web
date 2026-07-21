import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerDetails } from '../hooks/usePlayerDetails';
import { FALLBACK_BADGE, getProxiedImageUrl } from '../services/sportsApi';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeft, Trophy, Briefcase, MapPin, Calendar, Ruler, Weight, Flag } from 'lucide-react';

export const PlayerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { player, stats, honours, formerTeams, milestones, contracts, loading, error } = usePlayerDetails(id);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-full h-48 rounded-xl" />
        <Skeleton className="w-full h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors self-start">
          <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
        </button>
        <EmptyState variant="error" description={error || 'Player not found'} />
      </div>
    );
  }

  const playerImage = player.strCutout || player.strThumb || player.strRender;
  const age = player.dateBorn
    ? Math.floor((Date.now() - new Date(player.dateBorn).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">{player.strTeam || 'Back'}</span>
      </button>

      {/* Hero */}
      <div className="relative bg-gradient-primary rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          {playerImage ? (
            <img
              src={playerImage}
              alt={player.strPlayer}
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          ) : (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/50">{player.strPlayer[0]}</span>
            </div>
          )}
          <div className="flex flex-col items-center sm:items-start gap-1 text-white">
            {player.strNumber && (
              <span className="text-5xl sm:text-6xl font-bold font-display opacity-30">#{player.strNumber}</span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold font-display">{player.strPlayer}</h1>
            <div className="flex items-center gap-2 mt-1">
              {player.strPosition && (
                <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">{player.strPosition}</span>
              )}
              {player.strNationality && (
                <span className="flex items-center gap-1 text-sm opacity-80"><Flag className="w-3 h-3" />{player.strNationality}</span>
              )}
            </div>
            {player.strTeam && (
              <p className="text-sm opacity-70 mt-1">{player.strTeam}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bio Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: 'Age', value: age ? `${age} years` : 'N/A', sub: player.dateBorn },
          { icon: Ruler, label: 'Height', value: player.strHeight || 'N/A' },
          { icon: Weight, label: 'Weight', value: player.strWeight || 'N/A' },
          { icon: MapPin, label: 'Birth Place', value: player.strBirthLocation || 'N/A' },
        ].map(card => (
          <div key={card.label} className="bg-surface rounded-xl p-3 sm:p-4 border border-divider/30">
            <div className="flex items-center gap-1.5 mb-1">
              <card.icon className="w-3 h-3 text-accent" />
              <p className="text-[10px] text-text-muted uppercase tracking-wide">{card.label}</p>
            </div>
            <p className="text-text-primary font-medium text-sm">{card.value}</p>
            {card.sub && <p className="text-text-muted text-[10px] mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Season Stats */}
      {stats.length > 0 && (
        <div className="bg-surface rounded-xl overflow-hidden border border-divider/30">
          <div className="px-4 py-3 border-b border-divider/30">
            <h2 className="text-text-primary font-semibold text-sm">Career Statistics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-divider/30 text-text-muted">
                  <th className="text-left px-4 py-2 font-medium">Season</th>
                  <th className="text-left px-4 py-2 font-medium">Team</th>
                  <th className="text-center px-2 py-2 font-medium">Apps</th>
                  <th className="text-center px-2 py-2 font-medium">Goals</th>
                  <th className="text-center px-2 py-2 font-medium">Assists</th>
                  <th className="text-center px-2 py-2 font-medium">YC</th>
                  <th className="text-center px-2 py-2 font-medium">RC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/20">
                {stats.map((s, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-2 text-text-secondary">{s.strSeason || '-'}</td>
                    <td className="px-4 py-2 text-text-primary font-medium">{s.strTeam || '-'}</td>
                    <td className="text-center px-2 py-2 text-text-secondary">{s.intAppearances || '-'}</td>
                    <td className="text-center px-2 py-2 text-accent font-medium">{s.intGoals || '-'}</td>
                    <td className="text-center px-2 py-2 text-text-secondary">{s.intAssists || '-'}</td>
                    <td className="text-center px-2 py-2 text-warning">{s.intYellowCards || '-'}</td>
                    <td className="text-center px-2 py-2 text-danger">{s.intRedCards || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Honours */}
      {honours.length > 0 && (
        <div className="bg-surface rounded-xl p-4 sm:p-6 border border-divider/30">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-accent" />
            <h2 className="text-text-primary font-semibold text-sm">Honours & Trophies</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {honours.map((h, idx) => (
              <div key={idx} className="px-3 py-2 bg-surface-hover rounded-lg border border-divider/30">
                <p className="text-text-primary text-xs font-medium">{h.strHonour}</p>
                <p className="text-text-muted text-[10px]">{h.strSeason} • {h.strTeam}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career History */}
      {formerTeams.length > 0 && (
        <div className="bg-surface rounded-xl p-4 sm:p-6 border border-divider/30">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-accent" />
            <h2 className="text-text-primary font-semibold text-sm">Career History</h2>
          </div>
          <div className="space-y-3">
            {formerTeams.map((ft, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {ft.strTeamBadge ? (
                  <img src={`${getProxiedImageUrl(ft.strTeamBadge)}/tiny`} alt="" className="w-6 h-6 object-contain shrink-0" onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }} />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-hover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{ft.strFormerTeam}</p>
                  <p className="text-text-muted text-[10px]">
                    {ft.strJoined || '?'} – {ft.strDeparted || 'Present'}
                    {ft.strMoveType && ` • ${ft.strMoveType}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {player.strDescriptionEN && (
        <div className="bg-surface rounded-xl p-4 sm:p-6 border border-divider/30">
          <h2 className="text-text-primary font-semibold text-sm mb-3">Biography</h2>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-[15]">
            {player.strDescriptionEN}
          </p>
        </div>
      )}
    </div>
  );
};
