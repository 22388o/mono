#!/usr/bin/env bash
# Starts/stops the ethereum daemon
set -euo pipefail

# Prints a message and exits
function fatal() {
  echo $@
  exit 1
}

# Read the command-line arguments
COMMAND=${1-usage}
OWNER=${2-portal}

# Configuration
DIRNAME=$(dirname ${BASH_SOURCE[0]})
FILENAME=$(basename ${BASH_SOURCE[0]})
SERVICENAME="${FILENAME%.*}"
CONFIGFILE=$(realpath "${PORTAL_ROOT}/playnet/${SERVICENAME}.${OWNER}.toml")

# Handle the start/stop
case "$COMMAND" in
start)
  printf "starting geth for $OWNER... "
  [ -r $CONFIGFILE ] || fatal "$CONFIGFILE not found; startup failed!"
  mkdir -p $PORTAL_ROOT/playnet/state/$OWNER/$SERVICENAME
  nohup geth --config $CONFIGFILE >/dev/null 2>&1 &
  echo "done"
  ;;

stop)
  printf "stopping geth for $OWNER... "
  [ -r $CONFIGFILE ] || fatal "$CONFIGFILE not found; cleanup failed!"
  pkill geth >/dev/null
  echo "done"
  ;;

*)
  fatal "Usage: $FILENAME <start|stop> [portal]"
  ;;
esac
