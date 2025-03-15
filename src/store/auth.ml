open State

let make set =
  let open Dom.Storage in
  let credentials_local_storage_key = "subsonic-credentials" in
  let clearSubsonicCredentials () =
    set
      (fun prevState ->
        { prevState with auth = { prevState.auth with credentials = None } })
      false;
    localStorage |> removeItem credentials_local_storage_key
  and saveSubsonicCredentials credentials =
    set
      (fun prevState ->
        {
          prevState with
          auth = { prevState.auth with credentials = Some credentials };
        })
      false;
    localStorage
    |> setItem credentials_local_storage_key
         (Js.Json.stringifyAny credentials |> Option.get)
  and credentials =
    localStorage
    |> getItem credentials_local_storage_key
    |> Option.map (Fun.compose Subsonic.Credentials.of_json Json.parseOrRaise)
  in
  { clearSubsonicCredentials; credentials; saveSubsonicCredentials }
