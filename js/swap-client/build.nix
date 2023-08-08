{
  buildNpmPackage,
  nix-gitignore,
  python3,
}:
buildNpmPackage {
  pname = "swap-client";
  version = "0.0.0-dev";

  src = nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;

  npmDepsHash = "sha256-9+5X75rDDFzD49OIsh/rXJ346GrAdkMbmPZ2mGmFRhQ=";

  makeCacheWritable = true;

  # npmRebuildFlags = ["--ignore-scripts"];
  npmFlags = ["--legacy-peer-deps" "--omit=dev"];

  forceGitDeps = true;

  nativeBuildInputs = [
    python3
  ];
}
