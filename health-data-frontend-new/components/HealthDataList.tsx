import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { healthDataService } from '@/services/api';

interface HealthData {
  id: number;
  dataHash: string;
  owner: string;
  price: string;
}

interface HealthDataResponse {
  total: number;
  data: HealthData[];
}

interface HealthDataListProps {
  ownerAddress: string;
}

export default function HealthDataList({ ownerAddress }: HealthDataListProps) {
  const [data, setData] = useState<HealthData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    // Only fetch if we have both ownerAddress and auth token
    if (ownerAddress && token) {
      fetchHealthData();
    }
  }, [ownerAddress, token]);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching health data...'); // Debug log
      const token = localStorage.getItem('auth_token');

      if (!token) {
        console.log('No auth token found'); // Debug log
        setError('Please connect your wallet and authenticate');
        return;
      }

      const response = await fetch('http://localhost:3000/api/health-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response:', errorData); // Debug log
        throw new Error(`Failed to fetch data: ${errorData}`);
      }

      const result = await response.json() as HealthDataResponse;
      console.log('Fetched data:', result); // Debug log

      setData(result.data);
      setTotal(result.total);

    } catch (err) {
      console.error('Detailed fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrice = async (id: number, currentPrice: string) => {
    try {
      const newPrice = prompt('Enter new price in ETH:', currentPrice);
      if (!newPrice) return;

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required to update price');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/health-data/${id}/price`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price: newPrice })
      });

      if (!response.ok) {
        throw new Error('Failed to update price');
      }

      // Refresh data after successful update
      await fetchHealthData();

    } catch (err) {
      console.error('Price update error:', err);
      setError('Failed to update price. Please try again.');
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchHealthData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Health Data Records</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Total Records: {total}</span>
          <button
            onClick={fetchHealthData}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">ID: {item.id}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {item.price} ETH
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-gray-500">Hash: </span>
                  <span className="font-mono" title={item.dataHash}>
                    {shortenAddress(item.dataHash)}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500">Owner: </span>
                  <span className="font-mono" title={item.owner}>
                    {item.owner.toLowerCase() === ownerAddress.toLowerCase() ? 'You' : shortenAddress(item.owner)}
                  </span>
                </div>
              </div>

              {item.owner.toLowerCase() === ownerAddress.toLowerCase() && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => handleUpdatePrice(item.id, item.price)}
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Update Price
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No health data found</p>
            <p className="text-sm text-gray-400 mt-2">Submit some data to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}