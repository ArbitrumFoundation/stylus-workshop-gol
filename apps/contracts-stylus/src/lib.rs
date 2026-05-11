// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(feature = "export-abi", test)), no_std, no_main)]
extern crate alloc;

use stylus_sdk::{alloy_primitives::U256, prelude::*, storage::StorageU256};
use alloc::{string::String, vec::Vec};
use alloc::vec;
use alloc::format;

use openzeppelin_stylus::token::erc721::Erc721;


#[entrypoint]
#[storage]
pub struct GameOfLifeNFT {
    // TODO: Add the two storage fields this contract needs.
    //
    //   1. An OpenZeppelin Erc721 implementation. Mark it with
    //      `#[borrow]` so external calls to its trait methods
    //      (owner_of, balance_of, transferFrom, …) are routed to it:
    //
    //          #[borrow]
    //          pub erc721: Erc721,
    //
    //   2. A persistent token-supply counter so each mint can pick
    //      a fresh, monotonically increasing id:
    //
    //          pub token_supply: StorageU256,
    //
    // The accompanying `tests` module at the bottom of this file is
    // commented out — uncomment it once both fields exist and `mint`
    // is implemented; the four motsu tests are the workshop's
    // acceptance test.
}

#[public]
#[inherit(Erc721)]
impl GameOfLifeNFT {
    pub fn mint(&mut self) -> Result<(), Vec<u8>> {
        // TODO: Implement mint.
        //
        //   1. Read the caller's address with `self.vm().msg_sender()`.
        //   2. Compute the next id as `token_supply + 1`.
        //   3. Save the bumped supply with `self.token_supply.set(token_id)`.
        //   4. Mint with `self.erc721._mint(to, token_id)?` and
        //      return `Ok(())`.
        //
        // After you finish, uncomment the `tests` module at the bottom
        // of this file and run `pnpm --filter contracts-stylus test`.
        unimplemented!("Workshop: implement mint")
    }

    pub fn name(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("Game of Life"))
    }

    pub fn symbol(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("GOL"))
    }

    #[selector(name = "tokenURI")]
    pub fn token_uri(&self, token_id: U256) -> Result<String, Vec<u8>> {
        let seed = token_id.as_limbs()[0];
        let size = 32;
        let generations = 64; //64 works with decent performances, 128 works but the browser is slow ,  512 & 1024 out of gas error
        let cell_size = 4;

        let mut svg = String::with_capacity(size * size * 32);
        svg.push_str(
            r#"<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><style>
            @keyframes gol_pulse {
                0% {opacity:0}
                20% {opacity:1}
                80% {opacity:1}
                100% {opacity:0}
            }
            @keyframes gol_last {
                0% {opacity:0}
                20% {opacity:1}
                100% {opacity:1}
            }
            .gol-cell {fill:#000;opacity:0;animation:gol_pulse 500ms forwards}
            .gol-cell.last {animation:gol_last 500ms forwards}
            </style>"#,
        );

        // Create dynamic grid
        let mut grid = vec![vec![false; size]; size];
        let mut has_cells = false;

        // Initialize first generation from seed
        for y in 0..size {
            for x in 0..size {
                let v = ((x ^ y) + ((x | y) & (size - 1)) + (seed as usize)) & (size - 1);
                if v < size / 3 {
                    grid[y][x] = true;
                    svg.push_str(&format!(
                        r#"<rect class="gol-cell" x="{}" y="{}" width="{}" height="{}" style="animation-delay:0ms"/>"#,
                        x * cell_size + 1, y * cell_size + 1, cell_size - 1, cell_size - 1
                    ));
                }
            }
        }

        // Compute and render next generations
        for gen in 1..generations {
            let mut next = vec![vec![false; size]; size];
            let mut next_has_cells = false;

            for y in 0..size {
                for x in 0..size {
                    // Count the number of live neighbors for each cell
                    // In Conway's Game of Life, each cell has 8 neighbors (horizontally, vertically, and diagonally adjacent)
                    let mut neighbors = 0;
                    for dy in -1..=1 {
                        for dx in -1..=1 {
                            if dx == 0 && dy == 0 {
                                continue; // Skip the cell itself
                            }
                            // Handle wrapping around the edges (toroidal grid)
                            let nx = (x as i32 + dx).rem_euclid(size as i32) as usize;
                            let ny = (y as i32 + dy).rem_euclid(size as i32) as usize;
                            if grid[ny][nx] {
                                neighbors += 1;
                            }
                        }
                    }
                    
                    // Apply Conway's Game of Life rules:
                    // 1. Any living cell with fewer than two live neighbors dies, as if dying of isolation.
                    // 2. Any living cell with two or three live neighbors continues to live.
                    // 3. Any living cell with more than three live neighbors dies, as if dying of overpopulation.
                    // 4. Any dead cell with exactly three live neighbors becomes a living cell, as if those cells reproduce.
                    next[y][x] = matches!((grid[y][x], neighbors),
                        (true, 2) | (true, 3) | (false, 3));
                    
                    if next[y][x] {
                        next_has_cells = true;
                        let is_last = has_cells && gen == generations - 1;
                        svg.push_str(&format!(
                            r#"<rect class="gol-cell{}" x="{}" y="{}" width="{}" height="{}" style="animation-delay:{}ms"/>"#,
                            if is_last { " last" } else { "" },
                            x * cell_size + 1,
                            y * cell_size + 1,
                            cell_size - 1,
                            cell_size - 1,
                            gen * 400
                        ));
                    }
                }
            }
            grid = next;
            has_cells = next_has_cells;
        }

        svg.push_str("</svg>");
        Ok(svg)
    }
}

// ----------------------------------------------------------------------
// Workshop tests.
//
// Uncomment this whole block after you've filled in the storage fields
// and the `mint` body above. The four tests below are the acceptance
// criteria for the workshop:
//
//   * `mint_assigns_first_token_to_sender` — the very first mint
//     produces token id 1 and the sender owns it.
//   * `token_ids_increment_per_mint`         — id 2 goes to the next minter.
//   * `name_and_symbol`                       — metadata round-trip.
//   * `token_uri_returns_svg_for_minted_token` — the SVG body is intact.
//
// Run with: `pnpm --filter contracts-stylus test`.
// ----------------------------------------------------------------------
//
// #[cfg(test)]
// mod tests {
//     use crate::GameOfLifeNFT;
//     use motsu::prelude::*;
//     use openzeppelin_stylus::token::erc721::IErc721;
//     use stylus_sdk::alloy_primitives::{uint, Address};
//
//     #[motsu::test]
//     fn mint_assigns_first_token_to_sender(
//         contract: Contract<GameOfLifeNFT>,
//         alice: Address,
//     ) {
//         contract
//             .sender(alice)
//             .mint()
//             .expect("first mint should succeed");
//
//         let owner = contract
//             .sender(alice)
//             .erc721
//             .owner_of(uint!(1_U256))
//             .expect("token 1 should be owned");
//         assert_eq!(owner, alice);
//     }
//
//     #[motsu::test]
//     fn token_ids_increment_per_mint(
//         contract: Contract<GameOfLifeNFT>,
//         alice: Address,
//         bob: Address,
//     ) {
//         contract.sender(alice).mint().expect("alice mint");
//         contract.sender(bob).mint().expect("bob mint");
//
//         let first_owner =
//             contract.sender(alice).erc721.owner_of(uint!(1_U256)).unwrap();
//         let second_owner =
//             contract.sender(bob).erc721.owner_of(uint!(2_U256)).unwrap();
//
//         assert_eq!(first_owner, alice);
//         assert_eq!(second_owner, bob);
//     }
//
//     #[motsu::test]
//     fn name_and_symbol(contract: Contract<GameOfLifeNFT>, alice: Address) {
//         assert_eq!(contract.sender(alice).name().unwrap(), "Game of Life");
//         assert_eq!(contract.sender(alice).symbol().unwrap(), "GOL");
//     }
//
//     #[motsu::test]
//     fn token_uri_returns_svg_for_minted_token(
//         contract: Contract<GameOfLifeNFT>,
//         alice: Address,
//     ) {
//         contract.sender(alice).mint().expect("mint");
//         let uri = contract
//             .sender(alice)
//             .token_uri(uint!(1_U256))
//             .expect("tokenURI for minted token");
//         assert!(uri.starts_with("<svg"), "tokenURI should start with <svg");
//         assert!(uri.ends_with("</svg>"), "tokenURI should end with </svg>");
//     }
// }