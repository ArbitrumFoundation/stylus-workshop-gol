mod abi;
mod common;

use abi::GameOfLifeNFT;
use alloy::{
    network::EthereumWallet, primitives::U256, providers::ProviderBuilder,
    signers::local::PrivateKeySigner,
};

/// End-to-end test against a running Arbitrum Nitro devnode.
///
/// Requires the devnode at `http://localhost:8547` (start it with
/// `pnpm --filter contracts-stylus nitro-node`). The pre-funded deployer
/// key is the one shipped with the devnode.
///
/// Run with: `pnpm --filter contracts-stylus test:integration`.
#[tokio::test]
async fn test_mint_and_token_uri() {
    let private_key =
        "0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659";
    let endpoint = "http://localhost:8547";

    let signer: PrivateKeySigner =
        private_key.parse().expect("should parse private key");
    let addr = signer.address();
    let wallet = EthereumWallet::from(signer);

    let provider = ProviderBuilder::new()
        .with_recommended_fillers()
        .wallet(wallet)
        .on_http(endpoint.parse().unwrap());

    let deployed_contract_address = common::setup(private_key, endpoint)
        .await
        .expect("Failed to get contract address");

    let contract = GameOfLifeNFT::new(deployed_contract_address, provider.clone());

    // Metadata round-trip.
    let name = contract.name().call().await.expect("name() should succeed");
    assert_eq!(name.name, "Game of Life");

    let symbol = contract
        .symbol()
        .call()
        .await
        .expect("symbol() should succeed");
    assert_eq!(symbol.symbol, "GOL");

    // mint() increments the contract's own token supply and assigns to
    // msg.sender, so the first minted token should have id 1.
    let tx_hash = contract
        .mint()
        .send()
        .await
        .expect("mint tx failed to send")
        .watch()
        .await
        .expect("mint tx failed to confirm");
    println!("mint tx hash {:?}", tx_hash);

    let new_owner = contract
        .ownerOf(U256::from(1))
        .call()
        .await
        .expect("ownerOf(1) should succeed");
    assert_eq!(new_owner.ownerOf, addr);

    // tokenURI should return an inline SVG for the freshly minted token.
    let uri = contract
        .tokenURI(U256::from(1))
        .call()
        .await
        .expect("tokenURI(1) should succeed");
    assert!(
        uri.tokenURI.starts_with("<svg"),
        "tokenURI should begin with <svg, got: {}",
        &uri.tokenURI[..uri.tokenURI.len().min(64)]
    );
    assert!(
        uri.tokenURI.ends_with("</svg>"),
        "tokenURI should end with </svg>"
    );
}
