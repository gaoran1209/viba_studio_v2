import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const fetchHistory = async () => {
  const response = await axios.get(`${API_URL}/generations`, { headers: getHeaders() });
  return response.data;
};

export const saveGeneration = async (data: any) => {
  const response = await axios.post(`${API_URL}/generations`, data, { headers: getHeaders() });
  return response.data;
};

export const deleteGeneration = async (id: string) => {
  await axios.delete(`${API_URL}/generations/${id}`, { headers: getHeaders() });
};
