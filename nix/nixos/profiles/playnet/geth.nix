{
  pkgs,
  lib,
  ...
}:
with lib; let
  # TODO: Add nix-sops
  portal-wallet-seed = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";
  portal-wallet-password = "portal";
  portal-password-file = pkgs.writeText "portal-wallet-password" "${portal-wallet-password}";
in {
  services.geth.playnet = {
    enable = true;
    http.enable = true;
    websocket.enable = true;
    extraArgs = [
      "--dev"
      "--password=${portal-password-file}"
    ];
  };

  systemd.services.geth-playnet.serviceConfig = let
    dataDir = "/var/lib/goethereum/playnet/mainnet";
    keystoreDir = "${dataDir}/keystore";
  in {
    # TODO: Add nix-sops
    ExecStartPre = pkgs.writeShellScript "create-portal-wallet" ''
      ${getExe pkgs.ethw} \
        keystore create \
        --seed="${portal-wallet-seed}" \
        --password=${portal-wallet-password} \
        --keystore-path="${keystoreDir}" \
        --overwrite
    '';
  };
}
