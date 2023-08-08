{
  buildNpmPackage,
  nix-gitignore,
}:
buildNpmPackage {
  pname = "sdk";
  version = "0.0.0-dev";

  src =
    nix-gitignore.gitignoreSourcePure [
      ../../.gitignore
      ./.gitignore
    ]
    ./..;
  sourceRoot = "js/sdk";

  npmDepsHash = "sha256-1n7Lr+xjlxz1Ac505SIECT2lrPoXbXY1mbD6MUFyfb0=";

  makeCacheWritable = true;

  npmFlags = ["--legacy-peer-deps" "--omit=dev"];

  NODE_OPTIONS = "--openssl-legacy-provider";

  dontNpmBuild = true;

  forceGitDeps = true;
}
