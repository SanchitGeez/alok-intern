import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  EyeOff,
  Square,
  Circle,
  ArrowRight,
  Pen,
  Undo,
  Redo,
  Trash2,
  FileText,
  User,
  FileDown,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSubmissionStore } from '@/stores/submissionStore';
import { ImageAnnotator } from '@/components/ImageAnnotator';
import type { Submission } from '@/services/submissionService';
import testImage from '@/assets/image.png';

export function SubmissionReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSubmission, isLoading, error, fetchSubmission, updateSubmission, generateReport } = useSubmissionStore();
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [annotationData, setAnnotationData] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Report generation states
  const [showReportForm, setShowReportForm] = useState(false);
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Review text state
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (id) {
      fetchSubmission(id);
    }
  }, [id, fetchSubmission]);

  useEffect(() => {
    if (currentSubmission?.annotationData) {
      setAnnotationData(currentSubmission.annotationData);
    }
    if (currentSubmission?.reviewText) {
      setReviewText(currentSubmission.reviewText);
    }
    console.log('SubmissionReview: Current submission data:', currentSubmission);
    if (currentSubmission) {
      console.log('Image URLs:', {
        originalImageUrl: currentSubmission.originalImageUrl,
        originalImagePath: currentSubmission.originalImagePath
      });
    }
  }, [currentSubmission]);

  const handleSaveAnnotations = async () => {
    if (!currentSubmission || !annotationData) return;

    setIsSaving(true);
    try {
      const success = await updateSubmission(currentSubmission.id, {
        annotationData,
        status: 'annotated'
      });

      if (success) {
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!currentSubmission || !findings.trim() || !recommendations.trim()) {
      alert('Please provide both findings and recommendations before generating the report.');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const result = await generateReport(currentSubmission.id, {
        findings: findings.trim(),
        recommendations: recommendations.trim()
      });

      if (result.success) {
        setShowReportForm(false);
        setFindings('');
        setRecommendations('');
        alert('Report generated successfully! The patient can now download it.');
      } else {
        alert('Failed to generate report. Please try again.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAnnotationChange = (newAnnotationData: any) => {
    setAnnotationData(newAnnotationData);
    setHasUnsavedChanges(true);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !currentSubmission) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Submission Not Found</h3>
            <p className="text-slate-600 mb-4">
              {error || 'The requested submission could not be found.'}
            </p>
            <Button onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Review Submission - {currentSubmission.patientDetails.name}
                </h1>
                <p className="text-sm text-slate-600">
                  Patient ID: {currentSubmission.patientDetails.patientId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentSubmission.status)}`}>
                {getStatusText(currentSubmission.status)}
              </span>

              {hasUnsavedChanges && (
                <Button
                  onClick={handleSaveAnnotations}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}

              {currentSubmission.status === 'annotated' && !showReportForm && (
                <Button onClick={() => setShowReportForm(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              )}
              
              {currentSubmission.reportUrl && (
                <a href={currentSubmission.reportUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Patient Details Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Name</label>
                  <p className="font-medium text-slate-900">{currentSubmission.patientDetails.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Patient ID</label>
                  <p className="font-medium text-slate-900">{currentSubmission.patientDetails.patientId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="font-medium text-slate-900">{currentSubmission.patientDetails.email}</p>
                </div>
                
                {currentSubmission.patientDetails.note && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Patient Note</label>
                    <p className="text-slate-900 bg-slate-50 p-3 rounded-lg text-sm">
                      {currentSubmission.patientDetails.note}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Submitted</label>
                  <p className="text-slate-900">{formatDate(currentSubmission.createdAt)}</p>
                </div>
                
                {currentSubmission.updatedAt !== currentSubmission.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Last Updated</label>
                    <p className="text-slate-900">{formatDate(currentSubmission.updatedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Annotation Tools */}
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>Annotation Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Square className="h-4 w-4 mr-2" />
                  Rectangle
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Circle className="h-4 w-4 mr-2" />
                  Circle
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Arrow
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Pen className="h-4 w-4 mr-2" />
                  Free Draw
                </Button>
                
                <hr className="my-3" />
                
                <Button variant="outline" className="w-full justify-start">
                  <Undo className="h-4 w-4 mr-2" />
                  Undo
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Redo className="h-4 w-4 mr-2" />
                  Redo
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>

                <hr className="my-3" />

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                >
                  {showAnnotations ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Annotations
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Annotations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Image Annotation Area */}
          <div className="lg:col-span-3">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>Dental Image Review</CardTitle>
                <p className="text-slate-600">
                  Add annotations to highlight areas of interest or concern
                </p>
              </CardHeader>
              <CardContent>
                {/* SIMPLE IMAGE DISPLAY FOR TESTING */}
                <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center">
                  <img 
                    src={testImage} 
                    alt="Test Image" 
                    className="max-w-full max-h-96 object-contain rounded"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Text Review Section */}
            <Card className="medical-shadow mt-6">
              <CardHeader>
                <CardTitle>Doctor's Review</CardTitle>
                <p className="text-slate-600">
                  Add your clinical observations and notes
                </p>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="reviewText" className="text-sm font-medium">
                    Clinical Review & Observations
                  </Label>
                  <Textarea
                    id="reviewText"
                    placeholder="Enter your clinical observations, diagnosis, or notes about this dental image..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => {
                        // Save review text along with annotations
                        if (currentSubmission) {
                          updateSubmission(currentSubmission.id, {
                            reviewText,
                            annotationData,
                            status: 'annotated'
                          });
                        }
                      }}
                      disabled={!reviewText.trim() && !annotationData}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Report Generation Form */}
        {showReportForm && (
          <div className="mt-6">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>Generate Medical Report</CardTitle>
                <p className="text-slate-600">
                  Provide clinical findings and recommendations for the PDF report
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="findings" className="text-sm font-medium">
                    Clinical Findings *
                  </Label>
                  <Textarea
                    id="findings"
                    placeholder="Describe the clinical findings from the image analysis..."
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="recommendations" className="text-sm font-medium">
                    Treatment Recommendations *
                  </Label>
                  <Textarea
                    id="recommendations"
                    placeholder="Provide treatment recommendations and next steps..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReportForm(false);
                      setFindings('');
                      setRecommendations('');
                    }}
                    disabled={isGeneratingReport}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport || !findings.trim() || !recommendations.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate PDF Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}