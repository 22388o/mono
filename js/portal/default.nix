{
  buildNpmPackage,
  nix-gitignore,
}:
buildNpmPackage {
  pname = "portal";
  version = "0.0.0-dev";

  src = nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
  sourceRoot = "js/portal";

  npmDepsHash = "sha256-RxW4R2rv1qNUlanD1pMq5uvNZ0BByE5F5BEtxbTE3No=";

  makeCacheWritable = true;

  npmRebuildFlags = ["--ignore-scripts"];
  npmFlags = ["--legacy-peer-deps" "--omit=dev"];

  forceGitDeps = true;
  dontNpmBuild = true;
}
