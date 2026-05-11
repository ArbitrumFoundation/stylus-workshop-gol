import React from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { wagmiConfig } from './config/wagmi';
import { CONTRACT_ADDRESSES } from './config/contracts';
import { RPC_URL } from './constants';
import './styles.css';

// Print the resolved env config at startup so "Failed to fetch" issues
// are diagnosable in one glance at the browser console.
console.log('[stylus-workshop] config:', {
  rpcUrl: RPC_URL,
  addresses: CONTRACT_ADDRESSES,
});

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

// One QueryClient per app instance. React-query handles caching of all
// wagmi read hooks (useReadContract, useBalance, useAccount-derived
// queries, etc.).
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
