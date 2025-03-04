type t

external [@mel.module "@tanstack/react-router"] getRouteApi : string -> t
  = "getRouteApi"

external [@mel.send] useLoaderData : t -> 'a = "useLoaderData"
external [@mel.send] useParams : t -> 'a = "useParams"
