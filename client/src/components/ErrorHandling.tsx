import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Bug, 
  Wifi, 
  Database, 
  FileX, 
  Clock,
  CheckCircle,
  Info,
  Copy,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export interface ErrorInfo {
  id: string;
  type: 'network' | 'validation' | 'authentication' | 'permission' | 'data' | 'system' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  timestamp: Date;
  component?: string;
  stack?: string;
  resolved: boolean;
  retryable: boolean;
  userAction?: string;
}

interface ErrorHandlingProps {
  error?: Error | null;
  resetError?: () => void;
  showDetails?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  children?: React.ReactNode;
}

// Global error store (in a real app, this would be in a state management system)
class ErrorStore {
  private static instance: ErrorStore;
  private errors: ErrorInfo[] = [];
  private listeners: Array<(errors: ErrorInfo[]) => void> = [];

  static getInstance(): ErrorStore {
    if (!ErrorStore.instance) {
      ErrorStore.instance = new ErrorStore();
    }
    return ErrorStore.instance;
  }

  addError(error: Partial<ErrorInfo>): void {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: error.type || 'unknown',
      severity: error.severity || 'medium',
      message: error.message || 'An unknown error occurred',
      details: error.details,
      timestamp: new Date(),
      component: error.component,
      stack: error.stack,
      resolved: false,
      retryable: error.retryable || false,
      userAction: error.userAction,
    };

    this.errors.unshift(errorInfo);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(0, 50);
    }

    this.notifyListeners();
  }

  resolveError(id: string): void {
    const error = this.errors.find(e => e.id === id);
    if (error) {
      error.resolved = true;
      this.notifyListeners();
    }
  }

  clearAllErrors(): void {
    this.errors = [];
    this.notifyListeners();
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  subscribe(listener: (errors: ErrorInfo[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getErrors()));
  }
}

export const errorStore = ErrorStore.getInstance();

// Hook to use error store
export const useErrorStore = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  useEffect(() => {
    const unsubscribe = errorStore.subscribe(setErrors);
    setErrors(errorStore.getErrors());
    return unsubscribe;
  }, []);

  return {
    errors,
    addError: (error: Partial<ErrorInfo>) => errorStore.addError(error),
    resolveError: (id: string) => errorStore.resolveError(id),
    clearAllErrors: () => errorStore.clearAllErrors(),
  };
};

// Error boundary component
export class ErrorBoundaryWithStore extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    errorStore.addError({
      type: 'system',
      severity: 'high',
      message: error.message,
      details: error.stack,
      stack: errorInfo.componentStack,
      retryable: true,
      userAction: 'Please refresh the page or contact support if the issue persists.',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          onRetry={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
const ErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="max-w-2xl w-full">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl text-red-600">
          Something went wrong
        </CardTitle>
        <CardDescription className="text-gray-600 text-lg">
          We encountered an unexpected error. Please try refreshing the page.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex gap-4 justify-center">
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Main error handling component
const ErrorHandling: React.FC<ErrorHandlingProps> = ({
  error,
  resetError,
  showDetails = true,
  showRetry = true,
  onRetry,
  children,
}) => {
  const { toast } = useToast();
  const { errors, addError, resolveError, clearAllErrors } = useErrorStore();
  const [activeTab, setActiveTab] = useState('current');

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'network': return <Wifi className="h-5 w-5" />;
      case 'validation': return <AlertTriangle className="h-5 w-5" />;
      case 'authentication': return <XCircle className="h-5 w-5" />;
      case 'permission': return <XCircle className="h-5 w-5" />;
      case 'data': return <Database className="h-5 w-5" />;
      case 'system': return <Bug className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: ErrorInfo['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const copyErrorDetails = (errorInfo: ErrorInfo) => {
    const details = `
Error ID: ${errorInfo.id}
Type: ${errorInfo.type}
Severity: ${errorInfo.severity}
Message: ${errorInfo.message}
Component: ${errorInfo.component || 'Unknown'}
Timestamp: ${errorInfo.timestamp.toISOString()}
Details: ${errorInfo.details || 'None'}
Stack: ${errorInfo.stack || 'None'}
    `.trim();

    navigator.clipboard.writeText(details);
    toast({
      title: "Copied",
      description: "Error details copied to clipboard",
    });
  };

  const reportError = (errorInfo: ErrorInfo) => {
    const subject = encodeURIComponent(`Error Report - ${errorInfo.type} - ${errorInfo.severity}`);
    const body = encodeURIComponent(`
Error Details:
${errorInfo.message}

Error ID: ${errorInfo.id}
Type: ${errorInfo.type}
Severity: ${errorInfo.severity}
Timestamp: ${errorInfo.timestamp.toISOString()}
Component: ${errorInfo.component || 'Unknown'}

Additional Details:
${errorInfo.details || 'None'}

Stack Trace:
${errorInfo.stack || 'None'}

User Agent: ${navigator.userAgent}
    `);
    
    window.open(`mailto:support@easternmills.com?subject=${subject}&body=${body}`);
  };

  const unresolvedErrors = errors.filter(e => !e.resolved);
  const criticalErrors = unresolvedErrors.filter(e => e.severity === 'critical');
  const highErrors = unresolvedErrors.filter(e => e.severity === 'high');

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Error</AlertTitle>
        <AlertDescription className="text-red-700">
          {error.message}
          {showDetails && error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                {error.stack}
              </pre>
            </details>
          )}
          {(showRetry || onRetry || resetError) && (
            <div className="mt-3 flex gap-2">
              {(onRetry || resetError) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry || resetError}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Error Banner */}
      {criticalErrors.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Errors Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalErrors.length} critical error{criticalErrors.length !== 1 ? 's' : ''} require immediate attention.
            System functionality may be severely impacted.
          </AlertDescription>
        </Alert>
      )}

      {/* High Priority Error Banner */}
      {highErrors.length > 0 && criticalErrors.length === 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">High Priority Errors</AlertTitle>
          <AlertDescription className="text-orange-700">
            {highErrors.length} high priority error{highErrors.length !== 1 ? 's' : ''} detected.
            Some features may not work correctly.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Management Interface */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Error Management
            </CardTitle>
            <CardDescription>
              Monitor and manage application errors
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {unresolvedErrors.length} unresolved
            </Badge>
            <Button variant="outline" size="sm" onClick={clearAllErrors}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="current">
                Current ({unresolvedErrors.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Errors ({errors.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({errors.filter(e => e.resolved).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {unresolvedErrors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No current errors</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unresolvedErrors.map((errorInfo) => (
                    <Card key={errorInfo.id} className={`border-l-4 ${getSeverityColor(errorInfo.severity)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-0.5">
                              {getErrorIcon(errorInfo.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {errorInfo.message}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {errorInfo.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {errorInfo.severity}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {errorInfo.timestamp.toLocaleString()}
                                {errorInfo.component && (
                                  <span className="ml-3">
                                    Component: {errorInfo.component}
                                  </span>
                                )}
                              </p>

                              {errorInfo.details && (
                                <p className="text-sm text-gray-700 mb-2">
                                  {errorInfo.details}
                                </p>
                              )}

                              {errorInfo.userAction && (
                                <Alert className="mt-2">
                                  <Info className="h-4 w-4" />
                                  <AlertDescription>
                                    {errorInfo.userAction}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {errorInfo.retryable && (
                              <Button size="sm" variant="outline">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyErrorDetails(errorInfo)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reportError(errorInfo)}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveError(errorInfo.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-3">
                {errors.map((errorInfo) => (
                  <Card 
                    key={errorInfo.id} 
                    className={`border-l-4 ${
                      errorInfo.resolved 
                        ? 'border-l-green-500 bg-green-50' 
                        : getSeverityColor(errorInfo.severity)
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {errorInfo.resolved ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            getErrorIcon(errorInfo.type)
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {errorInfo.message}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {errorInfo.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{errorInfo.type}</Badge>
                          <Badge variant="outline">{errorInfo.severity}</Badge>
                          {errorInfo.resolved && (
                            <Badge className="bg-green-100 text-green-800">
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {errors.filter(e => e.resolved).length === 0 ? (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No resolved errors</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {errors.filter(e => e.resolved).map((errorInfo) => (
                    <Card key={errorInfo.id} className="border-l-4 border-l-green-500 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {errorInfo.message}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Resolved at {errorInfo.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            If you continue experiencing issues, please contact our support team:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" asChild>
              <a href="mailto:support@easternmills.com" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Support
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="tel:+91-XXX-XXX-XXXX" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
};

export default ErrorHandling;