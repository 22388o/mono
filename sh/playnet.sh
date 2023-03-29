#!/usr/bin/env bash
# Starts/stops the developer environment
set -euo pipefail

# Prints a message and exits
function fatal() {
  echo $@
  exit 1
}

# Read the command-line arguments
COMMAND=${1-usage}

# Configuration
DIRNAME=$(dirname ${BASH_SOURCE[0]})
FILENAME=$(basename ${BASH_SOURCE[0]})

# Handle the start/stop
case "$COMMAND" in
start)
  echo "developer environment starting..."
  $DIRNAME/bitcoind.sh start portal
  $DIRNAME/geth.sh start portal
  $DIRNAME/lnd.sh start alice
  $DIRNAME/lnd.sh start bob
  echo "developer environment started successfully."
  ;;

stop)
  echo "developer environment stopping..."
  $DIRNAME/lnd.sh stop bob || true
  $DIRNAME/lnd.sh stop alice || true
  $DIRNAME/geth.sh stop portal || true
  $DIRNAME/bitcoind.sh stop portal || true
  echo "developer environment stopped successfully."
  ;;

*)
  fatal "Usage: $FILENAME {start | stop}"
  ;;

esac
