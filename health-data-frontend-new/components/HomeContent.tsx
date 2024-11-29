'use client';

import { useAccount } from 'wagmi';
import { HealthDataList } from '@/components/HealthDataList';
import { SubmitHealthDataForm } from '@/components/SubmitHealthDataForm';
import { useEffect, useState } from 'react';

export function HomeContent() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [isConnected]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {!isConnected ? (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Connect your wallet to access the Healthmint
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            You need to connect your Ethereum wallet to submit and view health data
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Submit Health Data</h2>
            <SubmitHealthDataForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Health Data</h2>
            <HealthDataList ownerAddress={address} />
          </div>
        </div>
      )}
    </div>
  );
}