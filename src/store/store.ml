type t = State.t Zustand.t

let make () =
  Zustand.make () (fun set _ _ : State.t ->
      {
        albums = Albums.make ();
        artists = Artists.make ();
        auth = Auth.make set;
        player = Player.make ();
        songs = Songs.make ();
      })

module Context = Context
module Player = Player
module State = State
