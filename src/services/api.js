const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('statshub_token'); 
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en la petición');
  }

  return response.json();
};