import { cn } from '../lib/utils';

export type MatchTab = 'details' | 'odds' | 'lineups' | 'events' | 'stats' | 'standings';

const tabs: { key: MatchTab; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'odds', label: 'Odds' },
  { key: 'lineups', label: 'Lineups' },
  { key: 'events', label: 'Events' },
  { key: 'stats', label: 'Stats' },
  { key: 'standings', label: 'Standings' },
];

interface MatchTabsProps {
  activeTab: MatchTab;
  onTabChange: (tab: MatchTab) => void;
}

export const MatchTabs = ({ activeTab, onTabChange }: MatchTabsProps) => {
  return (
    <div className="flex items-center w-full overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "flex-1 min-w-fit px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === tab.key
              ? "text-white border-accent" 
              : "text-text-secondary border-transparent hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
