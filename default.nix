let
  pkgs = import ./nix { system = "x86_64-linux"; };

  portalos = pkgs.nixos ({ modulesPath, ...}: {
    imports = [
      ./tf/playnet-equinix/nix/node/configuration.nix
      ./nix/configuration.nix
    ];
  });

  # TODO: Just for testing purposes, contains local changes
  npmlock2nix = pkgs.callPackage ./nix/npmlock2nix {};

  # copy current directory to nix store (if we migrate to flakes we can obtain this for free)
  self = pkgs.stdenv.mkDerivation rec {
    pname = "mono-root";
    version = "0.0.0";
    src = ./.;
    dontBuild = false;
    dontUnpack = true;
    dontCheck = true;
    dontConfigure = true;

    installPhase = ''
      mkdir -p "$out"
      cp -r ${src}/* "$out"
    '';
  };
in
rec {
  inherit self;

  system = portalos.toplevel;

  portal = {
    modules_debug = npmlock2nix.node_modules_debug {
      src = pkgs.nix-gitignore.gitignoreSourcePure [./.gitignore] ./js/portal;
      srcDir = self;
      localModulesMappings = {
        # "node_modules/sdk" = "/nix/store/hm5kqrnwfckr363g1a9zabwlsp5nlk0b-portal-0.0.0.tgz"; # TODO: Construct the tgz 
        # "node_modules/portal" = "/nix/store/i2rdz9d0v45adrl4g8vy135ccyy6ivxk-portaldefi-sdk-0.0.0.tgz";
        "node_modules/sdk" = "/js/sdk"; # TODO: Construct the tgz 
        "node_modules/portal" = "/js/portal";
      };
    };

    modules = npmlock2nix.node_modules {
      src = pkgs.nix-gitignore.gitignoreSourcePure [./.gitignore] ./js/portal;
      srcDir = self;
      localModulesMappings = {
        "node_modules/sdk" = "/js/sdk";
        "node_modules/portal" = "/js/portal";
      };
    };

    build = npmlock2nix.build {
      inherit (pkgs.portaldefi) nodejs;
      src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./js/portal;
      buildCommands = [ ];
      node_modules_attrs.npmExtraArgs = [ "--omit=dev" ];
      installPhase = "cp -r . $out";
    };
  };
}
