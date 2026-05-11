import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { localhost } from '../constants';

// Wagmi config for the workshop. The injected() connector picks up
// MetaMask / Rabby / any EIP-1193 wallet on `window.ethereum`. The
// transport is plain HTTP against the Nitro devnode; for testnet or
// mainnet, add additional chains + transports here.
export const wagmiConfig = createConfig({
  chains: [localhost],
  connectors: [injected()],
  transports: {
    [localhost.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
