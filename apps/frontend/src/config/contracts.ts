import type { Address } from 'viem';
import { isAddress, zeroAddress } from 'viem';

// Contract addresses are read from Vite env variables so they track
// whatever the local devnode actually deployed. Copy .env.example to
// .env.local after deploying:
//
//   1. pnpm --filter contracts-stylus deploy:local
//        => paste the address into VITE_RUST_NFT_ADDRESS
//   2. pnpm --filter contracts-solidity deploy:local
//        => paste the address into VITE_SOLIDITY_NFT_ADDRESS
//   3. STYLUS_NFT_ADDRESS=<rust-addr> pnpm --filter contracts-solidity
//        deploy:local-with-stylus
//        => paste the address into VITE_SOLIDITY_AND_STYLUS_NFT_ADDRESS
//
// Vite hot-reloads on .env.local changes, so the page updates as soon as
// you save.

function readAddress(name: string, value: string | undefined): Address {
  if (!value) {
    console.warn(
      `[contracts] ${name} is unset; falling back to zero address. ` +
        `Set it in apps/frontend/.env.local.`
    );
    return zeroAddress;
  }
  if (!isAddress(value)) {
    console.warn(
      `[contracts] ${name}="${value}" is not a valid address; ` +
        `falling back to zero address.`
    );
    return zeroAddress;
  }
  return value;
}

export const CONTRACT_ADDRESSES = {
  RUST_NFT: readAddress(
    'VITE_RUST_NFT_ADDRESS',
    import.meta.env.VITE_RUST_NFT_ADDRESS
  ),
  SOLIDITY_NFT: readAddress(
    'VITE_SOLIDITY_NFT_ADDRESS',
    import.meta.env.VITE_SOLIDITY_NFT_ADDRESS
  ),
  SOLIDITY_AND_STYLUS_NFT: readAddress(
    'VITE_SOLIDITY_AND_STYLUS_NFT_ADDRESS',
    import.meta.env.VITE_SOLIDITY_AND_STYLUS_NFT_ADDRESS
  ),
} as const;

export const CONTRACT_NAMES: Record<Address, string> = {
  [CONTRACT_ADDRESSES.RUST_NFT]: 'Rust Stylus NFT',
  [CONTRACT_ADDRESSES.SOLIDITY_NFT]: 'Solidity NFT',
  [CONTRACT_ADDRESSES.SOLIDITY_AND_STYLUS_NFT]: 'Solidity + Stylus NFT',
} as const;

export type ContractName = (typeof CONTRACT_NAMES)[Address];
