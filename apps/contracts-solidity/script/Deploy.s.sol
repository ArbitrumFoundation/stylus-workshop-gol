// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.25 <0.9.0;

import { NFT } from "../src/NFT.sol";

import { BaseScript } from "./Base.s.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract Deploy is BaseScript {
    function run() public broadcast returns (NFT nft) {
        // Use the broadcaster derived from $ETH_FROM / $MNEMONIC in
        // BaseScript so the deployed NFT is owned by the wallet that
        // actually signed the deployment, not the script address.
        nft = new NFT(broadcaster);
    }
}
