set -euo pipefail

wait_for_open_port() {
  local port="$1"
  local max_retries="$2"
  local count=0

  while [ $count -lt $max_retries ]; do
    curl -s --connect-timeout 2 "http://localhost:$port" >/dev/null && return 0
    sleep 1
    count=$((count + 1))
  done

  echo "Max retries reached waiting for port $port. Exiting."
  exit 1
}

run_unit_tests() {
  # Tests need to be performed in this order to work properly
  directories=("core" "portal" "sdk")

  for dir in "${directories[@]}"; do
    echo "-------------------------"
    pushd "$PORTAL_ROOT/js/$dir"
    echo "Installing deps in $dir..."
    npm install
    echo "Deps installed in $dir completed."
    echo "-------------------------"
    popd
  done

  for dir in "${directories[@]}"; do
    echo "-------------------------"
    pushd "$PORTAL_ROOT/js/$dir"
    echo "Running tests in $dir..."
    npm run test
    echo "Tests in $dir completed."
    echo "-------------------------"
    popd
  done
}

run_integration_tests() {
  echo "Performing integration tests"
  pushd "$PORTAL_ROOT/js/swap-client"
  npm run dev >/dev/null 2>&1 & # TODO: Use process-compose instead
  wait_for_open_port 5173 20
  npm run test:swap
  popd
}

run_nixos_tests() {
  echo "Performing NixOS service verification tests"
  nix-build --option sandbox false --attr checks.portaldefi.integration-tests.portal
}

main() {
  if [ "$#" -eq 0 ]; then
    echo "No command specified. Usage: tests {unit|integration|nixos}"
    exit 1
  fi

  local command="$1"

  # Ensure we're on root folder
  pushd "$PORTAL_ROOT"

  case "$command" in
    "unit") run_unit_tests ;;
    "integration") run_integration_tests ;;
    "nixos") run_nixos_tests ;;
    *) echo "Unknown command. Usage: tests {unit|integration|nixos}" ;;
  esac

  popd
}

main "$@"
