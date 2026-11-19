import axios from 'axios';
import { API_URL } from '../config.js';
export const client = axios.create({ baseURL: API_URL, withCredentials: true });
export async function request(path, options = {}) {
  try { const response = await client.request({ url: path, ...options }); return response.data; }
  catch (error) {
    if (axios.isCancel(error)) throw error;
    const data = error.response?.data;
    const message = data?.message || Object.values(data?.errors || {}).flat()[0] || (error.response ? `La operación falló (${error.response.status}).` : 'No se pudo conectar. Reintentá cuando vuelva la conexión.');
    const failure = new Error(message); failure.status = error.response?.status; failure.code = data?.code;
    if (failure.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('session-expired'));
    throw failure;
  }
}
export const isAborted = error => axios.isCancel(error) || error?.name === 'AbortError';
