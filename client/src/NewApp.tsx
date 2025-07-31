import { Router, Route, Switch } from "wouter";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import SamplingPage from "./pages/SamplingPage";
import ProductionQualityPage from "./pages/ProductionQualityPage";
import MerchandisingPage from "./pages/MerchandisingPage";
import AdminPage from "./pages/AdminPage";

function NewApp() {

  return (
    <Router>
      <Switch>
        {/* Landing Page */}
        <Route path="/" component={LandingPage} />
        
        {/* Main App Routes */}
        <Route path="/home" component={HomePage} />
        <Route path="/sampling" component={SamplingPage} />
        <Route path="/production-quality" component={ProductionQualityPage} />
        <Route path="/merchandising" component={MerchandisingPage} />
        <Route path="/admin" component={AdminPage} />

        {/* Fallback Route */}
        <Route path="*">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
              <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                Return to Home
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default NewApp;