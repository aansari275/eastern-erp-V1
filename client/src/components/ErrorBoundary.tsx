import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Here you could log the error to an error reporting service
    // Example: Sentry.captureException(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const subject = encodeURIComponent('Error Report - Eastern Mills ERP');
    const body = encodeURIComponent(`
Error Details:
${this.state.error?.message || 'Unknown error'}

Stack Trace:
${this.state.error?.stack || 'No stack trace available'}

Component Stack:
${this.state.errorInfo?.componentStack || 'No component stack available'}

User Agent:
${navigator.userAgent}

Timestamp:
${new Date().toISOString()}
    `);
    
    window.open(`mailto:support@easternmills.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details (collapsed by default) */}
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  View technical details
                </summary>
                <div className="mt-4 space-y-3 text-xs text-gray-600">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 bg-white p-2 rounded border overflow-x-auto">
                      {this.state.error?.message || 'Unknown error'}
                    </pre>
                  </div>
                  {this.state.error?.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 bg-white p-2 rounded border overflow-x-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 bg-white p-2 rounded border overflow-x-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
                
                <Button variant="outline" onClick={this.handleReportBug} className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500 space-y-2">
                <p>
                  If this problem persists, please contact our support team at{' '}
                  <a href="mailto:support@easternmills.com" className="text-blue-600 hover:text-blue-800">
                    support@easternmills.com
                  </a>
                </p>
                <p>
                  Include the technical details above to help us resolve the issue faster.
                </p>
              </div>

              {/* Suggestions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Common solutions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Check your internet connection</li>
                  <li>• Try using a different browser</li>
                  <li>• Contact your system administrator</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;