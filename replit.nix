{pkgs}: {
  deps = [
    pkgs.unzip
    pkgs.zip
    pkgs.git-lfs
    pkgs.jq
    pkgs.postgresql
    pkgs.openssl
  ];
}
