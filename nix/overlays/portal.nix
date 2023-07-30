self: super:

let
  # Change the version of nodejs for this project here
  nodejs = super.nodejs-18_x;
  pkgs = super;

  portal = import ../../js/portal { inherit nodejs pkgs; };
  sdk = import ../../js/sdk { inherit nodejs pkgs; };

in

  rec {
    portaldefi = {
      inherit nodejs;
      # contracts = import ../../js/contracts { inherit nodejs; pkgs = super; };
      demo = import ../../js/swap-client { inherit nodejs; pkgs = super; };
      portal = portal.build;
      sdk = sdk.build;
    };

    portaldefi-unit-tests = {
      portal = portal.test;
      sdk = sdk.test;
    };

    portaldefi-integration-tests = {
      portal = import ../vm-tests/portal.nix { pkgs = super; };
    };
  }
