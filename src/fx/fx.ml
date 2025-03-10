type ('v, 'e, 'd) t =
  | Ok of 'v
  | Error of 'e
  | Sync of ('d -> ('v, 'e, 'd) t)
  | Async of ('d -> ('v, 'e, 'd) t Js.promise)

external [@mel.module "./fx"] [@mel.scope "Fx"] ok : 'v -> ('v, 'e, 'd) t = "Ok"

external [@mel.module "./fx"] [@mel.scope "Fx"] err : 'e -> ('v, 'e, 'd) t
  = "Err"

external [@mel.module "./fx"] [@mel.scope "Fx"] async :
  ('d -> ('v, 'e, 'd) t Js.Promise.t) -> ('v, 'e, 'd) t = "Async"

external [@mel.module "./fx"] [@mel.scope "Fx"] ask : unit -> ('r, 'e, 'r) t
  = "ask"

external [@mel.send] provide : ('v, 'e, 'r) t -> 'r -> ('v, 'e, 'a) t
  = "provide"

external [@mel.send] bind :
  ('v, 'e, 'd) t -> ('v -> ('b, 'e, 'd) t) -> ('b, 'e, 'd) t = "flatMap"

external [@mel.module "./fx"] [@mel.scope "Fx"] asyncAll2 :
  ('v1, 'e, 'd) t * ('v2, 'e, 'd) t -> ('v1 * 'v2, 'e, 'd) t = "asyncAll"

external [@mel.send] catch :
  ('v, 'e, 'd) t -> ('e -> ('v, 'f, 'd) t) -> ('v, 'f, 'd) t = "catch"

external [@mel.send] map : ('a, 'e, 'd) t -> ('a -> 'b) -> ('b, 'e, 'd) t
  = "map"

external [@mel.send] run : ('v, 'e, 'd) t -> deps:'d -> ('v, 'e) Monads.Result.t
  = "run"

external [@mel.send] runAsync :
  ('v, 'e, 'd) t -> deps:'d -> ('v, 'e) Monads.Result.t Js.Promise.t
  = "runAsync"

module Monad_syntax = struct
  let ( let* ) = bind
  let ( and* ) = fun a b -> asyncAll2 (a, b)
end
