external%private [@mel.module "./artistPage.module.css"] css :
  < root : string
  ; artistInfo : string
  ; tag : string
  ; starButton : string
  ; subtitle : string
  ; tabsList : string
  ; tabsList_sticky : string
  ; mainTab : string
  ; mainTabSectionHeading : string
  ; similarArtistsTab : string
  ; similarArtistsTabNotPresent : string
  ; similarArtistsTabNotPresentList : string
  ; similarArtistsTabNotPresentItem : string >
  Js.t = "default"

open Router
open Shared

type params = { artistId : string }

module TopSongsSection = struct
  let[@react.component] make ~children ~params =
    section
      ~children:
        [
          (H2.make ~className:css##mainTabSectionHeading
             ~children:
               (Router.Link.make ~hash:"top-songs"
                  ~hashScrollIntoView:{ behavior = `instant; block = `start }
                  ~params:[%mel.obj { artistId = params.artistId }]
                  ~resetScroll:false ~_to:"/artist/$artistId"
                  ~children:(React.string "Top songs") () [@JSX])
             () [@JSX]);
          children;
        ]
      () [@JSX]
end

module SimilarArtistsSection = struct
  let[@react.component] make ~artistId ?presentArtists =
    section
      ~children:
        [
          (H2.make ~className:css##mainTabSectionHeading
             ~children:
               (Router.Link.make ~hash:"similar-artists"
                  ~hashScrollIntoView:{ block = `start; behavior = `instant }
                  ~params:[%mel.obj { artistId }] ~resetScroll:false
                  ~_to:"/artist/$artistId"
                  ~children:(React.string "Similar artists")
                  () [@JSX])
             () [@JSX]);
          (CardGrid.make
             ~children:
               (match presentArtists with
               | Some presentArtists ->
                   presentArtists
                   |> Js.Array.slice ~start:0 ~end_:6
                   |> Js.Array.map ~f:(fun id ->
                       (ArtistCard.make ~key:(Js.String.make id)
                          ~coverArtSizes:CardGrid.card_grid_cover_art_sizes ~id
                          ~loadCoverArtLazily:true () [@JSX]))
                   |> React.array
               | None ->
                   Belt.Array.make 6 None
                   |. Belt.Array.mapWithIndex (fun i _ ->
                       (ArtistCard.make ~key:(Js.String.make i) () [@JSX]))
                   |> React.array)
             () [@JSX]);
        ]
      () [@JSX]
end

let[@react.component] make ?deferredArtistInfo ?deferredSimilarArtists
    ?deferredTopSongIds ?initialAlbumIds ?initialArtist ~params =
  let tabValue =
    let open Router.State in
    options ~select:(fun state ->
        if state.location.hash == "" then "main" else state.location.hash)
    |> use
  in
  let artist =
    Store.Context.useAppStore (fun state ->
        state.artists.byId
        |. Js.Map.get ~key:params.artistId
        |> Option.map Option.some
        |> Option.value ~default:initialArtist)
  in
  let renderArtistInfo
      ?(fallback = (React.Fragment.make ~children:React.null () [@JSX]))
      children =
    (Store.Context.Consumer.make
       ~selector:(fun state ->
         let open Store.State in
         state.artists.artistInfoById |. Js.Map.get ~key:params.artistId)
       ~children:(fun artistInfo ->
         match artistInfo with
         | Some artistInfo -> children artistInfo
         | None -> (
             match deferredArtistInfo with
             | Some deferredArtistInfo ->
                 Await.make ~fallback ~promise:deferredArtistInfo ~children ()
                 [@JSX]
             | None -> fallback))
       () [@JSX])
  in
  let renderSimilarArtists
      ?(fallback = (React.Fragment.make ~children:React.null () [@JSX]))
      children =
    (Store.Context.Consumer.make
       ~selector:(fun state ->
         let open Store.State in
         state.artists.similarArtistsById |. Js.Map.get ~key:params.artistId)
       ~children:(fun similarArtists ->
         match similarArtists with
         | Some similarArtists -> children similarArtists
         | None -> (
             match deferredSimilarArtists with
             | Some deferredSimilarArtists ->
                 Await.make ~fallback ~promise:deferredSimilarArtists ~children
                   () [@JSX]
             | None -> fallback))
       () [@JSX])
  in
  let renderTopSongs
      ?(fallback = (React.Fragment.make ~children:React.null () [@JSX]))
      children =
    (Store.Context.Consumer.make
       ~selector:(fun state ->
         let open Store.State in
         artist
         |. Option.bind (fun artist ->
             state.artists.topSongIdsByArtistName |. Js.Map.get ~key:artist.name))
       ~children:(fun topSongIds ->
         match (artist, topSongIds) with
         | Some artist, Some topSongIds -> children ~artist ~topSongIds
         | None, _ | _, None -> (
             match (artist, deferredTopSongIds) with
             | Some artist, Some deferredTopSongIds ->
                 Await.make ~fallback ~promise:deferredTopSongIds
                   ~children:(fun topSongIds -> children ~artist ~topSongIds)
                   () [@JSX]
             | None, _ | _, None -> fallback))
       () [@JSX])
  in
  let albumIds =
    Store.Context.useAppStore (fun state ->
        state.artists.albumIdsByArtistId
        |. Js.Map.get ~key:params.artistId
        |> Option.map Option.some
        |> Option.value ~default:initialAlbumIds)
  in
  (Container.make ~className:css##root
     ~children:
       [
         (MediaHeader.make
            ~coverArt:
              (artist |> Option.map (fun x -> Subsonic.BaseArtist.(x.coverArt)))
            ~links:
              (renderArtistInfo
                 (fun artistInfo ->
                   (MediaLinks.make ?lastFmUrl:artistInfo.lastFmUrl
                      ?musicBrainzUrl:
                        (artistInfo.musicBrainzId
                        |> Option.map (fun musicBrainzId ->
                            {j|https://musicbrainz.org/artist/$musicBrainzId|j})
                        )
                      () [@JSX]))
                 ~fallback:(MediaLinks.make ~skeleton:true () [@JSX]))
            ~children:
              (div ~className:css##artistInfo
                 ~children:
                   [
                     (div
                        ~children:
                          [
                            (div ~className:css##tag
                               ~children:(React.string "Artist") () [@JSX]);
                            (match artist with
                            | Some artist ->
                                H1.make
                                  ~children:
                                    [
                                      (Link.make
                                         ~params:
                                           [%mel.obj
                                             { artistId = params.artistId }]
                                         ~_to:"/artist/$artistId"
                                         ~children:(React.string artist.name) ()
                                       [@JSX]);
                                      (StarButton.make ~artistId:artist.id
                                         ~className:css##starButton
                                         ?starred:artist.starred () [@JSX]);
                                    ]
                                  () [@JSX]
                            | None ->
                                H1.make
                                  ~children:
                                    (Skeleton.make
                                       ~style:
                                         (ReactDOM.Style.make ~width:"16rem" ())
                                       () [@JSX])
                                  () [@JSX]);
                            (div ~className:css##subtitle
                               ~children:
                                 (match artist with
                                 | Some artist ->
                                     Link.make ~hash:"albums"
                                       ~hashScrollIntoView:
                                         { block = `start; behavior = `instant }
                                       ~params:
                                         [%mel.obj
                                           { artistId = params.artistId }]
                                       ~_to:"/artist/$artistId"
                                       ~children:
                                         [
                                           React.int artist.albumCount;
                                           React.string " albums";
                                         ]
                                       () [@JSX]
                                 | None ->
                                     Skeleton.make
                                       ~style:
                                         (ReactDOM.Style.make ~width:"5rem" ())
                                       () [@JSX])
                               () [@JSX]);
                          ]
                        () [@JSX]);
                     renderArtistInfo ~fallback:(Prose.make () [@JSX])
                       (fun details ->
                         details.biography
                         |> Option.map (fun html ->
                             (Prose.make ~html () [@JSX]))
                         |> Option.value ~default:React.null);
                   ]
                 () [@JSX])
            () [@JSX]);
         (Tabs.Root.make ~value:tabValue
            ~children:
              [
                (Tabs.List.make
                   ~className:
                     (Clsx.make
                        [|
                          Item css##tabsList;
                          Item
                            (if tabValue != "main" then
                               Some css##tabsList_sticky
                             else None);
                        |])
                   ~children:
                     [
                       (Tabs.Trigger.make ~value:"main"
                          ~children:
                            (Link.make ~hash:"main"
                               ~hashScrollIntoView:
                                 { behavior = `instant; block = `nearest }
                               ~params:[%mel.obj { artistId = params.artistId }]
                               ~resetScroll:false ~_to:"/artist/$artistId"
                               ~children:(React.string "Main") () [@JSX])
                          () [@JSX]);
                       (Tabs.Trigger.make ~value:"top-songs"
                          ~children:
                            (Link.make ~hash:"top-songs"
                               ~hashScrollIntoView:
                                 { behavior = `instant; block = `nearest }
                               ~params:[%mel.obj { artistId = params.artistId }]
                               ~resetScroll:false ~_to:"/artist/$artistId"
                               ~children:(React.string "Top songs") () [@JSX])
                          () [@JSX]);
                       (Tabs.Trigger.make ~value:"albums"
                          ~children:
                            (Link.make ~hash:"albums"
                               ~hashScrollIntoView:
                                 { behavior = `instant; block = `nearest }
                               ~params:[%mel.obj { artistId = params.artistId }]
                               ~resetScroll:false ~_to:"/artist/$artistId"
                               ~children:(React.string "Albums") () [@JSX])
                          () [@JSX]);
                       (Tabs.Trigger.make ~value:"similar-artists"
                          ~children:
                            (Link.make ~hash:"similar-artists"
                               ~hashScrollIntoView:
                                 { behavior = `instant; block = `nearest }
                               ~params:[%mel.obj { artistId = params.artistId }]
                               ~resetScroll:false ~_to:"/artist/$artistId"
                               ~children:(React.string "Similar artists")
                               () [@JSX])
                          () [@JSX]);
                     ]
                   () [@JSX]);
                (Tabs.Content.make ~className:css##mainTab ~id:"main"
                   ~value:"main"
                   ~children:
                     [
                       renderTopSongs
                         ~fallback:
                           (TopSongsSection.make ~params
                              ~children:(SongList.make () [@JSX]) () [@JSX])
                         (fun ~artist ~topSongIds ->
                           if Js.Array.length topSongIds != 0 then
                             TopSongsSection.make ~params
                               ~children:
                                 (SongList.make
                                    ~getSongElementId:Album.getSongElementId
                                    ~primaryArtist:artist.name
                                    ~songIds:
                                      (topSongIds
                                      |> Js.Array.slice ~start:0 ~end_:5)
                                    ~songIdsToPlay:(Some topSongIds) () [@JSX])
                               () [@JSX]
                           else React.null);
                       (section
                          ~children:
                            [
                              (H2.make ~className:css##mainTabSectionHeading
                                 ~children:
                                   (Link.make ~hash:"albums"
                                      ~hashScrollIntoView:
                                        { behavior = `instant; block = `start }
                                      ~params:
                                        [%mel.obj
                                          { artistId = params.artistId }]
                                      ~resetScroll:false
                                      ~_to:"/artist/$artistId"
                                      ~children:(React.string "Albums") ()
                                    [@JSX])
                                 () [@JSX]);
                              (CardGrid.make
                                 ~children:
                                   (let cards =
                                      match albumIds with
                                      | Some albumIds ->
                                          albumIds |> Belt.Array.reverse
                                          |> Js.Array.slice ~start:0 ~end_:6
                                          |> Js.Array.map ~f:(fun id ->
                                              (AlbumCard.make ~key:id
                                                 ~coverArtSizes:
                                                   CardGrid
                                                   .card_grid_cover_art_sizes
                                                 ~id ~loadCoverArtLazily:true ()
                                               [@JSX]))
                                      | None ->
                                          Belt.Array.make 6 None
                                          |. Belt.Array.mapWithIndex (fun i _ ->
                                              (AlbumCard.make
                                                 ~key:(Int.to_string i) ()
                                               [@JSX]))
                                    in
                                    React.array cards)
                                 () [@JSX]);
                            ]
                          () [@JSX]);
                       renderSimilarArtists
                         ~fallback:
                           (SimilarArtistsSection.make ~artistId:params.artistId
                              () [@JSX]) (fun similarArtists ->
                           let presentArtists =
                             similarArtists |> Array.to_list
                             |> List.filter_map (function
                               | Subsonic.SimilarArtist.Artist artist ->
                                   Some artist.id
                               | BasicInfo _ -> None)
                             |> Array.of_list
                           in
                           if Js.Array.length presentArtists != 0 then
                             SimilarArtistsSection.make
                               ~artistId:params.artistId ~presentArtists ()
                             [@JSX]
                           else React.null);
                     ]
                   () [@JSX]);
                (Tabs.Content.make ~id:"top-songs" ~value:"top-songs"
                   ~children:
                     (renderTopSongs ~fallback:(SongList.make () [@JSX])
                        (fun ~artist ~topSongIds ->
                          if Js.Array.length topSongIds == 0 then
                            EmptyState.make ~message:"No top songs" () [@JSX]
                          else
                            SongList.make
                              ~getSongElementId:Album.getSongElementId
                              ~primaryArtist:artist.name ~songIds:topSongIds ()
                            [@JSX]))
                   () [@JSX]);
                (Tabs.Content.make ~id:"albums" ~value:"albums"
                   ~children:
                     (CardGrid.make
                        ~children:
                          (React.array
                             (match albumIds with
                             | Some albumIds ->
                                 albumIds |> Belt.Array.reverse
                                 |> Js.Array.map ~f:(fun id ->
                                     (AlbumCard.make ~key:id
                                        ~coverArtSizes:
                                          CardGrid.card_grid_cover_art_sizes ~id
                                        ~loadCoverArtLazily:true () [@JSX]))
                             | None ->
                                 Belt.Array.make 12 None
                                 |. Belt.Array.mapWithIndex (fun i _ ->
                                     (AlbumCard.make ~key:(Int.to_string i) ()
                                      [@JSX]))))
                        () [@JSX])
                   () [@JSX]);
                (Tabs.Content.make ~id:"similar-artists"
                   ~value:"similar-artists"
                   ~children:
                     (renderSimilarArtists
                        ~fallback:
                          (CardGrid.make
                             ~children:
                               (Belt.Array.make 12 None
                               |. Belt.Array.mapWithIndex (fun i _ ->
                                   (ArtistCard.make ~key:(Int.to_string i) ()
                                    [@JSX]))
                               |> React.array)
                             () [@JSX])
                        (fun similarArtists ->
                          if Js.Array.length similarArtists == 0 then
                            EmptyState.make ~message:"No similar artists" ()
                            [@JSX]
                          else
                            div ~className:css##similarArtistsTab
                              ~children:
                                [
                                  (let presentArtists =
                                     similarArtists |> Array.to_list
                                     |> List.filter_map (function
                                       | Subsonic.SimilarArtist.BasicInfo _ ->
                                           None
                                       | Artist artist -> Some artist.id)
                                     |> Array.of_list
                                   in
                                   if Js.Array.length presentArtists == 0 then
                                     React.null
                                   else
                                     CardGrid.make
                                       ~children:
                                         (presentArtists
                                         |> Js.Array.map ~f:(fun id ->
                                             (ArtistCard.make ~key:id
                                                ~coverArtSizes:
                                                  CardGrid
                                                  .card_grid_cover_art_sizes ~id
                                                ~loadCoverArtLazily:true ()
                                              [@JSX]))
                                         |> React.array)
                                       () [@JSX]);
                                  (let notPresentArtists =
                                     similarArtists |> Array.to_list
                                     |> List.filter_map (function
                                       | Subsonic.SimilarArtist.BasicInfo info
                                         ->
                                           Some info.name
                                       | Artist _ -> None)
                                     |> Array.of_list
                                   in
                                   if Js.Array.length notPresentArtists == 0
                                   then React.null
                                   else
                                     div
                                       ~className:
                                         css##similarArtistsTabNotPresent
                                       ~children:
                                         [
                                           (H2.make
                                              ~children:
                                                (React.string
                                                   "Not found in a library:")
                                              () [@JSX]);
                                           (ul
                                              ~className:
                                                css##similarArtistsTabNotPresentList
                                              ~children:
                                                (notPresentArtists
                                                |> Js.Array.map
                                                     ~f:(fun similarArtist ->
                                                       (li ~key:similarArtist
                                                          ~className:
                                                            css##similarArtistsTabNotPresentItem
                                                          ~children:
                                                            (a
                                                               ~href:
                                                                 ("https://www.last.fm/music/"
                                                                 ^ Js.Global
                                                                   .encodeURIComponent
                                                                     similarArtist
                                                                 )
                                                               ~rel:"noopener"
                                                               ~target:"_blank"
                                                               ~children:
                                                                 (React.string
                                                                    similarArtist)
                                                               () [@JSX])
                                                          () [@JSX]))
                                                |> React.array)
                                              () [@JSX]);
                                         ]
                                       () [@JSX]);
                                ]
                              () [@JSX]))
                   () [@JSX]);
              ]
            () [@JSX]);
       ]
     () [@JSX])
