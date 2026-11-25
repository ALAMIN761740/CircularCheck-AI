import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendly = 'Something went wrong while loading this section.';
      if (this.state.message.includes('Missing or insufficient permissions')) {
        friendly = 'Access was denied by security rules. Please check your sign-in status or role permissions.';
      }
      return (
        <div className="mx-auto my-12 max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-slate-900">
          <h2 className="text-lg font-semibold text-slate-900">Unable to load view</h2>
          <p className="mt-2 text-sm text-slate-600">{friendly}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-5 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
