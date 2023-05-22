#!/bin/bash

# Set temporary variables
ORD_CMD="/home/dev/bin/ord"
BITCOIN_DATA_DIR="/home/dev/snap/bitcoin-core/common/.bitcoin"
COOKIE_FILE="/home/dev/snap/bitcoin-core/common/.bitcoin/.cookie"
RPC_URL="127.0.0.1:20332/wallet/alice"
WALLET_NAME="alice"

# Create function for the ord command
ord_command() {
  $ORD_CMD --bitcoin-data-dir $BITCOIN_DATA_DIR --cookie-file $COOKIE_FILE --rpc-url $RPC_URL -r --wallet $WALLET_NAME "$@"
}

# Directory containing the files
dir="./inscriptions"

# Iterate over each file in the directory
for file in "$dir"/*
do
  if [ -f "$file" ]
  then
    # Run the command for this file
    ord_command wallet inscribe --fee-rate 154 "$file"
  fi
done

# Run the final command after all file commands have completed
ord_command wallet inscriptions > inscriptions.json
