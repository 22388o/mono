self: super: let
  # Change the version of nodejs for this project here
  nodejs = super.nodejs_20;
  pkgs = super;

  portal = import ../../js/portal {inherit nodejs pkgs;};
  sdk = import ../../js/sdk {inherit nodejs pkgs;};
in {
  portaldefi = {
    inherit nodejs;
    portal = portal.package;
    sdk = sdk.package;
  };

  # portaldefi-unit-tests = {
  #   portal = portal.test;
  #   sdk = sdk.test;
  # };

  portaldefi-integration-tests = {
    portal = import ../vm-tests/portal.nix {pkgs = super;};
  };
}
