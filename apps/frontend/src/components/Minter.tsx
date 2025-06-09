import React, { useState, useEffect, useCallback } from 'react';
import GameOfLifeNFTAbi from '../abi/GameOfLifeNFT.json';
import { generateGameOfLifeSVG } from '../utils/generateGameOfLifeSVG';
import { useWeb3 } from '../contexts/Web3Context';
import { localhost } from '../constants';


interface TokenData {
  id: bigint;
  uri: string;
}

interface MinterProps {
  contractAddress: string;
  name: string;
}

const Minter: React.FC<MinterProps> = ({ contractAddress, name }) => {
  const { publicClient, walletClient, address: account, isConnected, connect } = useWeb3();

  // Auto-connect if not connected and provider exists
  React.useEffect(() => {
    if (!isConnected && typeof window !== 'undefined' && (window as any).ethereum) {
      connect();
    }
  }, [isConnected, connect]);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's minted NFTs
  const fetchUserMints = useCallback(async () => {
    if (!publicClient || !account) return;
    try {
      setIsLoading(true);
      setError(null);
      const logs = await publicClient.getLogs({
        address: contractAddress as `0x${string}`,
        event: GameOfLifeNFTAbi.find(e => e.type === 'event' && e.name === 'Transfer') as any,
        fromBlock: 0n,
        toBlock: 'latest',
      });
      // Only keep tokens minted to this user
      const tokenIds = logs
        .filter((log: any) => log.args && log.args.to && log.args.to.toLowerCase() === account.toLowerCase())
        .map((log: any) => log.args.tokenId as bigint);
      
      if (tokenIds.length === 0) {
        setTokenData([]);
        setIsLoading(false);
        return;
      }
      const tokenDataPromises = tokenIds.map(async (id: bigint) => {
        const uri = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: GameOfLifeNFTAbi,
          functionName: 'tokenURI',
          args: [id]
        });
        return { id, uri: uri as string };
      });
      const tokenDataResults = await Promise.all(tokenDataPromises);
      setTokenData(tokenDataResults);
      
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError('Failed to fetch NFTs: ' + (error instanceof Error ? error.message : String(error)));
      setTokenData([]);
    } finally {
      setIsLoading(false);
    }
  }, [account, publicClient, contractAddress]);

  // Mint NFT
  const handleMint = useCallback(async () => {
    if (!walletClient || !account) {
      return;
    }
    try {
      setError(null);
      setIsMinting(true);
      try {
        await Promise.race([
          walletClient.writeContract({
            address: contractAddress as `0x${string}`,
            abi: GameOfLifeNFTAbi,
            functionName: 'mint',
            account: account as `0x${string}`,
            args: [],
            chain: localhost
          }),
          new Promise((_, reject) => setTimeout(() => {
            reject(new Error('writeContract timed out after 30s'));
          }, 30000))
        ]);
      } catch (err) {
        throw err;
      }
      setTimeout(() => fetchUserMints(), 2000);
    } catch (error) {
      setError('Mint failed');
    } finally {
      setIsMinting(false);
    }
  }, [walletClient, account, contractAddress, fetchUserMints]);

  // Fetch mints on connect and after mint
  useEffect(() => {
    if (isConnected && account && publicClient) {
      fetchUserMints();
      const interval = setInterval(fetchUserMints, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    } else {
      setTokenData([]);
      (0n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, account, publicClient, fetchUserMints]);

  return (
    <div className="minter-container p-6 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Game of Life NFT Minter</h2>
{name && (
  <h3 className="text-lg font-semibold text-blue-300 mb-6 text-center">{name}</h3>
) }
      {!isConnected || !account ? (
        <div className="flex flex-col items-center">
          <p className="text-gray-300 text-center">Please connect your wallet to mint an NFT</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <button
              onClick={handleMint}
              disabled={isMinting || !isConnected}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isMinting || !isConnected
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400">Loading your NFTs...</div>
          ) : (
            <React.Fragment>
              {tokenData.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Your NFTs ({tokenData.length.toString()}):
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokenData.map(({ id, uri }) => {
                      let svgHtml = '';
                      try {
                        // Try to parse as JSON (Stylus contract)
                        const params = JSON.parse(uri);
                        if (
                          params &&
                          typeof params.seed === 'number' &&
                          typeof params.size === 'number' &&
                          typeof params.generations === 'number' &&
                          typeof params.cell_size === 'number'
                        ) {
                          svgHtml = generateGameOfLifeSVG(params);
                        } else {
                          svgHtml = uri;
                        }
                      } catch (error) {
                        if (process.env.NODE_ENV === 'development') {
                          console.error('Failed to parse JSON for URI:', uri, error);
                        }
                        // Not JSON (Solidity contract)
                        svgHtml = uri;
                      }
                      return (
                        <div key={id.toString()} className="bg-gray-700 p-4 rounded-lg">
                          <div
                            className="aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden p-2"
                            dangerouslySetInnerHTML={{ __html: svgHtml }}
                          />
                          <p className="text-white text-center">Token ID: {id.toString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No NFTs found for your account.</p>
              )}
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
};

export default Minter;
