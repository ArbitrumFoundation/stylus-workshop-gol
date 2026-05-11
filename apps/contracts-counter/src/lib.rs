//!
//! Stylus Hello World
//!
//! The following contract implements the Counter example from Foundry.
//!
//! ```solidity
//! contract Counter {
//!     uint256 public number;
//!     function setNumber(uint256 newNumber) public {
//!         number = newNumber;
//!     }
//!     function increment() public {
//!         number++;
//!     }
//! }
//! ```
//!
//! The program is ABI-equivalent with Solidity, which means you can call it from both Solidity and Rust.
//! To do this, run `cargo stylus export-abi`.
//!
//! Note: this code is a template-only and has not been audited.

// ----------------------------------------------------------------------
// Stylus contract initialization (keep these lines as shown):
// ----------------------------------------------------------------------
// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
// Use `no_std` for smart contract environments (no standard library).
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

// Import Rust macros for heap allocation (required for Stylus contracts).
#[macro_use]
extern crate alloc;

// Import Vec from the alloc crate, which is used for heap-allocated vectors in no_std environments.
use alloc::vec::Vec;

// Import items from the Stylus SDK. The prelude contains common traits and macros.
use stylus_sdk::{alloy_primitives::U256, prelude::*};
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Contract Storage Definition:
// ----------------------------------------------------------------------
// Define your contract's persistent storage here using the `sol_storage!` macro.
// For a counter, you'll want a struct with a single `uint256 number` field.
// Example (uncomment and complete):
// sol_storage! {
//     #[entrypoint]
//     pub struct Counter {
//         uint256 number;
//     }
// }
// ----------------------------------------------------------------------



// ----------------------------------------------------------------------
// Contract Implementation:
// ----------------------------------------------------------------------
// Now, implement your contract logic by declaring an `impl` block for your struct.
// Use the `#[public]` attribute to expose methods as contract entrypoints.
//
// For example, you might want to implement:
//   - A getter for `number`
//   - A setter for `number`
//   - An increment function
//
// Example (uncomment and complete):
// #[public]
// impl Counter {
//     /// Reads the `number` value from contract storage and returns it to the caller.
//     /// This is a "getter" function, which lets users see the current count.
//     pub fn number(&self) -> U256 {
//         // Return the current value of `number`
//         self.number.get()
//     }
//     /// Stores a new value in `number`, replacing whatever was there before.
//     /// This is a "setter" function, letting users directly set the count.
//     pub fn set_number(&mut self, new_number: U256) {
//         self.number.set(new_number);
//     }
//     /// Multiplies the current value of `number` by the input and updates storage.
//     /// This demonstrates reading and writing to storage in one function.
//     pub fn mul_number(&mut self, new_number: U256) {
//         self.number.set(new_number * self.number.get());
//     }
//     /// Adds the input value to the current `number` and saves the result.
//     /// This shows how to update storage using both the existing and new values.
//     pub fn add_number(&mut self, new_number: U256) {
//         self.number.set(new_number + self.number.get());
//     }
//     /// Increments `number` by 1. This is a classic counter operation.
//     /// Notice how you can use U256 arithmetic for simple increments.
//     pub fn increment(&mut self) {
//         let number = self.number.get();
//         self.set_number(number + U256::from(1));
//     }
//     /// Adds the value sent with the transaction (`msg_value`) to `number`.
//     /// This is an example of a payable function that can access transaction context.
//     #[payable]
//     pub fn add_from_msg_value(&mut self) {
//         let number = self.number.get();
//         self.set_number(number + self.vm().msg_value());
//     }
// }
// ----------------------------------------------------------------------



#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_counter() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = Counter::from(&vm);

        assert_eq!(U256::ZERO, contract.number());

        contract.increment();
        assert_eq!(U256::from(1), contract.number());

        contract.add_number(U256::from(3));
        assert_eq!(U256::from(4), contract.number());

        contract.mul_number(U256::from(2));
        assert_eq!(U256::from(8), contract.number());

        contract.set_number(U256::from(100));
        assert_eq!(U256::from(100), contract.number());

        // Override the msg value for future contract method invocations.
        vm.set_value(U256::from(2));

        contract.add_from_msg_value();
        assert_eq!(U256::from(102), contract.number());
    }
}
