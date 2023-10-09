{lib, ...}:
with lib; {
  imports = [
    ../../nixos/modules/default.nix
    ../../nixos/profiles/devtools.nix
    ../../nixos/profiles/playnet
    ../../nixos/profiles/users.nix
  ];

  # Fixes deadlock with network manager
  # see: https://github.com/NixOS/nixpkgs/issues/180175#issuecomment-1473408913
  # TODO: Review what to do with this
  systemd.services.NetworkManager-wait-online.enable = mkForce false;
  systemd.services.systemd-networkd-wait-online.enable = mkForce false;

  portal = {
    nodeFqdn = mkDefault "node.playnet.portaldefi.zone";
    rootSshKey = mkDefault "not-provided";
  };
}
