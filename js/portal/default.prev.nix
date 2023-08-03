{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  npmlock2nix ? pkgs.callPackage ../../nix/npmlock2nix {},
  nodejs ? pkgs.portaldefi.nodejs,
}: {
  npmlock2nix = {
    modules = npmlock2nix.node_modules {
      src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;
      srcDir = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
      localModulesMappings = {
        "node_modules/sdk" = "/sdk";
        "node_modules/portal" = "/portal";
      };
    };

    package = npmlock2nix.build {
      inherit nodejs;
      src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;
      srcDir = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;

      sourceRoot = "js/portal";
      buildCommands = [];
      node_modules_attrs.npmExtraArgs = ["--omit=dev"];
      installPhase = "cp -r . $out";
    };

    test = npmlock2nix.build {
      inherit nodejs;
      src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;
      buildCommands = ["HOME=./ npm run test:unit"];
      installPhase = "cp -r . $out";
    };
  };

  # TODO: still doesn't work on npm ci step
  nixpkgs = {
    package = pkgs.buildNpmPackage {
      pname = "portal";
      version = "0.0.0-dev";

      __noChroot = true;

      src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
      sourceRoot = "js/portal";

      npmDepsHash = "sha256-RxW4R2rv1qNUlanD1pMq5uvNZ0BByE5F5BEtxbTE3No=";

      makeCacheWritable = true;

      npmRebuildFlags = ["--ignore-scripts"];
      npmFlags = ["--legacy-peer-deps" "--omit=dev"];

      forceGitDeps = true;
      dontNpmBuild = true;
    };

    deps = pkgs.fetchNpmDeps {
      name = "portal-npm-deps";
      src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
      sourceRoot = "js/portal";
      forceGitDeps = true;
      hash = "sha256-RxW4R2rv1qNUlanD1pMq5uvNZ0BByE5F5BEtxbTE3No=";
    };
  };
}
