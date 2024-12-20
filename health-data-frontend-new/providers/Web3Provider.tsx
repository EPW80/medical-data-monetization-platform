'use client';

import { RainbowKitProvider, getDefaultWallets, connectorsForWallets, Wallet } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import '@rainbow-me/rainbowkit/styles.css';
import ClientOnly from '../components/ClientOnly';
import { AuthProvider } from '@/contexts/AuthContext';

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
    throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

// Configure chains with multiple providers for better reliability
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [sepolia],
    [
        publicProvider(),
        // Add Alchemy provider as fallback (optional)
        // alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || '' })
    ]
);

// Configure available wallets
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

const { connectors } = getDefaultWallets({
    appName: 'Health Data Platform',
    projectId,
    chains,
});

// Create Wagmi config
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <ClientOnly>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider 
                    chains={chains}
                    initialChain={sepolia}
                    showRecentTransactions={true}
                >
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </ClientOnly>
    );
}