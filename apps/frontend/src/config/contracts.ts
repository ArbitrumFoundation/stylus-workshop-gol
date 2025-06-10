// Contract addresses
export const CONTRACT_ADDRESSES = {
  RUST_NFT: '0xa6e41ffd769491a42a6e5ce453259b93983a22ef',
  SOLIDITY_NFT: '0xdB3F4Ecb0298238a19eC5AFD087C6d9dF8041919',
  SOLIDITY_AND_STYLUS_NFT: '0xA39FFA43ebA037D67a0f4fe91956038ABA0CA386',
} as const;

// Contract ABIs (if needed in the future)
export const CONTRACT_ABIS = {
  // Add ABIs here when needed
} as const;

// Contract names for UI display
export const CONTRACT_NAMES = {
  [CONTRACT_ADDRESSES.RUST_NFT]: 'Rust Stylus NFT',
  [CONTRACT_ADDRESSES.SOLIDITY_NFT]: 'Solidity NFT',
  [CONTRACT_ADDRESSES.SOLIDITY_AND_STYLUS_NFT]: 'Solidity + Stylus NFT',
} as const;

export type ContractName = keyof typeof CONTRACT_NAMES;
