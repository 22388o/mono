geth \
  --dev \
  --config=$PLAYNET_ROOT/geth.portal.toml \
  --datadir=$PLAYNET_ROOT/state/portal/geth/data \
  "$@"
