// types/api.ts
export interface HealthData {
    id: number;
    dataHash: string;
    owner: string;
    price: string;
    isOwner: boolean;
  }
  
  export interface HealthDataResponse {
    total: number;
    data: HealthData[];
  }
  
  export interface ApiConfig extends RequestInit {
    headers?: Record<string, string>;
  }