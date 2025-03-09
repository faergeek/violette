let make () : State.artists =
  {
    albumIdsByArtistId = Js.Map.make ();
    artistInfoById = Js.Map.make ();
    byId = Js.Map.make ();
    listIds = None;
    similarArtistsById = Js.Map.make ();
    topSongIdsByArtistName = Js.Map.make ();
  }
