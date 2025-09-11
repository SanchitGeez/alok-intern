import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function LandingPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen medical-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-slate-900">OralVis Healthcare</h1>
          </div>
          
          <p className="text-2xl text-slate-600 max-w-3xl mx-auto mb-4">
            Professional dental image annotation and reporting system
          </p>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
            Secure image upload, expert medical review, and automated report generation for healthcare providers
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Sign Out ({user?.name})
                  <LogOut className="h-5 w-5 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Get Started
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Simple Features */}
        <div className="text-center py-16">
          <h2 className="text-3xl font-semibold text-slate-900 mb-8">
            Streamlined Healthcare Workflow
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="text-4xl">📤</div>
              <h3 className="text-xl font-semibold">Upload Images</h3>
              <p className="text-slate-600">Patients securely upload dental images</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">👩‍⚕️</div>
              <h3 className="text-xl font-semibold">Expert Review</h3>
              <p className="text-slate-600">Healthcare professionals analyze and annotate</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">📋</div>
              <h3 className="text-xl font-semibold">Generate Reports</h3>
              <p className="text-slate-600">Automated PDF reports with findings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}