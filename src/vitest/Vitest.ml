type test = unit -> unit
type 'a expect

external [@mel.module "vitest"] describe : string -> test -> unit = "describe"
external [@mel.module "vitest"] test : string -> test -> unit = "test"
external [@mel.module "vitest"] expect : 'a -> 'a expect = "expect"
external [@mel.send] toBe : 'a expect -> 'a -> unit = "toBe"
external [@mel.send] toStrictEqual : 'a expect -> 'a -> unit = "toStrictEqual"
