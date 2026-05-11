// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { PRBTest } from "@prb/test/src/PRBTest.sol";
import { StdCheats } from "forge-std/src/StdCheats.sol";

import { NFT } from "../src/NFT.sol";

contract NFTTest is PRBTest, StdCheats {
    NFT private nft;
    address private constant OWNER = address(0xA11CE);
    address private constant MINTER = address(0xB0B);

    function setUp() public {
        nft = new NFT(OWNER);
    }

    function test_FirstMintAssignsTokenIdOne() public {
        vm.prank(MINTER);
        uint256 tokenId = nft.mint();
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), MINTER);
    }

    function test_TokenIdsAreSequentialAndTotalSupplyIncrements() public {
        vm.prank(MINTER);
        uint256 first = nft.mint();
        vm.prank(MINTER);
        uint256 second = nft.mint();
        assertEq(first, 1);
        assertEq(second, 2);
        assertEq(nft.totalSupply(), 2);
    }

    function test_OwnershipIsTransferredToInitialOwner() public {
        assertEq(nft.owner(), OWNER);
    }
}