
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@/config/environment';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private instance: AxiosInstance;
  private wsConnection: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private wsListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.instance = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.initializeWebSocket();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (config.development?.debugMode) {
          console.log('API Request:', config);
        }
        
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (config.development.debugMode) {
          console.log('API Response:', response);
        }
        return response;
      },
      (error) => {
        console.error('Response Error:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/auth';
        }
        
        return Promise.reject(error);
      }
    );
  }

  private initializeWebSocket() {
    if (!config.features.realtime) return;

    try {
      this.wsConnection = new WebSocket(config.wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket connected');
        this.wsReconnectAttempts = 0;
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };
      
      this.wsConnection.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleWebSocketReconnect();
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  }

  private handleWebSocketMessage(data: any) {
    const { type, payload } = data;
    const listeners = this.wsListeners.get(type);
    
    if (listeners) {
      listeners.forEach(callback => callback(payload));
    }
  }

  private handleWebSocketReconnect() {
    if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
      this.wsReconnectAttempts++;
      const delay = Math.pow(2, this.wsReconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`WebSocket reconnect attempt ${this.wsReconnectAttempts}`);
        this.initializeWebSocket();
      }, delay);
    }
  }

  // WebSocket event listeners
  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.wsListeners.has(eventType)) {
      this.wsListeners.set(eventType, new Set());
    }
    this.wsListeners.get(eventType)!.add(callback);
  }

  unsubscribe(eventType: string, callback: (data: any) => void) {
    const listeners = this.wsListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // HTTP API methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Blockchain specific methods
  async executeTransaction(chainId: number, transactionData: any): Promise<ApiResponse> {
    return this.post(`/chains/${chainId}/transactions/execute`, transactionData);
  }

  async getTransactionStatus(chainId: number, txHash: string): Promise<ApiResponse> {
    return this.get(`/chains/${chainId}/transactions/${txHash}/status`);
  }

  async getNetworkStats(chainId: number): Promise<ApiResponse> {
    return this.get(`/chains/${chainId}/network/stats`);
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

export const apiClient = new ApiClient();
