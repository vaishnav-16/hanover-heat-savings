import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-16 px-4">
          <div className="max-w-xl mx-auto">
            <Card className="border-destructive/50">
              <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {this.props.fallbackTitle || 'Something went wrong'}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  An error occurred while rendering the results. Please try again or adjust your inputs.
                </p>
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
