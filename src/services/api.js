import axiosInstance from '../config/axios.config';

const api = {
  get: (url, params) => axiosInstance.get(url, { params }),
  post: (url, data) => axiosInstance.post(url, data),
  put: (url, data) => axiosInstance.put(url, data),
  patch: (url, data) => axiosInstance.patch(url, data),
  delete: (url) => axiosInstance.delete(url),
  upload: (url, formData) =>
    axiosInstance.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
