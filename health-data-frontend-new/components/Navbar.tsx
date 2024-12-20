'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { getAuthToken, isAuthenticated, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthentication = async () => {
      if (isConnected && address && !isAuthenticated) {
        try {
          setAuthError(null);
          await getAuthToken(address);
        } catch (error) {
          console.error('Authentication error in Navbar:', error);
          setAuthError('Failed to authenticate wallet');
        }
      }
    };

    handleAuthentication();
  }, [isConnected, address, getAuthToken, isAuthenticated]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Healthmint
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {authError && (
              <span className="text-sm text-red-500">
                {authError}
              </span>
            )}

            <div className="relative">
              {isLoading ? (
                <div className="flex items-center justify-center w-[180px] h-[40px] rounded-md bg-gray-100">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Network Status Banner */}
      {isConnected && !isAuthenticated && !isLoading && (
        <div className="bg-yellow-50 border-b border-yellow-100">
          <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-yellow-700 text-center">
              Please sign the message to authenticate your wallet
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}