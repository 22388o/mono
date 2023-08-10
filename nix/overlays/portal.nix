self: super: let
  # Change the version of nodejs for this project here
  nodejs = super.nodejs-18_x;
  pkgs = super;

  app = import ../../js/app {inherit nodejs pkgs;};
  demo = import ../../js/swap-client {inherit nodejs pkgs;};
  portal = import ../../js/portal {inherit nodejs pkgs;};
  sdk = import ../../js/sdk {inherit nodejs pkgs;};
in {
  portaldefi = {
    inherit nodejs;
    app = app.build;
    demo = demo.build;
    portal = portal.build;
    sdk = sdk.build;
  };

  portaldefi-unit-tests = {
    portal = portal.test;
    sdk = sdk.test;
  };

  portaldefi-integration-tests = {
    portal = import ../vm-tests/portal.nix {pkgs = super;};
  };
}
