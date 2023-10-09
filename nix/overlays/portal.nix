self: super: let
  # Change the version of nodejs for this project here
  nodejs = super.nodejs-18_x;
  pkgs = super;
in {
  portaldefi = {
    inherit nodejs;

    app = import ../../js/app {inherit nodejs pkgs;};
    contracts = import ../../js/evm {inherit nodejs pkgs;};
    demo = import ../../js/swap-client {inherit nodejs pkgs;};
    portal = import ../../js/portal {inherit nodejs pkgs;};
    sdk = import ../../js/sdk {inherit nodejs pkgs;};

    integration-tests = {
      portal = import ../nixos/vm-tests/portal.nix {inherit pkgs;};
      lnd = import ../nixos/vm-tests/lnd.nix {inherit pkgs;};
    };
  };
}
