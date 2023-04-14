{ pkgs ? import ./nix { } }:

pkgs.mkShell {
  packages = with pkgs; [
    portaldefi.nodejs

    bash
    bitcoind
    coreutils
    go-ethereum
    git
    jq
    less
    lnd
    niv
    nix-diff
    terraform
    which
  ];

  shellHook = ''
    ############################################################################
    # Developer Environment
    ############################################################################
    export PORTAL_ROOT=${toString ./.}
    export PLAYNET_ROOT=${toString ./playnet}


    ############################################################################
    # Functions/Helpers
    ############################################################################

    function run_as_user() {
      local user=$1
      local service=$2
      shift 2

      case "$service" in
        bitcoind)
          cli=bitcoin-cli
          cli_args=(-conf="$PORTAL_ROOT/playnet/$service.$user.conf")
          ;;

        geth)
          cli=geth
          cli_args=(--dev)
          cli_args+=(--config="$PORTAL_ROOT/playnet/$service.$user.toml")
          ;;

        lnd)
          cli=lncli
          cli_args=(--network regtest)
          cli_args+=(--rpcserver=$(grep '^rpclisten=' "$PORTAL_ROOT/playnet/$service.$user.conf" | cut -d'=' -f2))
          cli_args+=(--lnddir=$(grep '^lnddir=' "$PORTAL_ROOT/playnet/$service.$user.conf" | cut -d'=' -f2))
          ;;

        *)
          echo "Usage: $user {bitcoind|geth|lnd} <command>"
          return 1
          ;;
      esac

      $cli "''${cli_args[@]}" "$@"
    }


    ############################################################################
    # Aliases
    ############################################################################
    alias alice='run_as_user alice'
    alias bob='run_as_user bob'
    alias portal='run_as_user portal'

    alias ls='ls --color'
    alias l='ls -la'

    alias tf-get-deploy-private-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.private_key_pem"'
    alias tf-get-deploy-public-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.public_key_openssh"'


    ############################################################################
    # Services
    ############################################################################
    set -eu

    # Disable SIGINT to avoid accidentally stopping geth and lnd
    # Not needed for CI
    [[ ''${GITHUB_ACTIONS-false} == true ]] || stty intr ""

    # Kill all services on exit
    function on_exit() {
      echo "- terminating lnd for alice..."
      run_as_user alice lnd stop

      echo "- terminating lnd for bob..."
      run_as_user bob lnd stop

      echo "- terminating geth for portal..."
      pkill geth

      echo "- terminating bitcoind for portal..."
      run_as_user portal bitcoind stop

      echo "terminated developer environment..."
    }
    trap on_exit EXIT

    readonly RESET_STATE=$([[ -f $PORTAL_ROOT/playnet/.delete_to_reset ]] && echo false || echo true)
    readonly LND_WALLET_FUNDS=10       # in btc
    readonly LND_CHANNEL_FUNDS=1000000 # in satoshis
    readonly BITCOIND_BLOCKS=$(((100 + (($LND_WALLET_FUNDS * 2 + 49) / 50))))

    # Cleanup prior state, if needed
    if [[ $RESET_STATE == "true" ]]; then
      echo "resetting developer environment..."
      rm -rf $PORTAL_ROOT/playnet/{log,state}/*
      mkdir -p $PORTAL_ROOT/playnet/log/{alice,bob,portal}
      mkdir -p $PORTAL_ROOT/playnet/state/{alice,bob,portal}/{bitcoind,geth,lnd}
    fi

    # Start the services
    echo "starting developer environment..."

    echo "- starting bitcoind for portal..."
    bitcoind -conf="$PORTAL_ROOT/playnet/bitcoind.portal.conf" >/dev/null

    echo "- starting geth for portal..."
    nohup geth --dev --config "$PORTAL_ROOT/playnet/geth.portal.toml" >$PORTAL_ROOT/playnet/log/portal/geth.log 2>&1 &
    export PORTAL_ETHEREUM_URL="http://$(cat $PLAYNET_ROOT/geth.portal.toml | grep -oP "(?<=HTTPHost = ')[^']+" | tr -d "'"):$(cat $PLAYNET_ROOT/geth.portal.toml | grep -oP "(?<=HTTPPort = )[0-9]+" | tr -d ' ')"

    echo "- starting lnd for alice..."
    nohup lnd --configfile "$PORTAL_ROOT/playnet/lnd.alice.conf" --noseedbackup >$PORTAL_ROOT/playnet/log/alice/lnd.log 2>&1 &
    while $(run_as_user alice lnd getinfo >/dev/null 2>&1); do sleep 1; done

    echo "- starting lnd for bob..."
    nohup lnd --configfile "$PORTAL_ROOT/playnet/lnd.bob.conf" --noseedbackup >$PORTAL_ROOT/playnet/log/bob/lnd.log 2>&1 &
    while $(run_as_user bob lnd getinfo >/dev/null 2>&1); do sleep 1; done

    # Initialize state, if needed
    if [[ $RESET_STATE == "true" ]]; then
      echo "initializing developer environment..."

      echo "- creating a new bitcoin wallet..."
      run_as_user portal bitcoind createwallet 'default' >/dev/null

      echo "- generating $BITCOIND_BLOCKS blocks..."
      run_as_user portal bitcoind -generate $BITCOIND_BLOCKS >/dev/null

      echo "- creating a new LND wallet for alice..."
      ALICE_LND_NODEID=$(run_as_user alice lnd getinfo | jq -r .identity_pubkey)
      ALICE_LND_WALLET=$(run_as_user alice lnd newaddress p2wkh | jq -r .address)

      echo "- creating a new LND wallet for bob..."
      BOB_LND_NODEID=$(run_as_user bob lnd getinfo | jq -r .identity_pubkey)
      BOB_LND_WALLET=$(run_as_user bob lnd newaddress p2wkh | jq -r .address)

      echo "- funding new LND wallet for alice..."
      portal bitcoind sendtoaddress $ALICE_LND_WALLET $LND_WALLET_FUNDS >/dev/null
      while [ $(run_as_user alice lnd walletbalance | jq -r '.confirmed_balance') -eq 0 ]; do
        run_as_user portal bitcoind -generate 1 >/dev/null
        sleep 1
      done

      echo "- funding new LND wallet for bob..."
      run_as_user portal bitcoind sendtoaddress $BOB_LND_WALLET $LND_WALLET_FUNDS >/dev/null
      while [ $(run_as_user bob lnd walletbalance | jq -r '.confirmed_balance') -eq 0 ]; do
        run_as_user portal bitcoind -generate 1 >/dev/null
        sleep 1
      done

      # Open a payment channel from alice to bob and mine blocks to facilitate opening
      echo "- opening payment channel from alice to bob with $LND_CHANNEL_FUNDS sats..."
      BOB_LND_PEER_URL=$(grep '^listen=' "$PORTAL_ROOT/playnet/lnd.bob.conf" | cut -d'=' -f2)
      run_as_user alice lnd openchannel --local_amt=$LND_CHANNEL_FUNDS --connect=$BOB_LND_PEER_URL --node_key=$BOB_LND_NODEID >/dev/null
      while [ $(run_as_user alice lnd pendingchannels | jq '.pending_open_channels | length') -ne 0 ]; do
        run_as_user portal bitcoind -generate 1 >/dev/null
        sleep 1
      done

      # Open a payment channel from bob to alice and mine blocks to facilitate opening
      echo "- opening payment channel from bob to alice with $LND_CHANNEL_FUNDS sats..."
      ALICE_LND_PEER_URL=$(grep '^listen=' "$PORTAL_ROOT/playnet/lnd.alice.conf" | cut -d'=' -f2)
      run_as_user bob lnd openchannel --local_amt=$LND_CHANNEL_FUNDS --connect=$ALICE_LND_PEER_URL --node_key=$ALICE_LND_NODEID >/dev/null
      while [ $(run_as_user bob lnd pendingchannels | jq '.pending_open_channels | length') -ne 0 ]; do
        run_as_user portal bitcoind -generate 1 >/dev/null
        sleep 1
      done

      # Create the `reset` file to prevent the wallets from being recreated.
      touch $PORTAL_ROOT/playnet/.delete_to_reset
      echo "reset complete"

    else
      # Load the default bitcoin wallet and generate a block to trigger sync
      portal bitcoind loadwallet 'default' >/dev/null
      portal bitcoind -generate 1 >/dev/null

    fi

    set +eu
  '';
}
