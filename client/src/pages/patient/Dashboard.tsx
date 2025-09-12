import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Upload, FileText, LogOut, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { SubmissionCard } from '@/components/SubmissionCard';
import { UploadModal } from '@/components/UploadModal';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { submissions, isLoading, error, fetchMySubmissions } = useSubmissionStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchMySubmissions();
  }, [fetchMySubmissions]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusStats = () => {
    const stats = {
      uploaded: 0,
      annotated: 0,
      reported: 0,
    };

    submissions.forEach(submission => {
      stats[submission.status]++;
    });

    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">OralVis Healthcare</h1>
                <p className="text-sm text-slate-600">Patient Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-600">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-slate-900">{submissions.length}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Uploaded</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.uploaded}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Annotated</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.annotated}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-orange-600"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Reported</p>
                  <p className="text-3xl font-bold text-green-600">{stats.reported}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-600"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Submissions</h2>
            <p className="text-slate-600">Upload and track your dental images</p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <Card className="medical-shadow">
            <CardContent className="p-12 text-center">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No submissions yet</h3>
              <p className="text-slate-600 mb-6">
                Get started by uploading your first dental image for professional review
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload First Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          fetchMySubmissions();
        }}
      />
    </div>
  );
}