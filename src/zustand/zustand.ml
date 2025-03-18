type 'a t
type 'a stateSetter = ('a -> 'a) -> bool -> unit
type 'a stateGetter = unit -> 'a
type ('a, 'b) stateCreator = 'a stateSetter -> 'a stateGetter -> 'a t -> 'b

external [@mel.module "zustand"] make : unit -> ('a, 'a) stateCreator -> 'a t
  = "createStore"

type ('a, 'b) selector = 'a -> 'b

external [@mel.module "zustand"] useStore : 'a t -> ('a, 'b) selector -> 'b
  = "useStore"

external [@mel.module "zustand/react/shallow"] useShallow :
  ('a -> 'b) -> ('a, 'b) selector = "useShallow"

external [@mel.send] getState : 'a t -> 'a = "getState"
external [@mel.send] setState : 'a t -> ('a -> 'a) -> unit = "setState"

external [@mel.send] subscribe : 'a t -> ('a -> 'a -> unit) -> unit
  = "subscribe"
