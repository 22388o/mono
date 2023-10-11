# Fail the script if any command fails
set -eu

readonly RESET_STATE=$([[ -f $PLAYNET_ROOT/.delete_to_reset ]] && echo false || echo true)

# Reset environment if required
if [[ $RESET_STATE == "true" ]]; then
  echo "resetting developer environment..."
  rm -rf $PLAYNET_ROOT/{log,state}/*
fi

# Ensure important directories are there
echo "Ensuring PLAYNET log and state directores exists..."
mkdir -p $PLAYNET_ROOT/log/{alice,bob,portal}
mkdir -p $PLAYNET_ROOT/state/{alice,bob,portal}/{bitcoind,geth,lnd}

# Ensure geth-dev has always known wallet instead of one random
ethw keystore create \
  --seed="$(echo $PORTAL_ETHEREUM_WALLET_SEED)" \
  --password=$PORTAL_ETHEREUM_WALLET_PASS \
  --keystore-path=$PORTAL_ETHEREUM_GETH_DIR/data/keystore/ \
  --overwrite

# Create it with the content of $PORTAL_ETHEREUM_WALLET_PASS
echo -n "$PORTAL_ETHEREUM_WALLET_PASS" > "$PORTAL_ETHEREUM_GETH_DIR/portal-wallet-password"