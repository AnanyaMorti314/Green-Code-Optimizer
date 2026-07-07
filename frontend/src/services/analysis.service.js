import API from './api';

export const analysisService = {
  uploadCode: (file, projectName) => {
    const form = new FormData();
    form.append('codeFile', file);
    if (projectName) form.append('projectName', projectName);
    return API.post('/analysis/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getHistory: () => API.get('/history'),

  getAnalysis: (id) => API.get(`/history/${id}`),

  deleteAnalysis: (id) => API.delete(`/history/${id}`),
};