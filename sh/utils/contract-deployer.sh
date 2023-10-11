set -euo pipefail

fetch_contract_data() {
  jq -r '.evm.bytecode.object' <"$1"
}

deploy_contract() {
  ethereal contract deploy \
    --connection="$1" \
    --from="$2" \
    --privatekey="$3" \
    --data="$4" \
    --wait |
    awk '{print $1}'
}

fetch_contract_address() {
  ethereal transaction info \
    --connection="$1" \
    --transaction="$2" |
    awk '/Contract address:/ { print $3 }'
}

update_json() {
  jq --arg addr "$1" '.address = $addr' "$2" >"swap.json"
}

# Entry point of the script
main() {
  local CONNECTION="$PORTAL_ETHEREUM_URL"
  local ABI_PATH="${PRJ_ROOT}/js/evm/dist/abi/Swap.json"
  local FROM="$PORTAL_ETHEREUM_WALLET_ADDRESS"
  local PRIVATE_KEY="$PORTAL_ETHEREUM_WALLET_KEY"

  local DATA=$(fetch_contract_data "$ABI_PATH")

  echo "Deploying contract..."
  local TX_HASH=$(deploy_contract "$CONNECTION" "$FROM" "$PRIVATE_KEY" "$DATA")

  echo "Fetching contract address..."
  local CONTRACT_ADDRESS=$(fetch_contract_address "$CONNECTION" "$TX_HASH")

  echo "Updating JSON file with new contract address..."
  update_json "$CONTRACT_ADDRESS" "$ABI_PATH"
}

# Execute the script
main
