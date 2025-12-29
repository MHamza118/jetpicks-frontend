import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';
import { storage, errorUtils } from '../utils';
import type { ApiError } from '../@types/index';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          storage.remove(STORAGE_KEYS.AUTH_TOKEN);
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const config: any = {};
      
      // If data is FormData, don't set Content-Type header
      if (data instanceof FormData) {
        config.headers = {
          ...this.axiosInstance.defaults.headers.common,
        };
        delete config.headers['Content-Type'];
      }
      
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const config: any = {};
      
      // If data is FormData, remove Content-Type header so axios sets it with boundary
      if (data instanceof FormData) {
        config.headers = {
          'Content-Type': undefined,
        };
        // Keep Authorization header
        const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      const response = await this.axiosInstance.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0;
      let message = error.response?.data?.message || error.message || ERROR_MESSAGES.SERVER_ERROR;

      switch (status) {
        case 401:
          message = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 403:
          message = ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 422:
          // For validation errors, try to get the first error message
          if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey && errors[firstErrorKey][0]) {
              message = errors[firstErrorKey][0];
            }
          }
          message = message || ERROR_MESSAGES.VALIDATION_ERROR;
          break;
        case 0:
          message = ERROR_MESSAGES.NETWORK_ERROR;
          break;
      }

      return {
        status,
        message,
      };
    }

    return {
      status: 500,
      message: errorUtils.getErrorMessage(error),
    };
  }
}

export const apiClient = new ApiClient();
