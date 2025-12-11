import { Flag, ArrowRightLeft, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { MatchDetails } from '../types';
import { format, parseISO } from 'date-fns';
import { isMatchCompleted } from '../lib/utils';

// Icons
const GoalIcon = () => (
  <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
    <div className="w-1.5 h-1.5 bg-white rounded-full" />
  </div>
);

const YellowCardIcon = () => <div className="w-2.5 h-3.5 bg-warning rounded-[1px]" />;
const RedCardIcon = () => <div className="w-2.5 h-3.5 bg-danger rounded-[1px]" />;
const CornerIcon = () => <Flag className="w-3 h-3 text-text-secondary" />;
const SubIcon = () => <ArrowRightLeft className="w-3 h-3 text-accent" />;
const InjuryIcon = () => <User className="w-3 h-3 text-text-secondary" />;

type EventType = 'goal' | 'yellow-card' | 'red-card' | 'corner' | 'sub' | 'injury';

interface MatchEventItem {
  id: string;
  time: string;
  minute: number;
  team: 'home' | 'away';
  type: EventType;
  player: string;
  assist?: string;
}

interface Divider {
  isDivider: true;
  label: string;
  score?: string;
}

type TimelineItem = MatchEventItem | Divider;

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'goal': return <GoalIcon />;
    case 'yellow-card': return <YellowCardIcon />;
    case 'red-card': return <RedCardIcon />;
    case 'corner': return <CornerIcon />;
    case 'sub': return <SubIcon />;
    case 'injury': return <InjuryIcon />;
    default: return null;
  }
};

interface MatchEventsProps {
  match?: MatchDetails | null;
  error?: string | null;
}

export const MatchEvents = ({ match, error }: MatchEventsProps) => {
  // Show server error if there's an error
  if (error) {
    return (
      <div className="p-6 min-h-[250px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-danger/10 rounded-full flex items-center justify-center border border-danger/30">
            <span className="text-danger text-lg">!</span>
          </div>
          <h3 className="text-white font-medium text-sm">Server Error</h3>
          <p className="text-text-secondary text-xs max-w-[200px]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const parseEvents = (str: string | undefined, team: 'home' | 'away', type: EventType): MatchEventItem[] => {
    if (!str) return [];
    return str.split(';').filter(s => s.trim()).map((s, idx) => {
      const parts = s.split(':');
      const timeStr = parts[0]?.trim() || '';
      const player = parts[1]?.trim() || '';
      const minute = parseInt(timeStr.replace(/\D/g, '')) || 0;
      
      return {
        id: `${type}-${team}-${minute}-${idx}`,
        time: timeStr.includes("'") ? timeStr : `${minute}'`,
        minute,
        team,
        type,
        player,
      };
    });
  };

  const homeGoals = parseEvents(match.strHomeGoalDetails, 'home', 'goal');
  const awayGoals = parseEvents(match.strAwayGoalDetails, 'away', 'goal');
  const homeYellow = parseEvents(match.strHomeYellowCards, 'home', 'yellow-card');
  const awayYellow = parseEvents(match.strAwayYellowCards, 'away', 'yellow-card');
  const homeRed = parseEvents(match.strHomeRedCards, 'home', 'red-card');
  const awayRed = parseEvents(match.strAwayRedCards, 'away', 'red-card');

  const allEvents = [
    ...homeGoals, ...awayGoals,
    ...homeYellow, ...awayYellow,
    ...homeRed, ...awayRed
  ].sort((a, b) => b.minute - a.minute);

  const hasScores = match.intHomeScore !== null || match.intAwayScore !== null;
  const isFinished = isMatchCompleted(match.strStatus, match.intHomeScore, match.intAwayScore, match.dateEvent);
  const isUpcoming = !hasScores && !isFinished;

  // Show "Match Not Started" for upcoming matches
  if (isUpcoming) {
    return (
      <div className="p-6 min-h-[250px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-divider">
            <Flag className="w-5 h-5 text-text-secondary" />
          </div>
          <h3 className="text-white font-medium text-sm">Match Not Started</h3>
          <p className="text-text-secondary text-xs">
            {format(parseISO(match.dateEvent), 'EEE, d MMM')} at {match.strTime?.slice(0, 5)}
          </p>
        </div>
      </div>
    );
  }

  // Build timeline
  const timeline: TimelineItem[] = [];
  
  // Add Fulltime divider if match is finished or has scores
  if (isFinished || hasScores) {
    timeline.push({ 
      isDivider: true, 
      label: 'Fulltime', 
      score: `${match.intHomeScore || 0} - ${match.intAwayScore || 0}` 
    });
  }

  // Add all events sorted by minute (descending)
  if (allEvents.length > 0) {
    // Find where to insert halftime divider
    const secondHalfEvents = allEvents.filter(e => e.minute > 45);
    const firstHalfEvents = allEvents.filter(e => e.minute <= 45);
    
    timeline.push(...secondHalfEvents);
    
    if (secondHalfEvents.length > 0 && firstHalfEvents.length > 0) {
      timeline.push({ isDivider: true, label: 'Halftime', score: '1 - 0' });
    }
    
    timeline.push(...firstHalfEvents);
  }

  // Add Kickoff
  timeline.push({ isDivider: true, label: `Kick Off -${match.strTime?.slice(0, 5) || '00:00'}` });

  // If no events but match has finished, show no events message
  if (allEvents.length === 0) {
    return (
      <div className="p-6 min-h-[250px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-divider">
            <Flag className="w-5 h-5 text-text-secondary" />
          </div>
          <h3 className="text-white font-medium text-sm">No Events Available</h3>
          <p className="text-text-secondary text-xs max-w-[200px]">
            Event details are not available for this match.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-white font-medium text-sm mb-4">Events</h2>

      <div className="relative">
        {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-divider/50 -translate-x-1/2" />

        <div className="flex flex-col gap-3">
          {timeline.map((item, index) => {
            if ('isDivider' in item) {
              return (
                <div key={`divider-${index}`} className="relative flex items-center justify-center py-1.5 z-10">
                  <div className="bg-surface px-3 py-1 text-[10px] text-text-secondary border border-divider/50 rounded-full">
                    {item.label} {item.score && <span className="text-white ml-1">{item.score}</span>}
                  </div>
                </div>
              );
            }

            const event = item as MatchEventItem;
            const isHome = event.team === 'home';
            const isGoal = event.type === 'goal';

            return (
              <div key={event.id} className="relative flex items-center min-h-[32px]">
                {/* Home Side */}
                <div className={cn(
                  "flex-1 flex items-center gap-1.5 pr-6 justify-end",
                  !isHome && "opacity-0 pointer-events-none"
                )}>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-white leading-tight">{event.player}</span>
                    {event.assist && <span className="text-[10px] text-text-muted">{event.assist}</span>}
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                </div>

                {/* Time Bubble - Center */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className={cn(
                    "min-w-[36px] h-5 px-2 rounded-full flex items-center justify-center text-[10px] font-semibold",
                    isGoal 
                      ? "bg-accent text-black" 
                      : "bg-[#2a2b3d] text-white"
                  )}>
                    {event.time}
                  </div>
                </div>

                {/* Away Side */}
                <div className={cn(
                  "flex-1 flex items-center gap-1.5 pl-6 justify-start",
                  isHome && "opacity-0 pointer-events-none"
                )}>
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white leading-tight">{event.player}</span>
                    {event.assist && <span className="text-[10px] text-text-muted">{event.assist}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
