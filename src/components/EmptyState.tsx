import { Calendar, AlertTriangle, Search, Users } from 'lucide-react';

type EmptyVariant = 'no-matches' | 'no-data' | 'no-results' | 'no-players' | 'error';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const icons: Record<EmptyVariant, React.ReactNode> = {
  'no-matches': <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted" />,
  'no-data': <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted" />,
  'no-results': <Search className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted" />,
  'no-players': <Users className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted" />,
  'error': <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-danger" />,
};

const defaults: Record<EmptyVariant, { title: string; description: string }> = {
  'no-matches': { title: 'No Matches Found', description: 'There are no matches scheduled for this date.' },
  'no-data': { title: 'No Data Available', description: 'This information is not available right now.' },
  'no-results': { title: 'No Results', description: 'Try adjusting your search or filters.' },
  'no-players': { title: 'No Players Found', description: 'Player information is not available.' },
  'error': { title: 'Something Went Wrong', description: 'We couldn\'t load this data. Please try again.' },
};

export const EmptyState = ({ variant = 'no-data', title, description, action }: EmptyStateProps) => {
  const d = defaults[variant];
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface flex items-center justify-center mb-4 border border-divider">
        {icons[variant]}
      </div>
      <h3 className="text-text-primary font-semibold text-base sm:text-lg mb-1">
        {title || d.title}
      </h3>
      <p className="text-text-secondary text-sm max-w-xs mb-4">
        {description || d.description}
      </p>
      {action}
    </div>
  );
};
