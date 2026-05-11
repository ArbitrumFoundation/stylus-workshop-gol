// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { PRBTest } from "@prb/test/src/PRBTest.sol";
import { StdCheats } from "forge-std/src/StdCheats.sol";

import { NFT as StylusBridgeNFT } from "../src/StylusNFT.sol";

/// @dev A stand-in for the Stylus Game-of-Life contract so we can exercise
/// the cross-contract call inside `tokenURI` without a live devnode.
contract MockGameOfLife {
    function tokenURI(uint256 tokenId) external pure returns (string memory) {
        return string.concat(
            "<svg data-token-id=\"",
            _toString(tokenId),
            "\"></svg>"
        );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

contract StylusNFTTest is PRBTest, StdCheats {
    StylusBridgeNFT private nft;
    MockGameOfLife private gol;
    address private constant OWNER = address(0xA11CE);
    address private constant MINTER = address(0xB0B);

    function setUp() public {
        gol = new MockGameOfLife();
        nft = new StylusBridgeNFT(OWNER, address(gol));
    }

    function test_ConstructorRejectsZeroGameOfLife() public {
        vm.expectRevert(StylusBridgeNFT.GameOfLifeContractZero.selector);
        new StylusBridgeNFT(OWNER, address(0));
    }

    function test_GameOfLifeAddressIsImmutableConstructorArg() public {
        assertEq(nft.gameOfLifeContract(), address(gol));
    }

    function test_MintAssignsSequentialTokenIds() public {
        vm.prank(MINTER);
        uint256 first = nft.mint();
        assertEq(first, 1);
        assertEq(nft.ownerOf(first), MINTER);

        vm.prank(MINTER);
        uint256 second = nft.mint();
        assertEq(second, 2);
        assertEq(nft.totalSupply(), 2);
    }

    function test_TokenURIDelegatesToStylusContract() public {
        vm.prank(MINTER);
        uint256 id = nft.mint();
        string memory uri = nft.tokenURI(id);
        assertEq(uri, "<svg data-token-id=\"1\"></svg>");
    }

    function test_TokenURIRevertsForNonexistentToken() public {
        vm.expectRevert();
        nft.tokenURI(999);
    }
}
