open Fx
open Utils
include Types
module AlbumDetails = Response.AlbumDetails
module AlbumInfo = Response.AlbumInfo
module Artists = Response.Artists
module ArtistInfo = Response.ArtistInfo
module BaseAlbum = Response.BaseAlbum
module BaseArtist = Response.BaseArtist
module Credentials = Credentials
module DiscTitle = Response.DiscTitle
module SimilarArtist = Response.SimilarArtist
module Song = Response.Song

let buildSubsonicApiUrl = Utils.buildSubsonicApiUrl

let getCoverArtUrl ~credentials ~coverArt ~size =
  let open Webapi in
  let params = Js.Dict.empty () in
  Js.Dict.set params "id" (Value coverArt);
  Js.Dict.set params "size" (Value (Int.to_string size));
  buildSubsonicApiUrl credentials { _method = "rest/getCoverArt"; params }
  |> Url.href

let ping () =
  let open Monad_syntax in
  let* { response = { status = `ok } } =
    let open Response in
    let params = Js.Dict.empty () in
    makeRequest { _method = "rest/ping"; params } Ping.of_json
  in
  ok ()

let fetchArtists () =
  let open Monad_syntax in
  let* { response = { status = `ok; artists } } =
    let open Response in
    let params = Js.Dict.empty () in
    makeRequest { _method = "rest/getArtists"; params } Artists.of_json
  in
  ok artists

let getAlbum id =
  let open Monad_syntax in
  let* { response = { status = `ok; album } } =
    let open Response in
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    makeRequest { _method = "rest/getAlbum"; params } Album.of_json
  in
  ok album

let getAlbumInfo id =
  let open Monad_syntax in
  let* { response = { status = `ok; albumInfo } } =
    let open Response in
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    makeRequest { _method = "rest/getAlbumInfo2"; params } AlbumInfo.of_json
  in
  ok albumInfo

let getArtist id =
  let open Monad_syntax in
  let* { response = { status = `ok; artist } } =
    let open Response in
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    makeRequest { _method = "rest/getArtist"; params } Artist.of_json
  in
  ok artist

let getArtistInfo id ?count ?includeNotPresent () =
  let open Monad_syntax in
  let* { response = { status = `ok; artistInfo2 } } =
    let open Response in
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    count
    |> Option.iter (fun count ->
           Js.Dict.set params "count" (Value (Int.to_string count)));
    includeNotPresent
    |> Option.iter (fun includeNotPresent ->
           Js.Dict.set params "includeNotPresent"
             (Value (Bool.to_string includeNotPresent)));
    makeRequest { _method = "rest/getArtistInfo2"; params } ArtistInfo.of_json
  in
  ok artistInfo2

let getTopSongs artistName ?count () =
  let open Monad_syntax in
  let* { response = { status = `ok; topSongs = { song } } } =
    let open Response in
    let params = Js.Dict.empty () in
    Js.Dict.set params "artist" (Value artistName);
    count
    |> Option.iter (fun count ->
           Js.Dict.set params "count" (Value (Int.to_string count)));
    makeRequest { _method = "rest/getTopSongs"; params } TopSongs.of_json
  in
  ok song
