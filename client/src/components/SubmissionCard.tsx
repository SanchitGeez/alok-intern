import { Calendar, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Submission } from '@/services/submissionService';

interface SubmissionCardProps {
  submission: Submission;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
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
        return 'Awaiting Review';
      case 'annotated':
        return 'Under Analysis';
      case 'reported':
        return 'Report Ready';
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

  const handleViewImage = () => {
    if (submission.originalImageUrl) {
      window.open(submission.originalImageUrl, '_blank');
    }
  };

  const handleViewAnnotation = () => {
    if (submission.annotatedImageUrl) {
      window.open(submission.annotatedImageUrl, '_blank');
    }
  };

  const handleDownloadReport = () => {
    if (submission.reportUrl) {
      window.open(submission.reportUrl, '_blank');
    }
  };

  return (
    <Card className="medical-shadow hover:medical-shadow-lg transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {submission.patientDetails.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Patient ID: {submission.patientDetails.patientId}
            </CardDescription>
            {submission.patientDetails.note && (
              <p className="text-sm text-slate-600 mt-2">
                {submission.patientDetails.note}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
            {getStatusText(submission.status)}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                Submitted on {formatDate(submission.createdAt)}
              </span>
            </div>
            
            {submission.updatedAt !== submission.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  Last updated {formatDate(submission.updatedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewImage}
              disabled={!submission.originalImageUrl}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Original
            </Button>

            {submission.status === 'annotated' && submission.annotatedImageUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewAnnotation}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Annotation
              </Button>
            )}

            {submission.status === 'reported' && submission.reportUrl && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleDownloadReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm text-slate-500">
                {submission.status === 'uploaded' ? '1/3' : 
                 submission.status === 'annotated' ? '2/3' : '3/3'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ 
                  width: submission.status === 'uploaded' ? '33%' : 
                         submission.status === 'annotated' ? '66%' : '100%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}