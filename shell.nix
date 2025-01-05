let
  pkgs = import <nixpkgs> {};
in
  pkgs.stdenv.mkDerivation {
    name = "youtube-playlist-finder";
    buildInputs = with pkgs; [
      nodejs
    ];
  }
