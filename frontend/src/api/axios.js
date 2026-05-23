import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken = localStorage.getItem('accessToken') || '';

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

// Request interceptor: Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const storedToken = localStorage.getItem('accessToken');
    accessToken = storedToken || '';

    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasFrontendSession = Boolean(localStorage.getItem('accessToken'));
    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.skipAuthRefresh &&
      hasFrontendSession;

    // If the error is 401 and we haven't tried to refresh yet
    if (shouldAttemptRefresh) {
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newAccessToken } = response.data.data;
        setAccessToken(newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., refresh token expired or invalid)
        console.error('Refresh token invalid. Logging out...');
        setAccessToken('');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:changed', { detail: { status: 'logout' } }));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
