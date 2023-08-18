set -eu

# Tests needs to be performed in this order to work properly
directories=("core" "portal" "sdk" "app")

for dir in "${directories[@]}"; do
  echo "-------------------------"
  cd "$PORTAL_ROOT/js/$dir"
  echo "Installing deps in $dir..."
  npm install
  echo "Deps installed in $dir completed."
  echo "-------------------------"
done

for dir in "${directories[@]}"; do
  echo "-------------------------"
  cd "$PORTAL_ROOT/js/$dir"
  echo "Running tests in $dir..."
  npm run test
  echo "Tests in $dir completed."
  echo "-------------------------"
done