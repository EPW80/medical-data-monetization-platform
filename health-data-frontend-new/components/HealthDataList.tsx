'use client';

import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import axios from 'axios';
import { useAccount } from 'wagmi';

interface HealthData {
  id: number;
  dataHash: string;
  owner: string;
  price: string;
}

interface ApiResponse {
  data: HealthData[];
  total?: number;
}

export function HealthDataList({ ownerAddress }: { ownerAddress?: string }) {
  const [data, setData] = useState<HealthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      fetchHealthData();
    }
  }, [isConnected]);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get auth token if it exists
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<ApiResponse>('http://localhost:3000/api/health-data', {
        headers
      });

      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => fetchHealthData()}
          className="mt-2 text-blue-500 hover:text-blue-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">ID: {item.id}</p>
              <p className="text-sm text-gray-500 truncate max-w-[200px]" title={item.dataHash}>
                Hash: {item.dataHash}
              </p>
              <p className="text-sm text-gray-500 truncate" title={item.owner}>
                Owner: {item.owner === ownerAddress ? 'You' : item.owner}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-green-600">
                {formatEther(BigInt(item.price))} ETH
              </p>
            </div>
          </div>
        </div>
      ))}
      {data.length === 0 && !error && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No health data found</p>
          <p className="text-sm text-gray-400 mt-1">Submit some data to get started</p>
        </div>
      )}
    </div>
  );
}