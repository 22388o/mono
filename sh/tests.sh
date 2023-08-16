set -eu

# Tests needs to be performed in this order (because of npm link)
# TODO: See for potential alternatives like using relative-deps?
directories=("core" "portal" "sdk" "app")

for dir in "${directories[@]}"; do
  cd "$PORTAL_ROOT/js/$dir"
  echo "Running tests in $dir..."
  npm install
  npm run test
  echo "Tests in $dir completed."
  echo "-------------------------"
done