type lockScroll = bool -> unit

let use () =
  React.useCallback0 (fun lock ->
      let open Bro in
      if lock then body |. dataset |. Js.Dict.set "scrollLock" ""
      else body |. dataset |. (Js.Dict.unsafeDeleteKey "scrollLock" [@u]))
