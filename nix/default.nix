{inputs, ...}: {
  imports = [
    # flake.parts modules
    inputs.flake-root.flakeModule
    inputs.devshell.flakeModule
    inputs.process-compose-flake.flakeModule
    inputs.flake-parts.flakeModules.easyOverlay

    # Local modules
    ./checks.nix
    ./dev.nix
    ./formatter.nix
    ./shell.nix
    ./packages.nix
  ];
}
