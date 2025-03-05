open Fx
open Monad_syntax
open MergeIntoMap
open Subsonic
open Zustand

let make () =
  let* Deps.{ store } = ask () in
  let* { index } =
    let state = getState store in
    fetchArtists () |. provide { credentials = state.auth.credentials }
  in
  let artists =
    index
    |. Js.Array.reduce ~init:[||] ~f:(fun acc entry ->
           acc |> Js.Array.pushMany ~values:Artists.(entry.artist) |> ignore;
           acc)
  in
  let state = getState store in
  let byId = mergeIntoMap state.artists.byId artists (fun x -> x.id) in
  let listIds =
    Some (artists |> Js.Array.map ~f:(fun artist -> BaseArtist.(artist.id)))
  in
  if byId != state.artists.byId || not (deepEqual listIds state.artists.listIds)
  then
    store
    |. setState (fun prevState ->
           { prevState with artists = { prevState.artists with byId; listIds } });
  ok ()
