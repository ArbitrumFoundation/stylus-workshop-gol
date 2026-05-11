// EIP-1193 injected provider shape, just enough for the wallet-connect
// flow in `contexts/Web3Context.tsx`. Once we move to wagmi this can be
// dropped — wagmi ships its own typings.
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isConnected: () => boolean;
      request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export {};
