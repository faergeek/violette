type property

external [@mel.module "fast-check"] assert_ : property -> unit = "assert"

type asyncProperty

external [@mel.module "fast-check"] asyncAssert :
  asyncProperty -> unit Js.Promise.t = "assert"

type 'a arbitrary

external [@mel.module "fast-check"] anything : unit -> 'a arbitrary = "anything"
external [@mel.module "fast-check"] double : unit -> float arbitrary = "double"
external [@mel.module "fast-check"] string : unit -> string arbitrary = "string"

external [@mel.module "fast-check"] asyncProperty1 :
  'a arbitrary -> ('a -> unit Js.Promise.t) -> asyncProperty = "asyncProperty"

external [@mel.module "fast-check"] property1 :
  'a arbitrary -> ('a -> unit) -> property = "property"
