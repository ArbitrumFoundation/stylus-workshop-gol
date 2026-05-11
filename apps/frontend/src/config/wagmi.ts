import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { localhost, RPC_URL } from '../constants';

// Wagmi config for the workshop. The injected() connector picks up
// MetaMask / Rabby / any EIP-1193 wallet on `window.ethereum`. The
// transport is plain HTTP against the Nitro devnode at RPC_URL — set
// VITE_RPC_URL in .env.local to override (required in Codespaces,
// since the browser cannot reach raw localhost:8547).
export const wagmiConfig = createConfig({
  chains: [localhost],
  connectors: [injected()],
  transports: {
    [localhost.id]: http(RPC_URL),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
