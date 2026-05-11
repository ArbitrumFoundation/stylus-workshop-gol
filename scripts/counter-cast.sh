#!/bin/bash

# Usage: ./counter-cast.sh <function> <contract-address> <private-key>
# Example: ./counter-cast.sh number 0xYourContractAddress 0xYourPrivateKey
#          ./counter-cast.sh increment 0xYourContractAddress 0xYourPrivateKey

set -e

if [ $# -ne 3 ]; then
  echo "Usage: $0 <function> <contract-address> <private-key>"
  echo "  <function>: number | increment"
  echo "  <contract-address>: deployed contract address (0x...)"
  echo "  <private-key>: private key (0x...)"
  exit 1
fi

FUNC=$1
CONTRACT=$2
KEY=$3
RPC_URL="http://localhost:8547"

case $FUNC in
  number)
    echo "Calling number()(uint256) on $CONTRACT..."
    cast call --rpc-url "$RPC_URL" --private-key "$KEY" "$CONTRACT" "number()(uint256)"
    ;;
  increment)
    echo "Sending increment() transaction to $CONTRACT..."
    cast send --rpc-url "$RPC_URL" --private-key "$KEY" "$CONTRACT" "increment()"
    ;;
  *)
    echo "Unknown function: $FUNC"
    echo "Valid functions: number, increment"
    exit 1
    ;;
esac
