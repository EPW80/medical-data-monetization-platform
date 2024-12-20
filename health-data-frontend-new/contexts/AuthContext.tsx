'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    getAuthToken: (address: string) => Promise<string>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('auth_token');
            if (storedToken) {
                setToken(storedToken);
            }
        } catch (err) {
            console.error('Error reading from localStorage:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const getAuthToken = useCallback(async (address: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Validate address
            if (!address) {
                throw new Error('Wallet address is required');
            }

            // Check if MetaMask is available
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // Get challenge
            const challengeResponse = await fetch('http://localhost:3000/api/auth/challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address })
            });

            if (!challengeResponse.ok) {
                const errorData = await challengeResponse.json();
                throw new Error(errorData.error || 'Failed to get challenge');
            }

            const { message } = await challengeResponse.json();

            if (!message) {
                throw new Error('No challenge message received');
            }

            // Get signature using MetaMask
            console.log('Requesting signature from MetaMask...');
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, address],
            });

            if (!signature) {
                throw new Error('No signature received');
            }

            console.log('Signature received:', signature);

            // Verify signature
            const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    message,
                    signature,
                })
            });

            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.error || 'Verification failed');
            }

            const { token: newToken } = await verifyResponse.json();

            if (!newToken) {
                throw new Error('No token received');
            }

            // Save token
            setToken(newToken);
            localStorage.setItem('auth_token', newToken);

            return newToken;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            setError(errorMessage);
            setToken(null);
            localStorage.removeItem('auth_token');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        try {
            setToken(null);
            localStorage.removeItem('auth_token');
            setError(null);
        } catch (err) {
            console.error('Error during logout:', err);
            setError('Failed to logout');
        }
    }, []);

    const value = {
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        error,
        getAuthToken,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useRequireAuth() {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            console.warn('Authentication required');
        }
    }, [auth.isLoading, auth.isAuthenticated]);

    return auth;
}