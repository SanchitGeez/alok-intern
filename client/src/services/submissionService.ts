import api from './api';

export interface PatientDetails {
  name: string;
  patientId: string;
  email: string;
  note?: string;
}

export interface Submission {
  id: string;
  patientId: string;
  patientDetails: PatientDetails;
  originalImagePath: string;
  originalImageUrl?: string;
  annotatedImagePath?: string;
  annotatedImageUrl?: string;
  annotationData?: any;
  reportPath?: string;
  reportUrl?: string;
  status: 'uploaded' | 'annotated' | 'reported';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionRequest {
  image: File;
  patientDetails: PatientDetails;
}

export interface UpdateSubmissionRequest {
  annotationData?: any;
  status?: 'uploaded' | 'annotated' | 'reported';
  annotatedImagePath?: string;
  reportPath?: string;
}

export interface SubmissionResponse {
  success: boolean;
  message?: string;
  data?: Submission | Submission[];
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class SubmissionService {
  async createSubmission(data: CreateSubmissionRequest): Promise<SubmissionResponse> {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('patientDetails[name]', data.patientDetails.name);
    formData.append('patientDetails[patientId]', data.patientDetails.patientId);
    formData.append('patientDetails[email]', data.patientDetails.email);
    if (data.patientDetails.note) {
      formData.append('patientDetails[note]', data.patientDetails.note);
    }

    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getMySubmissions(): Promise<SubmissionResponse> {
    const response = await api.get('/submissions/my');
    return response.data;
  }

  async getAllSubmissions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<SubmissionResponse> {
    const response = await api.get('/submissions', { params });
    return response.data;
  }

  async getSubmission(id: string): Promise<SubmissionResponse> {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  }

  async updateSubmission(id: string, data: UpdateSubmissionRequest): Promise<SubmissionResponse> {
    const response = await api.put(`/submissions/${id}`, data);
    return response.data;
  }

  async deleteSubmission(id: string): Promise<SubmissionResponse> {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  }

  // Helper method to get image URL
  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000/${imagePath}`;
  }
}

export const submissionService = new SubmissionService();