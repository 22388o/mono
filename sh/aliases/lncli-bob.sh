lncli \
  --network regtest \
  --rpcserver="127.0.0.1:10002" \
  --lnddir=$PLAYNET_ROOT/state/bob/lnd \
  "$@"
