/// <reference types="vite/client" />

// Strongly type the variables we read in src/config/contracts.ts so the
// `import.meta.env.VITE_*` access sites get autocomplete and type
// checking against the real env shape.
interface ImportMetaEnv {
  readonly VITE_RPC_URL?: string;
  readonly VITE_RUST_NFT_ADDRESS?: string;
  readonly VITE_SOLIDITY_NFT_ADDRESS?: string;
  readonly VITE_SOLIDITY_AND_STYLUS_NFT_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
