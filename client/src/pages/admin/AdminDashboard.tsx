import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  LogOut, 
  Users, 
  FileText, 
  Eye, 
  Filter,
  Search,
  Download,
  MoreVertical
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import type { Submission } from '@/services/submissionService';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { submissions, isLoading, error, fetchAllSubmissions } = useSubmissionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAllSubmissions({ page: currentPage, limit: 10 });
  }, [fetchAllSubmissions, currentPage]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewSubmission = (submission: Submission) => {
    navigate(`/admin/submissions/${submission.id}`);
  };

  const getStatusStats = () => {
    const stats = {
      total: submissions.length,
      uploaded: 0,
      annotated: 0,
      reported: 0,
    };

    submissions.forEach(submission => {
      stats[submission.status]++;
    });

    return stats;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'annotated':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reported':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Pending Review';
      case 'annotated':
        return 'Review Complete';
      case 'reported':
        return 'Report Generated';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.patientDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.patientDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.patientDetails.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
                <h1 className="text-2xl font-bold text-slate-900">OralVis Admin</h1>
                <p className="text-sm text-slate-600">Healthcare Management Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-slate-900">Dr. {user?.name}</p>
                <p className="text-sm text-slate-600">Administrator</p>
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
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Review</p>
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
                  <p className="text-sm font-medium text-slate-600">Under Review</p>
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
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.reported}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-600"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Management */}
        <Card className="medical-shadow">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Submission Management</CardTitle>
                <p className="text-slate-600 mt-1">Review and manage patient submissions</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="uploaded">Pending Review</option>
                  <option value="annotated">Under Review</option>
                  <option value="reported">Completed</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-slate-600 mt-4">Loading submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No matching submissions' : 'No submissions yet'}
                </h3>
                <p className="text-slate-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Submissions will appear here once patients upload images'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                              {submission.patientDetails.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              ID: {submission.patientDetails.patientId} • {submission.patientDetails.email}
                            </p>
                            {submission.patientDetails.note && (
                              <p className="text-sm text-slate-600 mt-1">
                                Note: {submission.patientDetails.note}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                              {getStatusText(submission.status)}
                            </span>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDate(submission.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}