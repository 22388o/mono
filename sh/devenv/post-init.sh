############################################################################
# Functions/Helpers
############################################################################

# Constants
readonly LND_WALLET_FUNDS=10
readonly LND_CHANNEL_FUNDS=1000000
readonly BITCOIND_BLOCKS=$((100 + ((LND_WALLET_FUNDS * 2 + 49) / 50)))

# Generate a geth wallet
generate_geth_wallet() {
  local wallet_name=$1
  local wallet_seed=$2
  local wallet_pass=$3
  local wallet_dir=$4
  echo "- generate geth wallet for ${wallet_name}..."
  ethw keystore create \
    --seed="${wallet_seed}" \
    --password="${wallet_pass}" \
    --keystore-path="${wallet_dir}" \
    --overwrite
}

# Fund a geth wallet
fund_geth_wallet() {
  local address=$1
  echo "- funding new geth wallet for ${address} with 100 ether..."
  geth-dev \
    --password=$PORTAL_ETHEREUM_GETH_DIR/portal-wallet-password \
    attach \
    --exec "eth.sendTransaction({ from: eth.coinbase, to: '${address}', value:web3.toWei(100,'ether') })" > /dev/null
}

initialize_dev_environment() {
  generate_geth_wallet "alice" "${ALICE_ETHEREUM_WALLET_SEED}" "${ALICE_ETHEREUM_WALLET_PASS}" "${ALICE_ETHEREUM_GETH_DIR}/keystore"
  fund_geth_wallet "${ALICE_ETHEREUM_WALLET_ADDRESS}"

  generate_geth_wallet "bob" "${BOB_ETHEREUM_WALLET_SEED}" "${BOB_ETHEREUM_WALLET_PASS}" "${BOB_ETHEREUM_GETH_DIR}"
  fund_geth_wallet "${BOB_ETHEREUM_WALLET_ADDRESS}"

  echo "- creating a new bitcoin wallet..."
  bitcoin-cli-dev createwallet 'default' > /dev/null

  echo "- generating $BITCOIND_BLOCKS blocks..."
  bitcoin-cli-dev -generate $BITCOIND_BLOCKS > /dev/null

  echo "- creating a new LND wallet for alice..."
  ALICE_LND_NODEID=$(lncli-alice getinfo | jq -r .identity_pubkey)
  ALICE_LND_WALLET=$(lncli-alice newaddress p2wkh | jq -r .address)

  echo "- creating a new LND wallet for bob..."
  BOB_LND_NODEID=$(lncli-bob getinfo | jq -r .identity_pubkey)
  BOB_LND_WALLET=$(lncli-bob newaddress p2wkh | jq -r .address)

  echo "- funding new LND wallet for alice..."
  bitcoin-cli-dev sendtoaddress $ALICE_LND_WALLET $LND_WALLET_FUNDS > /dev/null
  while [ $(lncli-alice walletbalance | jq -r '.confirmed_balance') -eq 0 ]; do
    bitcoin-cli-dev -generate 1 >/dev/null
    sleep 1
  done

  echo "- funding new LND wallet for bob..."
  bitcoin-cli-dev sendtoaddress $BOB_LND_WALLET $LND_WALLET_FUNDS >/dev/null
  while [ $(lncli-bob walletbalance | jq -r '.confirmed_balance') -eq 0 ]; do
    bitcoin-cli-dev -generate 1 >/dev/null
    sleep 1
  done

  # Open a payment channel from alice to bob and mine blocks to facilitate opening
  echo "- opening payment channel from alice to bob with $LND_CHANNEL_FUNDS sats..."
  BOB_LND_PEER_URL=$(grep '^listen=' "$PLAYNET_ROOT/lnd.bob.conf" | cut -d'=' -f2)
  lncli-alice openchannel --local_amt=$LND_CHANNEL_FUNDS --connect=$BOB_LND_PEER_URL --node_key=$BOB_LND_NODEID > /dev/null
  while [ $(lncli-alice pendingchannels | jq '.pending_open_channels | length') -ne 0 ]; do
    bitcoin-cli-dev -generate 1 > /dev/null
    sleep 1
  done

  # Open a payment channel from bob to alice and mine blocks to facilitate opening
  echo "- opening payment channel from bob to alice with $LND_CHANNEL_FUNDS sats..."
  ALICE_LND_PEER_URL=$(grep '^listen=' "$PLAYNET_ROOT/lnd.alice.conf" | cut -d'=' -f2)
  lncli-bob openchannel --local_amt=$LND_CHANNEL_FUNDS --connect=$ALICE_LND_PEER_URL --node_key=$ALICE_LND_NODEID > /dev/null
  while [ $(lncli-bob pendingchannels | jq '.pending_open_channels | length') -ne 0 ]; do
    bitcoin-cli-dev -generate 1 > /dev/null
    sleep 1
  done

  # Create the `reset` file to prevent the wallets from being recreated.
  touch $PLAYNET_ROOT/.delete_to_reset
  echo "reset complete"
}

############################################################################
# Execution Flow
############################################################################

# Fail the script if any command fails
set -eu

readonly RESET_STATE=$([[ -f $PLAYNET_ROOT/.delete_to_reset ]] && echo false || echo true)

if [[ $RESET_STATE == "true" ]]; then
  initialize_dev_environment
else
  echo "Loading portal bitcoind wallets..."
  bitcoin-cli-dev loadwallet 'default' > /dev/null
  bitcoin-cli-dev -generate 1 > /dev/null
fi

set +eu
