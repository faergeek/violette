type inputs = { className : string option; variant : string option }

external [@mel.obj] inputs :
  ?className:string -> ?variant:string -> unit -> inputs = ""

type 'a t = inputs -> string
type ('a, 'b) config = { variants : 'a; defaultVariants : 'b }

external [@mel.module "class-variance-authority"] make :
  string -> ('a, 'b) config -> 'a t = "cva"
