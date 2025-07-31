import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Building2, Users, Shield, LogIn, ArrowRight, CheckCircle, 
  BarChart3, Package, FileText, Clock, Star, Globe,
  Award, TrendingUp, Zap, Eye, Settings, Database,
  ChevronRight, Play
} from 'lucide-react';

export default function ModernLanding() {
  const { login } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Quality Control",
      description: "Advanced lab testing with AI-powered defect detection",
      color: "from-blue-600 to-blue-800",
      stats: "99.2% accuracy"
    },
    {
      icon: Package,
      title: "Smart Manufacturing",
      description: "End-to-end production tracking with IoT integration",
      color: "from-green-600 to-green-800", 
      stats: "40% efficiency boost"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time insights with predictive analytics",
      color: "from-purple-600 to-purple-800",
      stats: "Live reporting"
    },
    {
      icon: Globe,
      title: "Global Compliance",
      description: "ISO 9001:2015 & international standards support",
      color: "from-orange-600 to-orange-800",
      stats: "100% compliant"
    }
  ];

  const metrics = [
    { label: "Quality Pass Rate", value: "98.5%", icon: CheckCircle, color: "text-green-600" },
    { label: "Production Efficiency", value: "+45%", icon: TrendingUp, color: "text-blue-600" },
    { label: "Cost Reduction", value: "32%", icon: Award, color: "text-purple-600" },
    { label: "Time Saved", value: "6hrs/day", icon: Clock, color: "text-orange-600" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Quality Manager",
      company: "Global Textiles Inc.",
      content: "Eastern Mills ERP transformed our quality control process. We've seen a 40% reduction in defects.",
      rating: 5
    },
    {
      name: "Michael Rodriguez", 
      role: "Production Director",
      company: "Premium Carpets Ltd.",
      content: "The real-time analytics and automated reporting saved us countless hours every week.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Operations Head",
      company: "Luxury Rugs Co.",
      content: "Best investment we've made. The ROI was visible within the first quarter.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Eastern Mills ERP
                </h1>
                <p className="text-gray-600 text-sm">Next-Generation Manufacturing Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="hidden md:flex">
                <Play className="h-4 w-4 mr-2" />
                Watch Demo
              </Button>
              <Button 
                onClick={login} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                <Zap className="h-3 w-3 mr-1" />
                Now with AI-Powered Quality Control
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Manufacturing
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
                Transform your textile manufacturing with our comprehensive ERP solution. 
                From quality control to production management, we've got you covered.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  onClick={login}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-4 text-lg border-2 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {metrics.map((metric, index) => (
                  <div key={metric.label} className={`transition-all duration-700 delay-${index * 100} transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="text-center">
                      <metric.icon className={`h-8 w-8 mx-auto mb-2 ${metric.color}`} />
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-gray-600 text-sm">{metric.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline your textile manufacturing operations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Display */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-2xl border border-gray-100">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      currentFeature === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-8'
                    }`}
                  >
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 text-lg mb-6">{feature.description}</p>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      {feature.stats}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    currentFeature === index 
                      ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color}`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform ${
                        currentFeature === index ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">See what our customers are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 via-purple-900 to-teal-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Manufacturing?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of manufacturers who trust Eastern Mills ERP for their operations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={login}
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              Schedule Demo
            </Button>
          </div>
          
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • 14-day free trial • Setup in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Eastern Mills ERP</div>
                <div className="text-gray-400 text-sm">Manufacturing Excellence Platform</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-gray-400 text-sm">© 2024 Eastern Mills. All rights reserved.</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}