'use client';

import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import '@rainbow-me/rainbowkit/styles.css';
import ClientOnly from '../components/ClientOnly';

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
    throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

const { chains, publicClient } = configureChains(
    [sepolia],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: 'Health Data Platform',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    chains
});

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <ClientOnly>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains}>
                    {children}
                </RainbowKitProvider>
            </WagmiConfig>
        </ClientOnly>
    );
}