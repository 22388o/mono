lncli \
  --network regtest \
  --rpcserver="127.0.0.1:10001" \
  --lnddir=$PLAYNET_ROOT/state/alice/lnd \
  "$@"
