// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Minimal slice of the Stylus Game-of-Life contract this bridge
/// calls. Implemented in Rust on Arbitrum Stylus; see apps/contracts-stylus.
interface IGameOfLifeNFT {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

/// @title Solidity + Stylus NFT bridge
/// @notice A standard Solidity ERC-721 whose `tokenURI` is delegated to a
///         Stylus (Rust/WASM) contract that renders Conway's Game of Life
///         as an inline SVG. The Stylus contract address is injected via
///         the constructor — never hardcoded — so this contract works
///         against whatever address the Stylus deployment lands on, on any
///         chain.
contract NFT is ERC721, Ownable {
    /// @notice Address of the deployed Stylus Game-of-Life contract.
    address public immutable gameOfLifeContract;

    /// @dev Token IDs are 1-indexed and monotonically increasing.
    uint256 private _nextTokenId;

    error GameOfLifeContractZero();

    constructor(address initialOwner, address gameOfLifeContract_)
        ERC721("MyNFT", "MNFT")
        Ownable(initialOwner)
    {
        if (gameOfLifeContract_ == address(0)) revert GameOfLifeContractZero();
        gameOfLifeContract = gameOfLifeContract_;
    }

    function mint() public returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // TODO: Make this Solidity contract delegate metadata generation
        //       to the Stylus (Rust/WASM) contract at `gameOfLifeContract`.
        //
        //   1. Guard with `_requireOwned(tokenId)` so unknown ids revert
        //      with ERC721NonexistentToken instead of falling through to
        //      the cross-contract call.
        //   2. Cast `gameOfLifeContract` to `IGameOfLifeNFT` and call its
        //      `tokenURI(tokenId)`. Return the string it gives back.
        //
        // The accompanying tests in test/StylusNFT.t.sol set up a mock
        // Stylus contract and assert that this function forwards the call.
    }
}
