import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { Building2, Users, Shield, LogIn } from 'lucide-react';

export default function Landing() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Eastern Mills</h1>
              <p className="text-gray-600">Rug Manufacturing Management System</p>
            </div>
          </div>
          <Button onClick={login} className="flex items-center gap-2" size="lg">
            <LogIn className="h-4 w-4" />
            Sign In with Google
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Eastern Mills
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Complete textile manufacturing quality management platform
          </p>
          <div className="space-y-4">
            <Button onClick={login} size="lg" className="flex items-center gap-2 mx-auto">
              <LogIn className="h-5 w-5" />
              Get Started - Sign In with Google
            </Button>
            <div className="text-sm text-gray-500 text-center space-y-1">
              <p>Note: If popup is blocked, authentication will redirect automatically</p>
              <p>Please allow cookies and enable JavaScript for optimal experience</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Quality Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive lab inspections, compliance audits, and quality management workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Department Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Streamlined workflows for Sampling, Merchandising, and Production departments.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>User Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Role-based access control and granular permissions for secure operations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-6">
            Sign in with your Google account to access your dashboard and begin managing your textile manufacturing processes.
          </p>
          <Button onClick={login} size="lg" className="flex items-center gap-2 mx-auto">
            <LogIn className="h-5 w-5" />
            Sign In Now
          </Button>
        </div>
      </main>
    </div>
  );
}