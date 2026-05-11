import { CONTRACT_ADDRESSES } from '../config/contracts';

// Visible warning banner when the .env.local config is incomplete.
// Without this, missing config presents as opaque eth_getLogs calls
// against the zero address that look like RPC errors.
export default function SetupBanner() {
  const missing: { var: string; why: string }[] = [];

  if (isZero(CONTRACT_ADDRESSES.RUST_NFT)) {
    missing.push({
      var: 'VITE_RUST_NFT_ADDRESS',
      why: 'address printed by `pnpm --filter contracts-stylus deploy:local`',
    });
  }
  if (isZero(CONTRACT_ADDRESSES.SOLIDITY_NFT)) {
    missing.push({
      var: 'VITE_SOLIDITY_NFT_ADDRESS',
      why: 'address printed by `pnpm --filter contracts-solidity deploy:local`',
    });
  }
  if (isZero(CONTRACT_ADDRESSES.SOLIDITY_AND_STYLUS_NFT)) {
    missing.push({
      var: 'VITE_SOLIDITY_AND_STYLUS_NFT_ADDRESS',
      why: 'address printed by `pnpm --filter contracts-solidity deploy:local-with-stylus`',
    });
  }

  if (missing.length === 0) return null;

  return (
    <div className="bg-yellow-500/15 border-b border-yellow-500/40 text-yellow-100 px-4 py-3 text-sm">
      <div className="container mx-auto">
        <p className="font-semibold mb-1">
          Frontend config incomplete — set these in <code>apps/frontend/.env.local</code> and restart <code>pnpm dev</code>:
        </p>
        <ul className="list-disc list-inside space-y-0.5">
          {missing.map((m) => (
            <li key={m.var}>
              <code>{m.var}</code> — {m.why}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-yellow-200/80">
          See <code>apps/frontend/.env.example</code> for the full template.
        </p>
      </div>
    </div>
  );
}

function isZero(addr: string): boolean {
  return addr.toLowerCase() === '0x0000000000000000000000000000000000000000';
}
