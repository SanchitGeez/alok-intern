import { create } from 'zustand';
import { submissionService, type Submission, type CreateSubmissionRequest } from '../services/submissionService';

interface SubmissionState {
  submissions: Submission[];
  currentSubmission: Submission | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Actions
  createSubmission: (data: CreateSubmissionRequest) => Promise<boolean>;
  fetchMySubmissions: () => Promise<void>;
  fetchAllSubmissions: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  fetchSubmission: (id: string) => Promise<void>;
  updateSubmission: (id: string, data: any) => Promise<boolean>;
  deleteSubmission: (id: string) => Promise<boolean>;
  clearError: () => void;
  setCurrentSubmission: (submission: Submission | null) => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  error: null,
  pagination: null,

  createSubmission: async (data: CreateSubmissionRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await submissionService.createSubmission(data);
      
      if (response.success && response.data) {
        // Add the new submission to the list
        set(state => ({
          submissions: [response.data as Submission, ...state.submissions],
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || 'Failed to create submission',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create submission',
        isLoading: false,
      });
      return false;
    }
  },

  fetchMySubmissions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await submissionService.getMySubmissions();
      
      if (response.success) {
        set({
          submissions: Array.isArray(response.data) ? response.data : [],
          isLoading: false,
        });
      } else {
        set({
          error: response.message || 'Failed to fetch submissions',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch submissions',
        isLoading: false,
      });
    }
  },

  fetchAllSubmissions: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const response = await submissionService.getAllSubmissions(params);
      
      if (response.success) {
        set({
          submissions: Array.isArray(response.data) ? response.data : [],
          pagination: response.pagination || null,
          isLoading: false,
        });
      } else {
        set({
          error: response.message || 'Failed to fetch submissions',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch submissions',
        isLoading: false,
      });
    }
  },

  fetchSubmission: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await submissionService.getSubmission(id);
      
      if (response.success && response.data) {
        set({
          currentSubmission: response.data as Submission,
          isLoading: false,
        });
      } else {
        set({
          error: response.message || 'Failed to fetch submission',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch submission',
        isLoading: false,
      });
    }
  },

  updateSubmission: async (id: string, data: any) => {
    set({ isLoading: true, error: null });

    try {
      const response = await submissionService.updateSubmission(id, data);
      
      if (response.success && response.data) {
        // Update the submission in the list
        set(state => ({
          submissions: state.submissions.map(sub => 
            sub.id === id ? response.data as Submission : sub
          ),
          currentSubmission: state.currentSubmission?.id === id 
            ? response.data as Submission 
            : state.currentSubmission,
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || 'Failed to update submission',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update submission',
        isLoading: false,
      });
      return false;
    }
  },

  deleteSubmission: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await submissionService.deleteSubmission(id);
      
      if (response.success) {
        // Remove the submission from the list
        set(state => ({
          submissions: state.submissions.filter(sub => sub.id !== id),
          currentSubmission: state.currentSubmission?.id === id 
            ? null 
            : state.currentSubmission,
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || 'Failed to delete submission',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete submission',
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setCurrentSubmission: (submission: Submission | null) => {
    set({ currentSubmission: submission });
  },
}));