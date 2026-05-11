import { defineChain } from 'viem';

// RPC endpoint for the local Nitro devnode.
//
// Locally this is just http://localhost:8547. In Codespaces the *browser*
// cannot reach the devnode at that URL — only the Codespaces-forwarded
// HTTPS URL (e.g. https://<codespace-id>-8547.app.github.dev) does — so
// the chain definition reads this from a Vite env var. Set it in
// apps/frontend/.env.local; see .env.example.
export const RPC_URL: string =
  import.meta.env.VITE_RPC_URL?.trim() || 'http://localhost:8547';

// Mirror the protocol for the WebSocket URL (http -> ws, https -> wss).
// Vite's HTTPS dev tunnel forwards both; nitro-devnode listens for ws on
// the same port.
const WS_URL: string = RPC_URL.replace(/^http/, 'ws');

export const localhost = defineChain({
  id: 412346,
  name: 'Nitro Localhost',
  network: 'Nitro localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [RPC_URL], webSocket: [WS_URL] },
    public: { http: [RPC_URL], webSocket: [WS_URL] },
  },
  testnet: false,
});
