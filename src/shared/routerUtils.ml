open Router.Route

let requireSubsonicCredentials { context = { store }; location; _ } =
  let state = store |. Zustand.getState in
  (match state.auth.credentials with
  | None ->
      Some
        Router.Redirect.(
          options ~replace:true
            ~search:[%mel.obj { next = location.pathname ^ location.searchStr }]
            ~_to:"/login" ()
          |> make)
  | Some _ -> None)
  |> Js.Promise.resolve
