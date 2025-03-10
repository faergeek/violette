module Make (Input : sig
  type input
  type output

  val ms : int
  val run : input -> output Js.promise
end) =
struct
  open Input

  let timeout = ref None

  let make arg =
    Js.Promise.make (fun ~resolve ~reject ->
        match !timeout with
        | Some _ -> ()
        | None ->
            timeout :=
              Some
                (Js.Global.setTimeout ms ~f:(fun () ->
                     timeout := None;
                     run arg
                     |> Js.Promise.then_ (fun value ->
                            resolve value [@u];
                            Js.Promise.resolve ())
                     |> Js.Promise.catch (fun error ->
                            reject (Js.Exn.anyToExnInternal error) [@u];
                            Js.Promise.resolve ())
                     |> ignore)))

  let now arg =
    !timeout |> Option.iter Js.Global.clearTimeout;
    timeout := None;
    run arg
end
