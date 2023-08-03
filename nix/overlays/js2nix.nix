self: super: {
  js2nix = self.callPackage (self.fetchFromGitHub {
    owner = "canva-public";
    repo = "js2nix";
    rev = "main";
    hash = "sha256-Bmv0ERVeb6vjYzy4MuCDgSiz9fSm/Bhg+Xk3AxPisBw=";
  }) {};
}
