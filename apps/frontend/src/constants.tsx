import { defineChain } from 'viem';

// RPC endpoint the wagmi public client uses for all reads
// (eth_getLogs, eth_call, eth_getTransactionReceipt, ...).
//
// Default: same-origin `/rpc` path that Vite's dev server proxies to
// http://localhost:8547. Going through Vite means the browser only
// fetches from its own origin, which avoids CORS in Codespaces (the
// forwarded :8547 URL is reachable but does not include the
// Access-Control-Allow-Origin header that fetch() preflight needs).
//
// Override by setting VITE_RPC_URL when targeting a remote chain or
// when serving the built bundle without the Vite dev proxy.
function computeRpcUrl(): string {
  const fromEnv = import.meta.env.VITE_RPC_URL?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') {
    return new URL('/rpc', window.location.origin).toString();
  }
  // Non-browser fallback (vitest / SSR-like contexts).
  return 'http://localhost:8547';
}

export const RPC_URL: string = computeRpcUrl();
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
