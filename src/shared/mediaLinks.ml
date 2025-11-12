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
  let wrapper = (nav ~className:"flex flex-wrap gap-4" () [@JSX]) in
  if skeleton |> Option.value ~default:false then
    React.cloneElement wrapper
      [%mel.obj
        {
          children =
            Belt.Array.make 2 Js.null
            |. Belt.Array.mapWithIndex (fun i _x ->
                (div ~key:(Int.to_string i)
                   ~className:"inline-block space-x-2 whitespace-nowrap"
                   ~children:
                     [
                       (Skeleton.make
                          ~className:"inline-block size-6 align-middle" ()
                        [@JSX]);
                       (Skeleton.make
                          ~className:"inline-block size-6 align-middle" ()
                        [@JSX]);
                     ]
                   () [@JSX]));
        }]
  else if Js.Array.length links != 0 then
    React.cloneElement wrapper
      [%mel.obj
        {
          children =
            links
            |> Js.Array.map ~f:(fun link ->
                (a ~key:link.url
                   ~className:
                     "inline-flex items-center space-x-2 whitespace-nowrap"
                   ~href:link.url ~rel:"noopener" ~target:"_blank"
                   ~children:
                     [
                       (let style = [%mel.obj { color = link.color }] in
                        React.cloneElement link.icon
                          [%mel.obj
                            {
                              ariaHidden = true [@mel.as "aria-hidden"];
                              className = "inline-block";
                              style;
                            }]);
                       (span ~className:"align-middle"
                          ~children:(React.string link.label) () [@JSX]);
                     ]
                   () [@JSX]));
        }]
  else React.null
