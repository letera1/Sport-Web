import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught Error in Application:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mb-4 text-danger">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Something Went Wrong</h1>
          <p className="text-text-secondary text-sm max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'An unexpected application error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-[#00FFA5] text-black font-semibold rounded-lg hover:bg-[#00FFA5]/90 transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
