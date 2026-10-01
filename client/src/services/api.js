import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear localStorage if not already on login
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User endpoints
export const userService = {
  getAllUsers: (search = '') => api.get(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (formData) =>
    api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.post(`/users/${id}/unfollow`),
};

// Post endpoints
export const postService = {
  getAllPosts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.tag) query.append('tag', params.tag);
    if (params.user) query.append('user', params.user);
    const queryString = query.toString();
    return api.get(`/posts${queryString ? `?${queryString}` : ''}`);
  },
  getPostById: (id) => api.get(`/posts/${id}`),
  createPost: (formData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  unlikePost: (id) => api.post(`/posts/${id}/unlike`),
  getTrendingTags: () => api.get('/posts/tags/trending'),
};

// Comment endpoints
export const commentService = {
  getPostComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, text) => api.post(`/posts/${postId}/comments`, { text }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export default api;
