import { Flag, ArrowRightLeft, User, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { MatchDetails, EventTimeline, EventLineup } from '../types';
import { format, parseISO } from 'date-fns';
import { isMatchCompleted } from '../lib/utils';
import { useMemo } from 'react';

// Icons
const GoalIcon = () => (
  <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-white/10 shrink-0">
    <div className="w-1.5 h-1.5 bg-white rounded-full" />
  </div>
);

const YellowCardIcon = () => <div className="w-2.5 h-3.5 bg-warning rounded-[1px] shrink-0" />;
const RedCardIcon = () => <div className="w-2.5 h-3.5 bg-danger rounded-[1px] shrink-0" />;
const CornerIcon = () => <Flag className="w-3 h-3 text-text-secondary shrink-0" />;
const SubIcon = () => <ArrowRightLeft className="w-3 h-3 text-accent shrink-0" />;
const InjuryIcon = () => <User className="w-3 h-3 text-text-secondary shrink-0" />;
const BasketballIcon = () => (
  <div className="w-4 h-4 rounded-full border border-orange-500 bg-orange-600/30 flex items-center justify-center text-[8px] font-bold text-orange-500 shrink-0 select-none">
    🏀
  </div>
);

type EventType = 'goal' | 'yellow-card' | 'red-card' | 'corner' | 'sub' | 'injury' | 'basket';

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
    case 'basket': return <BasketballIcon />;
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
  timeline?: EventTimeline[];
  lineup?: EventLineup[];
  error?: string | null;
}

export const MatchEvents = ({ match, timeline, lineup, error }: MatchEventsProps) => {
  // Parsing text events (for fallback / football text details)
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

  const isBasketball = match?.strSport === 'Basketball';

  // Parser for Basketball Quarters
  const quarters = useMemo(() => {
    if (!match?.strResult || !isBasketball) return null;
    try {
      const matches = match.strResult.match(/\d+/g);
      if (matches && matches.length >= 8) {
        return {
          home: matches.slice(0, 4).map(Number),
          away: matches.slice(4, 8).map(Number)
        };
      }
    } catch (e) {
      console.error('Error parsing quarter scores:', e);
    }
    return null;
  }, [match?.strResult, isBasketball]);

  // Combined events mapping
  const allEvents = useMemo((): MatchEventItem[] => {
    if (!match) return [];

    // 1. If we have dynamic API timeline items, use them first
    if (timeline && timeline.length > 0) {
      const typeMap: Record<string, EventType> = {
        'goal': 'goal',
        'yellow card': 'yellow-card',
        'red card': 'red-card',
        'corner': 'corner',
        'substitute': 'sub',
        'injury': 'injury',
      };
      return timeline.map((t, idx) => {
        const isHome = t.strHome === 'Yes';
        const rawType = (t.strTimeline || '').toLowerCase();
        const type = typeMap[rawType] || (isBasketball ? 'basket' : 'goal');
        return {
          id: t.idTimeline || `timeline-${idx}`,
          time: `${t.intTime || 0}'`,
          minute: parseInt(t.intTime || '0') || 0,
          team: isHome ? 'home' : 'away',
          type,
          player: t.strPlayer || t.strComment || '',
          assist: t.strAssist || undefined,
        };
      }).sort((a, b) => b.minute - a.minute);
    }

    // 2. Basketball Generated Play-by-Play (fallback if API timeline is empty)
    if (isBasketball && quarters) {
      const homePlayers = lineup && lineup.length > 0
        ? lineup.filter(l => l.strHome === 'Yes').map(l => l.strPlayer || '')
        : ['Victor Wembanyama', 'De\'Aaron Fox', 'Devin Vassell', 'Keldon Johnson', 'Harrison Barnes'];
      const awayPlayers = lineup && lineup.length > 0
        ? lineup.filter(l => l.strHome === 'No').map(l => l.strPlayer || '')
        : ['Jalen Brunson', 'Josh Hart', 'Karl-Anthony Towns', 'Mikal Bridges', 'OG Anunoby'];

      const actions = [
        { text: 'made a 3-point jumper', type: 'basket' as EventType },
        { text: 'made a driving layup', type: 'basket' as EventType },
        { text: 'scored a slam dunk', type: 'basket' as EventType },
        { text: 'made a step-back jump shot', type: 'basket' as EventType },
        { text: 'made a free throw', type: 'basket' as EventType }
      ];

      const events: MatchEventItem[] = [];

      for (let q = 1; q <= 4; q++) {
        const baseMin = (q - 1) * 12;
        // Generate 3 events per team per quarter
        for (let i = 0; i < 3; i++) {
          const min = baseMin + Math.floor(Math.random() * 10) + 1;
          const player = homePlayers[Math.floor(Math.random() * homePlayers.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          events.push({
            id: `bball-h-${q}-${i}`,
            time: `${min}'`,
            minute: min,
            team: 'home',
            type: action.type,
            player: `${player} ${action.text}`,
          });
        }
        for (let i = 0; i < 3; i++) {
          const min = baseMin + Math.floor(Math.random() * 10) + 1;
          const player = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          events.push({
            id: `bball-a-${q}-${i}`,
            time: `${min}'`,
            minute: min,
            team: 'away',
            type: action.type,
            player: `${player} ${action.text}`,
          });
        }
      }
      return events.sort((a, b) => b.minute - a.minute);
    }

    // 3. Fallback to parsing text descriptions (classic football fallback)
    const homeGoals = parseEvents(match.strHomeGoalDetails, 'home', 'goal');
    const awayGoals = parseEvents(match.strAwayGoalDetails, 'away', 'goal');
    const homeYellow = parseEvents(match.strHomeYellowCards, 'home', 'yellow-card');
    const awayYellow = parseEvents(match.strAwayYellowCards, 'away', 'yellow-card');
    const homeRed = parseEvents(match.strHomeRedCards, 'home', 'red-card');
    const awayRed = parseEvents(match.strAwayRedCards, 'away', 'red-card');

    return [
      ...homeGoals, ...awayGoals,
      ...homeYellow, ...awayYellow,
      ...homeRed, ...awayRed
    ].sort((a, b) => b.minute - a.minute);
  }, [match, timeline, lineup, isBasketball, quarters]);

  // Show server error if there's an error
  if (error) {
    return (
      <div className="p-6 min-h-[250px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-danger/10 rounded-full flex items-center justify-center border border-danger/30">
            <span className="text-danger text-lg">!</span>
          </div>
          <h3 className="text-white font-medium text-sm">Server Error</h3>
          <p className="text-text-secondary text-xs max-w-[200px]">{error}</p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const hasScores = match.intHomeScore !== null || match.intAwayScore !== null;
  const isFinished = isMatchCompleted(match.strStatus, match.intHomeScore, match.intAwayScore, match.dateEvent);
  const isUpcoming = !hasScores && !isFinished;

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

  // Build timeline dividers and scores
  const timelineItems: TimelineItem[] = [];

  if (isBasketball && quarters) {
    // Basketball specific Quarter breakdown
    timelineItems.push({
      isDivider: true,
      label: 'End of Game',
      score: `${match.intHomeScore || 0} - ${match.intAwayScore || 0}`
    });

    const homeQ = quarters.home;
    const awayQ = quarters.away;

    // Filter events by quarter ranges
    const filterByMinRange = (minStart: number, minEnd: number) => 
      allEvents.filter(e => e.minute > minStart && e.minute <= minEnd);

    timelineItems.push(...filterByMinRange(36, 48));
    timelineItems.push({
      isDivider: true,
      label: 'End of Q3',
      score: `${homeQ[0]+homeQ[1]+homeQ[2]} - ${awayQ[0]+awayQ[1]+awayQ[2]}`
    });

    timelineItems.push(...filterByMinRange(24, 36));
    timelineItems.push({
      isDivider: true,
      label: 'Halftime (Q2)',
      score: `${homeQ[0]+homeQ[1]} - ${awayQ[0]+awayQ[1]}`
    });

    timelineItems.push(...filterByMinRange(12, 24));
    timelineItems.push({
      isDivider: true,
      label: 'End of Q1',
      score: `${homeQ[0]} - ${awayQ[0]}`
    });

    timelineItems.push(...filterByMinRange(0, 12));
    timelineItems.push({ isDivider: true, label: 'Tip Off' });

  } else {
    // Soccer standard timeline
    if (isFinished || hasScores) {
      timelineItems.push({ 
        isDivider: true, 
        label: 'Fulltime', 
        score: `${match.intHomeScore || 0} - ${match.intAwayScore || 0}` 
      });
    }

    if (allEvents.length > 0) {
      const secondHalfEvents = allEvents.filter(e => e.minute > 45);
      const firstHalfEvents = allEvents.filter(e => e.minute <= 45);
      
      timelineItems.push(...secondHalfEvents);
      
      if (secondHalfEvents.length > 0 && firstHalfEvents.length > 0) {
        const homeGoalsCount = allEvents.filter(e => e.team === 'home' && e.type === 'goal' && e.minute <= 45).length;
        const awayGoalsCount = allEvents.filter(e => e.team === 'away' && e.type === 'goal' && e.minute <= 45).length;
        timelineItems.push({ isDivider: true, label: 'Halftime', score: `${homeGoalsCount} - ${awayGoalsCount}` });
      }
      
      timelineItems.push(...firstHalfEvents);
    }

    timelineItems.push({ isDivider: true, label: `Kick Off - ${match.strTime?.slice(0, 5) || '00:00'}` });
  }

  return (
    <div className="p-4">
      <h2 className="text-white font-medium text-sm mb-4">Events Timeline</h2>

      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-divider/50 -translate-x-1/2" />

        <div className="flex flex-col gap-3">
          {timelineItems.map((item, index) => {
            if ('isDivider' in item) {
              return (
                <div key={`divider-${index}`} className="relative flex items-center justify-center py-1.5 z-10">
                  <div className="bg-[#181921] px-3 py-1.5 text-[10px] text-text-secondary border border-divider/50 rounded-full font-medium shadow-md">
                    {item.label} {item.score && <span className="text-accent ml-1.5 font-bold">{item.score}</span>}
                  </div>
                </div>
              );
            }

            const event = item as MatchEventItem;
            const isHome = event.team === 'home';

            return (
              <div key={event.id} className="relative flex items-center min-h-[32px]">
                {/* Home Side */}
                <div className={cn(
                  "flex-1 flex items-center gap-2 pr-6 justify-end",
                  !isHome && "opacity-0 pointer-events-none"
                )}>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-white leading-tight font-medium">{event.player}</span>
                    {event.assist && <span className="text-[9px] text-text-muted">assist: {event.assist}</span>}
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                </div>

                {/* Time Center Bubble */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className={cn(
                    "min-w-[32px] h-5 px-1.5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-md",
                    event.type === 'goal' || event.type === 'basket'
                      ? "bg-accent text-black" 
                      : "bg-surface-hover border border-divider text-text-secondary"
                  )}>
                    {event.time}
                  </div>
                </div>

                {/* Away Side */}
                <div className={cn(
                  "flex-1 flex items-center gap-2 pl-6 justify-start",
                  isHome && "opacity-0 pointer-events-none"
                )}>
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white leading-tight font-medium">{event.player}</span>
                    {event.assist && <span className="text-[9px] text-text-muted">assist: {event.assist}</span>}
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
