#![allow(dead_code)]
use alloy::sol;

// ABI for the GameOfLifeNFT contract under test.
//
// Keep this in sync with `src/lib.rs`. `mint()` takes no arguments — the
// contract increments its own token-supply counter and mints to msg.sender.
sol!(
    #[sol(rpc)]
    contract GameOfLifeNFT {
        function mint() external;

        #[derive(Debug)]
        function ownerOf(uint256 tokenId) external view returns (address ownerOf);
        #[derive(Debug)]
        function balanceOf(address owner) external view returns (uint256 balance);

        function name() external view returns (string name);
        function symbol() external view returns (string symbol);
        function tokenURI(uint256 tokenId) external view returns (string tokenURI);

        function safeTransferFrom(address from, address to, uint256 tokenId) external;
        function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
        function transferFrom(address from, address to, uint256 tokenId) external;
        function approve(address to, uint256 tokenId) external;
        function setApprovalForAll(address operator, bool approved) external;

        error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);
        error ERC721InsufficientApproval(address operator, uint256 tokenId);
        error ERC721InvalidApprover(address approver);
        error ERC721InvalidOperator(address operator);
        error ERC721InvalidOwner(address owner);
        error ERC721InvalidReceiver(address receiver);
        error ERC721InvalidSender(address sender);
        error ERC721NonexistentToken(uint256 tokenId);

        #[derive(Debug, PartialEq)]
        event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
        #[derive(Debug, PartialEq)]
        event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
        #[derive(Debug, PartialEq)]
        event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    }
);
