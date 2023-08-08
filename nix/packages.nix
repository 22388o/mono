{
  perSystem = {
    pkgs,
    self',
    ...
  }: {
    packages.terraform-custom = pkgs.terraform.withPlugins (_: (with pkgs; [
      terraform-providers.aws
      terraform-providers.cloudflare
      terraform-providers.equinix
      terraform-providers.external
      terraform-providers.local
      terraform-providers.null
      terraform-providers.tls
    ]));

    overlayAttrs = self'.packages;
  };
}
