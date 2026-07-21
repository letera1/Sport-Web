import { cn } from '../lib/utils';

export type MatchTab = 'details' | 'odds' | 'lineups' | 'events' | 'stats' | 'standings';

const tabs: { key: MatchTab; label: string }[] = [
  { key: 'events', label: 'Events' },
  { key: 'lineups', label: 'Lineups' },
  { key: 'stats', label: 'Stats' },
  { key: 'details', label: 'Details' },
  { key: 'odds', label: 'Odds' },
  { key: 'standings', label: 'Standings' },
];

interface MatchTabsProps {
  activeTab: MatchTab;
  onTabChange: (tab: MatchTab) => void;
}

export const MatchTabs = ({ activeTab, onTabChange }: MatchTabsProps) => {
  return (
    <div className="flex items-center w-full border-b border-border/60 bg-surface/90 overflow-x-auto scrollbar-hide px-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex-1 min-w-fit px-4 py-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap",
              isActive
                ? "text-accent font-bold" 
                : "text-text-secondary hover:text-white"
            )}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full animate-tab-slide" />
            )}
          </button>
        );
      })}
    </div>
  );
};
