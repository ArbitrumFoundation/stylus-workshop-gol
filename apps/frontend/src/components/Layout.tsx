import { Link, Outlet } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import SetupBanner from './SetupBanner';

export default function Layout() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const injectedConnector = connectors.find((c) => c.type === 'injected');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SetupBanner />
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">NFT Workshop</Link>
          <div className="space-x-4 flex items-center">
            <Link to="/rust-stylus" className="hover:text-blue-400">Rust + Stylus</Link>
            <Link to="/solidity" className="hover:text-blue-400">Solidity</Link>
            <Link to="/solidity-stylus" className="hover:text-blue-400">Solidity + Stylus</Link>
            {isConnected && address ? (
              <>
                <span className="bg-gray-700 rounded px-3 py-1 text-sm font-mono mr-2">
                  {address.slice(0, 6)}…{address.slice(-4)}
                </span>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={!injectedConnector || isPending}
                onClick={() =>
                  injectedConnector && connect({ connector: injectedConnector })
                }
              >
                {isPending ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
