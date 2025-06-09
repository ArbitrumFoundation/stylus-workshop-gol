// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(feature = "export-abi", test)), no_main)]
extern crate alloc;

use stylus_sdk::{alloy_primitives::U256, prelude::*, storage::StorageU256};
use alloc::{string::String, vec::Vec};

use openzeppelin_stylus::token::erc721::Erc721;


#[entrypoint]
#[storage]
pub struct GameOfLifeNFT {
    #[borrow]
    pub erc721: Erc721,
    pub token_supply: StorageU256,
}

#[public]
impl GameOfLifeNFT {
    pub fn mint(&mut self) -> Result<(), Vec<u8>> {
        let to = self.vm().msg_sender();
        let token_id = self.token_supply.get() + U256::from(1);
        self.token_supply.set(token_id);
        Ok(self.erc721._mint(to, token_id)?)
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
        let generations = 64;
        let cell_size = 4;
        let json = format!(
            "{{\"seed\":{},\"size\":{},\"generations\":{},\"cell_size\":{}}}",
            seed, size, generations, cell_size
        );
        Ok(json)
    }
}

#[cfg(test)]
mod tests {
    use crate::GameOfLifeNFT;
    use openzeppelin_stylus::token::erc721::IErc721;
    use stylus_sdk::alloy_primitives::{address, uint};

    #[motsu::test]
    fn initial_balance_is_zero(contract: GameOfLifeNFT) {
        let test_address = address!("1234567891234567891234567891234567891234");
        let token_id = uint!(10_U256);

        let _ = contract.erc721._mint(test_address, token_id);
        let owner = contract.erc721.owner_of(token_id).unwrap();
        assert_eq!(owner, test_address);
    }
}