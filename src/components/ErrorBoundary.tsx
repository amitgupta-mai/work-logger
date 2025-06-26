import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  ErrorBoundaryState
> {
  constructor(props: object) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Optionally log error info
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button
            style={{
              marginTop: 16,
              padding: '8px 16px',
              fontSize: 16,
              borderRadius: 4,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={this.handleReload}
          >
            Reload Extension
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
