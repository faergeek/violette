type[@unboxed] t = Item : 'a -> t

external [@mel.module "clsx"] [@mel.variadic] make : t array -> string
  = "default"
