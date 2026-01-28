type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken?: () => string | null;
  private readonly onUnauthorized?: () => void;

  constructor(baseUrl: string, getToken?: () => string | null, onUnauthorized?: () => void) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const token = this.getToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.onUnauthorized?.();
      }
      const message = await this.safeReadError(response);
      throw new HttpError(message || `HTTP ${response.status}`, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private async safeReadError(response: Response): Promise<string | null> {
    try {
      const data = await response.json();
      if (typeof data === 'string') return data;
      if (data?.error) return data.error;
      if (data?.message) return data.message;
      return null;
    } catch {
      return null;
    }
  }
}



