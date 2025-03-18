module Github = struct
  include Icon

  external [@mel.module "@icons-pack/react-simple-icons"] hex : string
    = "SiGithubHex"

  external [@mel.module "@icons-pack/react-simple-icons"] make : t = "SiGithub"
end

module Lastdotfm = struct
  include Icon

  external [@mel.module "@icons-pack/react-simple-icons"] hex : string
    = "SiLastdotfmHex"

  external [@mel.module "@icons-pack/react-simple-icons"] make : t
    = "SiLastdotfm"
end

module Musicbrainz = struct
  include Icon

  external [@mel.module "@icons-pack/react-simple-icons"] hex : string
    = "SiMusicbrainzHex"

  external [@mel.module "@icons-pack/react-simple-icons"] make : t
    = "SiMusicbrainz"
end
