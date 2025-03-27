import React, { Component } from 'react';
import styles from './errorBoundary.module.scss';

/**
 * ErrorBoundary component catches JavaScript errors anywhere in its child component tree
 * It displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Here you could send the error to your analytics or logging service
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    // Reset the error state and retry rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>Something went wrong</h2>
            <p>We apologize for the inconvenience. The application encountered an unexpected error.</p>
            <button
              type="button"
              className={styles.retryButton}
              onClick={this.handleRetry}
            >
              Try Again
            </button>
            
            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details</summary>
                <p>{this.state.error.toString()}</p>
                <p>Component Stack:</p>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;