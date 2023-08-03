{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
  js2nix ? pkgs.js2nix,
}: rec {
  node_modules = js2nix.makeNodeModules ./package.json {
    name = "portal-node-modules";
    tree = js2nix.load ./yarn.lock {
      overlays = [
        (self: super: {
          buildNodeModule =
            pkgs.lib.makeOverridable
            (args: (super.buildNodeModule args).override {doCheck = false;});

          "sdk@0.0.0" = super."sdk@0.0.0".override (x: {
            src = builtins.path {
              name = "sdk";
              path = ../sdk;
              filter = p: t: ! (t == "directory" && pkgs.lib.hasSuffix "node_modules" p);
            };
          });

          "bignumber.js@2.0.7" = super."bignumber.js@2.0.7".override (x: {
            src = x.src.override {
              name = "57692b3ecfc98bbdd6b3a516cb2353652ea49934.tgz";
              sha256 = "sha256-hFA6dLVQM5P4yniV9GlhzA2PgUPc1sloprKBZTIXTo0=";
            };
          });

          "web3melnx@0.20.7" = super."web3melnx@0.20.7".override (x: {
            src = x.src.override {
              name = "5f91ec3801d6d3a0a1e22410ddc2ad0166d9190f.tgz";
              sha256 = "sha256-jsvrzDlk5zShvv3HDdknlWzLp2fXeia+rqrX0Rm/7pY=";
            };
          });
        })
      ];
    };
  };

  package = pkgs.stdenv.mkDerivation {
    name = "portal";
    version = "0.0.0";

    src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;

    buildInputs = [pkgs.makeWrapper nodejs node_modules];

    configurePhase = ''
      cp --no-preserve=mode -r ${node_modules}/ node_modules
      chmod -R u+rw node_modules
    '';

    buildPhase = ''
      runHook preBuild
      # TODO: Tests doesn't work for now, leaving it commented for now
      # npm run test:unit
      runHook postBuild
    '';

    installPhase = ''
      mkdir -p $out
      cp -R {bin,contracts,lib,node_modules,package.json} $out

      chmod +x $out/bin/portal
      wrapProgram $out/bin/portal \
        --set NODE_ENV production \
        --set NODE_PATH "$out/node_modules"
    '';

    passthru = {inherit node_modules;};
  };
}
