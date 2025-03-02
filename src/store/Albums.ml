let make () : State.albums =
  {
    baseById = Js.Map.make ();
    detailsById = Js.Map.make ();
    infoById = Js.Map.make ();
    songIdsById = Js.Map.make ();
  }
