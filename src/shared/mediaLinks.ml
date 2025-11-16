external%private [@mel.module "./mediaLinks.module.css"] css :
  < root : string ; item : string > Js.t = "default"

type link = {
  color : string;
  icon : React.element;
  label : string;
  url : string;
}

let[@react.component] make ?lastFmUrl ?musicBrainzUrl ?skeleton =
  let links = [||] in
  lastFmUrl
  |> Option.iter (fun lastFmUrl ->
      links
      |> Js.Array.push
           ~value:
             {
               color = SimpleIcons.Lastdotfm.hex;
               icon = SimpleIcons.Lastdotfm.make () [@JSX];
               label = "Last.fm";
               url = lastFmUrl;
             }
      |> ignore);
  musicBrainzUrl
  |> Option.iter (fun musicBrainzUrl ->
      links
      |> Js.Array.push
           ~value:
             {
               color = SimpleIcons.Musicbrainz.hex;
               icon = SimpleIcons.Musicbrainz.make () [@JSX];
               label = "MusicBrainz";
               url = musicBrainzUrl;
             }
      |> ignore);
  if skeleton |> Option.value ~default:false then React.null
  else if Js.Array.length links != 0 then
    nav ~className:css##root
      ~children:
        (links
        |> Js.Array.map ~f:(fun link ->
            (a ~key:link.url ~className:css##item ~href:link.url ~rel:"noopener"
               ~target:"_blank"
               ~children:
                 [
                   React.cloneElement link.icon
                     [%mel.obj
                       {
                         ariaHidden = true [@mel.as "aria-hidden"];
                         style = [%mel.obj { color = link.color }];
                       }];
                   (span ~children:(React.string link.label) () [@JSX]);
                 ]
               () [@JSX]))
        |> React.array)
      () [@JSX]
  else React.null
