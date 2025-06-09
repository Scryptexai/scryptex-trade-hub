
import { config } from '@/config/environment';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private baseURL: string;
  private wsConnection: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private wsListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.baseURL = config.apiUrl;
    this.initializeWebSocket();
  }

  private async request<T = any>(url: string, config: RequestConfig): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/auth';
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
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
  async get<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  async post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'POST', body: data, headers });
  }

  async put<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'PUT', body: data, headers });
  }

  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE', headers });
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
