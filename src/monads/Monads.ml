module Result = struct
  type ('a, 'b) t
  type matchOptions = < > Js.t

  external [@mel.send] match_ : ('a, 'b) t -> matchOptions -> ('a, 'b) result
    = "match"

  external [@mel.set] set_ok : matchOptions -> ('a -> 'b) -> unit = "Ok"
  external [@mel.set] set_err : matchOptions -> ('a -> 'b) -> unit = "Err"

  let match_ r =
    let opts : matchOptions = Js.Obj.empty () in
    set_ok opts (fun value -> Ok value);
    set_err opts (fun error -> Error error);
    match_ r opts

  external [@mel.send] assertOk : ('a, 'b) t -> 'a = "assertOk"
end
