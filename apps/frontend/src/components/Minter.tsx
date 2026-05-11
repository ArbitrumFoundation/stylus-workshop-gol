import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Abi, AbiEvent } from 'viem';
import { decodeEventLog } from 'viem';
import {
  useAccount,
  useConnect,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi';
import GameOfLifeNFTAbi from '../abi/GameOfLifeNFT.json';

interface TokenData {
  id: bigint;
  uri: string;
}

interface MinterProps {
  contractAddress: string;
  name: string;
  abi?: Abi;
  /**
   * VITE_ env var that supplies `contractAddress`. Used in the
   * "contract not deployed yet" notice so the user knows which line
   * of .env.local to fill in.
   */
  envVar?: string;
  /**
   * Shell command that prints the address to paste into `envVar`.
   * Shown verbatim in the "contract not deployed yet" notice.
   */
  deployCommand?: string;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isUnset(addr: string): boolean {
  return !addr || addr.length !== 42 || addr.toLowerCase() === ZERO_ADDRESS;
}

const Minter = ({
  contractAddress,
  name,
  abi,
  envVar,
  deployCommand,
}: MinterProps) => {
  const contractUnset = isUnset(contractAddress);

  const usedAbi = useMemo<Abi>(
    () => (abi ?? (GameOfLifeNFTAbi as Abi)),
    [abi]
  );

  const transferEvent = useMemo(
    () =>
      usedAbi.find(
        (item) => item.type === 'event' && item.name === 'Transfer'
      ) as AbiEvent | undefined,
    [usedAbi]
  );

  const { address: account, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();

  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Eagerly try to connect on first mount if a wallet is already injected
  // and the user hasn't explicitly disconnected. wagmi's reconnect is
  // automatic for persisted sessions; this just handles the very first
  // visit where no session exists yet.
  useEffect(() => {
    if (isConnected) return;
    const injected = connectors.find((c) => c.type === 'injected');
    if (injected && typeof window !== 'undefined' && window.ethereum) {
      connect({ connector: injected });
    }
  }, [isConnected, connect, connectors]);

  // Reset state when contract changes (route change between RustStylus /
  // Solidity / Solidity+Stylus pages) or when account flips.
  useEffect(() => {
    setTokenIds([]);
    setTokenData([]);
    setHistoryError(null);
  }, [contractAddress, account]);

  // One-shot backfill: every Transfer event into the current account,
  // from genesis. Live updates come from useWatchContractEvent below.
  const loadHistory = useCallback(async () => {
    if (!publicClient || !account || !transferEvent) return;
    if (contractUnset) return;
    setIsLoading(true);
    setHistoryError(null);
    try {
      const logs = await publicClient.getLogs({
        address: contractAddress as `0x${string}`,
        event: transferEvent,
        args: { to: account },
        fromBlock: 0n,
        toBlock: 'latest',
      });
      const ids = logs
        .map((l) => (l.args as { tokenId?: bigint }).tokenId)
        .filter((id): id is bigint => typeof id === 'bigint');
      setTokenIds(ids);
    } catch (err) {
      console.error('[Minter] getLogs failed', err);
      setHistoryError(
        err instanceof Error ? err.message : 'Failed to fetch mint history'
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, account, contractAddress, contractUnset, transferEvent]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // Subscribe to new Transfer events instead of polling on a timer.
  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: usedAbi,
    eventName: 'Transfer',
    enabled: Boolean(account && transferEvent && !contractUnset),
    onLogs(logs) {
      if (!account) return;
      for (const log of logs) {
        try {
          const { args } = decodeEventLog({
            abi: usedAbi,
            data: log.data,
            topics: log.topics,
            eventName: 'Transfer',
          });
          const { to, tokenId } = args as unknown as {
            to: `0x${string}`;
            tokenId: bigint;
          };
          if (to.toLowerCase() === account.toLowerCase()) {
            setTokenIds((prev) =>
              prev.includes(tokenId) ? prev : [...prev, tokenId]
            );
          }
        } catch (err) {
          console.warn('[Minter] failed to decode Transfer log', err);
        }
      }
    },
  });

  // Resolve tokenURI for each id we know about. Could become a single
  // useReadContracts batch call later; for now, simple per-id awaits.
  useEffect(() => {
    let cancelled = false;
    if (!publicClient || tokenIds.length === 0) {
      setTokenData([]);
      return;
    }
    (async () => {
      const data = await Promise.all(
        tokenIds.map(async (id) => {
          try {
            const uri = (await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: usedAbi,
              functionName: 'tokenURI',
              args: [id],
            })) as string;
            return { id, uri };
          } catch (err) {
            console.error(
              `[Minter] readContract(tokenURI, ${id}) failed`,
              err
            );
            return { id, uri: 'ERROR' };
          }
        })
      );
      if (!cancelled) setTokenData(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenIds, publicClient, contractAddress, usedAbi]);

  // ----- mint -----
  const { writeContract, data: mintHash, isPending: isMinting, error: mintError } =
    useWriteContract();
  const { isLoading: isMintConfirming } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const handleMint = () => {
    if (contractUnset || !account) return;
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: usedAbi,
      functionName: 'mint',
      args: [],
    });
  };

  if (contractUnset) {
    return (
      <div className="minter-container p-6 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Game of Life NFT Minter
        </h2>
        {name && (
          <h3 className="text-lg font-semibold text-blue-300 mb-6 text-center">
            {name}
          </h3>
        )}
        <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-100 p-4 rounded space-y-2">
          <p className="font-semibold">This contract isn't deployed yet.</p>
          <p className="text-sm text-yellow-100/90">
            You can skip this experience and use the other tabs, or deploy
            this contract to enable it. Each contract is independent —
            you only need to deploy the ones you want to try.
          </p>
          {deployCommand && (
            <>
              <p className="text-sm text-yellow-100/90">Deploy with:</p>
              <pre className="bg-black/30 text-yellow-50 p-2 rounded text-xs overflow-x-auto">
                {deployCommand}
              </pre>
            </>
          )}
          {envVar && (
            <p className="text-sm text-yellow-100/90">
              Then paste the printed address into{' '}
              <code className="bg-black/30 px-1 rounded">{envVar}</code> in{' '}
              <code className="bg-black/30 px-1 rounded">
                apps/frontend/.env.local
              </code>
              . Vite will hot-reload as soon as you save.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="minter-container p-6 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Game of Life NFT Minter
      </h2>
      {name && (
        <h3 className="text-lg font-semibold text-blue-300 mb-6 text-center">
          {name}
        </h3>
      )}
      {!isConnected || !account ? (
        <p className="text-gray-300 text-center">
          Please connect your wallet to mint an NFT
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <button
              onClick={handleMint}
              disabled={isMinting || isMintConfirming}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isMinting || isMintConfirming
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {isMinting
                ? 'Confirm in wallet…'
                : isMintConfirming
                ? 'Minting…'
                : 'Mint NFT'}
            </button>
            {mintError && (
              <p className="mt-2 text-red-400 text-sm">
                Mint failed: {mintError.message}
              </p>
            )}
            {historyError && (
              <p className="mt-2 text-red-400 text-sm">{historyError}</p>
            )}
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400">Loading your NFTs…</div>
          ) : tokenData.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Your NFTs ({tokenData.length}):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenData.map(({ id, uri }) => (
                  <div key={id.toString()} className="bg-gray-700 p-4 rounded-lg">
                    <div
                      className="aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden p-2"
                      dangerouslySetInnerHTML={{ __html: uri }}
                    />
                    <p className="text-white text-center">
                      Token ID: {id.toString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No NFTs found for your account.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Minter;
