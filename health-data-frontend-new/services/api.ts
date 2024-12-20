import axios, { AxiosError, AxiosInstance } from "axios";

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create API instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      // You might want to trigger a redirect to login or refresh token here
    }
    return Promise.reject(error);
  }
);

// Types
interface HealthData {
  id: number;
  dataHash: string;
  owner: string;
  price: string;
  isAvailable: boolean;
}

interface HealthDataResponse {
  data: HealthData[];
  total: number;
}

// Health Data Service
export const healthDataService = {
  getAllData: async (): Promise<HealthDataResponse> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await api.get<HealthDataResponse>("/api/health-data");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 401:
            throw new Error("Authentication required. Please login again.");
          case 403:
            throw new Error("You do not have permission to access this data.");
          case 404:
            throw new Error("Health data endpoint not found.");
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error(
              error.response?.data?.message || "Failed to fetch health data"
            );
        }
      }
      throw new Error("An unexpected error occurred");
    }
  },

  getHealthDataById: async (id: number): Promise<HealthData> => {
    try {
      const response = await api.get<HealthData>(`/api/health-data/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 404:
            throw new Error("Health data record not found");
          default:
            throw new Error("Failed to fetch health data record");
        }
      }
      throw new Error("An unexpected error occurred");
    }
  },

  submitHealthData: async (data: any) => {
    try {
      const response = await api.post("/api/health-data", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Failed to submit health data"
        );
      }
      throw new Error("An unexpected error occurred");
    }
  },
};

// Debug helper
if (process.env.NODE_ENV === "development") {
  api.interceptors.request.use((request) => {
    console.log("Starting Request:", {
      url: request.url,
      method: request.method,
      headers: request.headers,
    });
    return request;
  });

  api.interceptors.response.use((response) => {
    console.log("Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  });
}
