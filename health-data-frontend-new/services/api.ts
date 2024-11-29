import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const healthDataService = {
  // maps to /api/submit-data endpoint
  submitData: async (data: any) => {
    const response = await api.post("/submit-data", data);
    return response.data;
  },

  // Maps to /api/health-data endpoint
  getAllData: async () => {
    const response = await api.get("/health-data");
    return response.data;
  },

  // Maps to /api/health-data/:id endpoint
  getDataById: async (id: string) => {
    const response = await api.get(`/health-data/${id}`);
    return response.data;
  },
};

export const authService = {
  // Maps to /api/auth/challenge endpoint
  getChallenge: async (address: string) => {
    const response = await api.post("/api/auth/challenge", { address });
    return response.data;
  },

  // Maps to /api/auth/verify endpoint
  verifySignature: async (data: {
    address: string;
    message: string;
    signature: string;
  }) => {
    const response = await api.post("/api/auth/verify", data);
    return response.data;
  },
};

export const walletService = {
  // Maps to /api/wallet/info endpoint
  getInfo: async () => {
    const response = await api.get("/wallet-info");
    return response.data;
  },
};

export const searchService = {
  // Maps to /api/search endpoint
  search: async (params: any) => {
    const response = await api.get("/api/search", { params });
    return response.data;
  },

  // Maps to /api/stats endpoint
  getStats: async () => {
    const response = await api.get("/api/stats");
    return response.data;
  },
};
