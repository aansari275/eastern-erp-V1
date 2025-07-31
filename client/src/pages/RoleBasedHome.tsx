import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Factory, ShoppingCart } from 'lucide-react';

export default function RoleBasedHome() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Eastern Mills
        </h1>
        <p className="text-xl text-gray-600">
          Rug Creation Tracker - Choose Your Department
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 rounded-lg bg-blue-500 text-white">
                <Factory className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Sampling Department</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <p className="text-gray-600 mb-6">
              Create rug samples, manage specifications, and view your rug gallery
            </p>
            <Link href="/sampling">
              <Button className="w-full" size="lg">
                Access Sampling
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 rounded-lg bg-purple-500 text-white">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Merchandising Department</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <p className="text-gray-600 mb-6">
              Review costs, manage quotes, handle PDOCs, and manage buyers
            </p>
            <Link href="/merchandising">
              <Button className="w-full" size="lg" variant="outline">
                Access Merchandising
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}