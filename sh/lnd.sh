#!/usr/bin/env bash
# Starts/stops the lightning daemon
set -euo pipefail

# Prints a message and exits
function fatal() {
  echo $@
  exit 1
}

# Read the command-line arguments
COMMAND=${1-usage}
OWNER=${2-alice}

# Configuration
DIRNAME=$(dirname ${BASH_SOURCE[0]})
FILENAME=$(basename ${BASH_SOURCE[0]})
SERVICENAME="${FILENAME%.*}"
CONFIGFILE=$(realpath "${PORTAL_ROOT}/playnet/${SERVICENAME}.${OWNER}.conf")

# Handle the start/stop
case "$COMMAND" in
start)
  printf "starting lnd for $OWNER ... "
  [ -r $CONFIGFILE ] || fatal "$CONFIGFILE not found; startup failed!"
  mkdir -p $PORTAL_ROOT/playnet/state/$OWNER/$SERVICENAME
  nohup lnd --configfile $CONFIGFILE >/dev/null 2>&1 &
  echo "done"
  ;;

stop)
  printf "stopping lnd for $OWNER... "
  [ -r $CONFIGFILE ] || fatal "$CONFIGFILE not found; cleanup failed!"
  pkill lnd >/dev/null
  echo "done"
  ;;

*)
  fatal "Usage: $FILENAME <start|stop> <alice|bob>"
  ;;
esac
