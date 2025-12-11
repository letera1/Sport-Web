import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/json/3';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
});

// Helper to delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    
    // @ts-expect-error - adding custom retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we should retry (network errors, 5xx, or connection reset)
    const shouldRetry = 
      // @ts-expect-error - custom property
      config.__retryCount < MAX_RETRIES &&
      (error.code === 'ECONNRESET' || 
       error.code === 'ECONNABORTED' ||
       error.code === 'ERR_NETWORK' ||
       (error.response?.status && error.response.status >= 500));
    
    if (shouldRetry && config) {
      // @ts-expect-error - custom property
      config.__retryCount += 1;
      // @ts-expect-error - custom property
      const retryDelay = RETRY_DELAY * config.__retryCount; // Exponential backoff
      
      console.warn(`API request failed, retrying in ${retryDelay}ms...`, error.message);
      await delay(retryDelay);
      
      return apiClient(config);
    }
    
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);
