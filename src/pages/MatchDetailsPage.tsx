import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MatchHeader } from '../components/MatchHeader';
import { MatchTabs, MatchTab } from '../components/MatchTabs';
import { MatchEvents } from '../components/MatchEvents';
import { MatchLineups } from '../components/MatchLineups';
import { MatchStats } from '../components/MatchStats';
import { MatchDetailsTab } from '../components/MatchDetails';
import { useMatchDetails } from '../hooks/useMatchDetails';
import { MatchDetails } from '../types';
import { ArrowLeft } from 'lucide-react';

export const MatchDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMatch = (location.state as { match?: Partial<MatchDetails> } | null)?.match;
  const { match, loading, error } = useMatchDetails(id, initialMatch);
  const [activeTab, setActiveTab] = useState<MatchTab>('events');

  if (!loading && !match && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-text-secondary">
        <p>No details available for this match.</p>
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-text-secondary">
        <p className="text-danger mb-2">{error}</p>
        <div className="flex gap-3 mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-surface rounded-lg hover:bg-white/5 transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-accent text-black rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <MatchDetailsTab match={match} error={error} />;
      case 'lineups':
        return <MatchLineups match={match} error={error} />;
      case 'events':
        return <MatchEvents match={match} error={error} />;
      case 'stats':
        return <MatchStats match={match} error={error} />;
      case 'odds':
      case 'standings':
        return (
          <div className="p-6 min-h-[200px] flex items-center justify-center text-text-secondary text-sm">
            Coming soon
          </div>
        );
      default:
        return <MatchEvents match={match} error={error} />;
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 pb-8">
      {/* Back Header with League Name */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{match?.strLeague || 'English Premier League'}</span>
      </button>

      {/* Match Header */}
      <MatchHeader match={match} loading={loading} />
      
      {/* Tabs */}
      <div className="bg-surface rounded-xl overflow-hidden">
        <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="bg-surface rounded-xl overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};
