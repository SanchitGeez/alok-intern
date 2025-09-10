import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, FileText, Upload, ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen medical-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-slate-900">OralVis Healthcare</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Professional dental image annotation and reporting system for healthcare providers
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/register">
              <Button size="lg">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="medical-shadow hover:medical-shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Patient Upload</CardTitle>
              </div>
              <CardDescription>
                Patients can securely upload dental images with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                  <Upload className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600">
                  Drag & drop interface with patient details form
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-shadow hover:medical-shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Admin Review</CardTitle>
              </div>
              <CardDescription>
                Healthcare professionals review and annotate images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-slate-500">Image Preview</span>
                </div>
                <p className="text-sm text-slate-600">
                  Advanced annotation tools for medical analysis
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-shadow hover:medical-shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Report Generation</CardTitle>
              </div>
              <CardDescription>
                Generate professional PDF reports with annotations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    📄 Professional medical report
                  </p>
                </div>
                <p className="text-sm text-slate-600">
                  Automated PDF generation with findings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Demo */}
        <Card className="medical-shadow mb-8">
          <CardHeader>
            <CardTitle>Workflow Status Tracking</CardTitle>
            <CardDescription>
              Track your submissions through each stage of the review process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { status: 'uploaded', label: 'Uploaded', color: 'blue' },
                { status: 'annotated', label: 'Under Review', color: 'orange' },
                { status: 'reported', label: 'Report Ready', color: 'green' }
              ].map((item, index) => (
                <div key={item.status} className="space-y-2">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border">
                    <span className="text-slate-500 text-sm">Stage {index + 1}</span>
                  </div>
                  <div className="flex justify-center">
                    <span className={`status-${item.status} px-3 py-1 rounded-full text-sm font-medium`}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features List */}
        <Card className="medical-shadow mb-8">
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">For Patients</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>✅ Secure image upload with encryption</li>
                  <li>✅ Real-time submission status tracking</li>
                  <li>✅ Patient details management</li>
                  <li>✅ Download final reports</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">For Administrators</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>✅ Advanced image annotation tools</li>
                  <li>✅ Submission management dashboard</li>
                  <li>✅ Automated PDF report generation</li>
                  <li>✅ Patient data security controls</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-600">
          <p>✅ Backend: Authentication, File Upload, MongoDB Integration</p>
          <p>✅ Frontend: React + TypeScript + Tailwind CSS + shadcn/ui</p>
          <p>🚀 Phase 2: Patient Upload Flow - Ready for Production</p>
        </div>
      </div>
    </div>
  );
}