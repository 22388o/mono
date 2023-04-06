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

  # Define the startup commands for the bitcoind and LND instances.
  shellHook = ''
    #set -euo pipefail

    ############################################################################
    # Aliases and exports
    ############################################################################
    alias ls='ls --color'
    alias l='ls -la'
    alias tf-get-deploy-private-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.private_key_pem"'
    alias tf-get-deploy-public-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.public_key_openssh"'

    export PORTAL_ROOT=${toString ./.}

    ###########################################################################
    # Check for playnet reset
    ###########################################################################
    if [ ! -f $PORTAL_ROOT/playnet/.delete_to_reset ]; then
      echo "resetting playnet..."
      rm -rf $PORTAL_ROOT/playnet/{log,state}/*
      mkdir -p $PORTAL_ROOT/playnet/{log,state}/{alice,bob,portal}/{bitcoind,lnd}
    fi

    ###########################################################################
    # Start the playnet
    ###########################################################################
    echo "starting playnet..."
    bitcoind -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf >/dev/null
    nohup lnd --noseedbackup --configfile $PORTAL_ROOT/playnet/lnd.alice.conf >/dev/null 2>&1 &
    nohup lnd --noseedbackup --configfile $PORTAL_ROOT/playnet/lnd.bob.conf >/dev/null 2>&1 &

    ###########################################################################
    # Reset the playnet state
    ###########################################################################
    if [ ! -f $PORTAL_ROOT/playnet/.delete_to_reset ]; then
      echo "creating a new bitcoin wallet and generating blocks..."
      bitcoin-cli -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf createwallet 'default' >/dev/null
      bitcoin-cli -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf -generate 103 >/dev/null

      echo "creating a new LND wallet for alice..."
      export ALICE_DIR=$(grep '^lnddir=' $PORTAL_ROOT/playnet/lnd.alice.conf | cut -d'=' -f2)
      export ALICE_RPC=$(grep '^rpclisten=' $PORTAL_ROOT/playnet/lnd.alice.conf | cut -d'=' -f2)
      export ALICE_PEER=$(grep '^listen=' $PORTAL_ROOT/playnet/lnd.alice.conf | cut -d'=' -f2)
      export ALICE_NODEID=$(lncli --network regtest --rpcserver=$ALICE_RPC --lnddir=$ALICE_DIR getinfo | jq -r .identity_pubkey)
      export ALICE_WALLET=$(lncli --network regtest --rpcserver=$ALICE_RPC --lnddir=$ALICE_DIR newaddress p2wkh | jq -r .address)

      echo "creating a new LND wallet for bob..."
      export BOB_DIR=$(grep '^lnddir=' $PORTAL_ROOT/playnet/lnd.bob.conf | cut -d'=' -f2)
      export BOB_RPC=$(grep '^rpclisten=' $PORTAL_ROOT/playnet/lnd.bob.conf | cut -d'=' -f2)
      export BOB_PEER=$(grep '^listen=' $PORTAL_ROOT/playnet/lnd.bob.conf | cut -d'=' -f2)
      export BOB_NODEID=$(lncli --network regtest --rpcserver=$BOB_RPC --lnddir=$BOB_DIR getinfo | jq -r .identity_pubkey)
      export BOB_WALLET=$(lncli --network regtest --rpcserver=$BOB_RPC --lnddir=$BOB_DIR newaddress p2wkh | jq -r .address)

      echo "funding new LND wallet for alice and bob..."
      bitcoin-cli -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf sendtoaddress $ALICE_WALLET 50 >/dev/null
      bitcoin-cli -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf sendtoaddress $BOB_WALLET 50 >/dev/null
      bitcoin-cli -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf -generate 6 >/dev/null
      sleep 10

      ALICE_FUNDS=1000000
      echo "opening payment channel from alice to bob with a capacity of $ALICE_FUNDS satoshis..."
      lncli --network regtest --rpcserver=$ALICE_RPC --lnddir=$ALICE_DIR openchannel --connect=$BOB_PEER --node_key=$BOB_NODEID --local_amt=$ALICE_FUNDS >/dev/null
      bitcoin-cli -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf -generate 6 >/dev/null
      sleep 10

      BOB_FUNDS=1000000
      echo "opening payment channel from bob to alice with a capacity of $BOB_FUNDS satoshis..."
      lncli --network regtest --rpcserver=$BOB_RPC --lnddir=$BOB_DIR openchannel --connect=$ALICE_PEER --node_key=$ALICE_NODEID --local_amt=$BOB_FUNDS >/dev/null
      bitcoin-cli -conf=$PORTAL_ROOT/playnet/bitcoind.portal.conf -generate 6 >/dev/null
      sleep 10

      # Create the `reset` file to prevent the wallets from being recreated.
      touch $PORTAL_ROOT/playnet/.delete_to_reset
      echo "playnet reset complete"
    fi

    #set +euo pipefail
  '';

  # Define the cleanup commands to stop all running daemons.
  exitHook = ''
    echo "stpping playnet..."
    pkill bitcoind
    pkill lnd
  '';
}
