type test = unit -> unit
type testAsync = unit -> unit Js.Promise.t
type 'a expect

external [@mel.module "vitest"] describe : string -> test -> unit = "describe"
external [@mel.module "vitest"] test : string -> test -> unit = "test"
external [@mel.module "vitest"] testAsync : string -> testAsync -> unit = "test"
external [@mel.module "vitest"] expect : 'a -> 'a expect = "expect"
external [@mel.get] not : 'a expect -> 'a expect = "not"
external [@mel.send] toBe : 'a expect -> 'a -> unit = "toBe"
external [@mel.send] toBeCalled : 'a expect -> unit = "toBeCalled"
external [@mel.send] toStrictEqual : 'a expect -> 'a -> unit = "toStrictEqual"

type ('a, 'b) mockFn1 = 'a -> 'b

external [@mel.module "vitest"] [@mel.scope "vi"] fn1 : unit -> ('a, 'b) mockFn1
  = "fn"

external [@mel.module "vitest"] [@mel.scope "expect"] unreachable : unit -> unit
  = "unreachable"
