import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';
import { storage, errorUtils } from '../utils';
import type { ApiError } from '../types/index';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getHeaders(): HeadersInit {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES.SERVER_ERROR;
      let errorData: any = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || ERROR_MESSAGES.SERVER_ERROR;
      } catch {
        // If response is not JSON, use status-based message
      }

      const error: ApiError = {
        status: response.status,
        message: errorMessage,
      };

      switch (response.status) {
        case 401:
          error.message = ERROR_MESSAGES.UNAUTHORIZED;
          storage.remove(STORAGE_KEYS.AUTH_TOKEN);
          window.location.href = '/login';
          break;
        case 403:
          error.message = ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          error.message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 422:
          error.message = errorData?.message || ERROR_MESSAGES.VALIDATION_ERROR;
          break;
      }

      throw error;
    }

    try {
      return await response.json();
    } catch {
      throw {
        status: response.status,
        message: 'Failed to parse response',
      };
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const url = `${this.baseURL}${endpoint}`;
      console.log('POST Request:', { url, data });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('POST Response:', { status: response.status, statusText: response.statusText, url: response.url });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST Error:', error);
      throw this.handleError(error);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }

    if (error?.name === 'AbortError') {
      return {
        status: 0,
        message: 'Request timeout',
      };
    }

    if (error?.message) {
      return {
        status: error?.status || 500,
        message: error.message,
      };
    }

    return {
      status: error?.status || 500,
      message: errorUtils.getErrorMessage(error),
    };
  }
}

export const apiClient = new ApiClient();
