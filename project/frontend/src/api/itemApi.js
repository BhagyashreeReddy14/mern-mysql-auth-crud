import api from './axios';

export const getItemsApi = () => api.get('/items');
export const getItemApi = (id) => api.get(`/items/${id}`);
export const getStatsApi = () => api.get('/items/stats');
export const createItemApi = (data) => api.post('/items', data);
export const updateItemApi = (id, data) => api.put(`/items/${id}`, data);
export const deleteItemApi = (id) => api.delete(`/items/${id}`);
