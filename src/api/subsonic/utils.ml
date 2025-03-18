open Credentials

type param = Array of string array | Value of string
type request = { _method : string; params : param Js.Dict.t }

let buildSubsonicApiUrl { salt; serverBaseUrl; token; username } request =
  let open Webapi in
  let url = Url.makeWith request._method ~base:serverBaseUrl in
  let searchParams = Url.searchParams url in
  let () =
    let open Url.URLSearchParams in
    searchParams |> set "c" "Violette";
    searchParams |> set "f" "json";
    searchParams |> set "s" salt;
    searchParams |> set "t" token;
    searchParams |> set "u" username;
    searchParams |> set "v" "1.8.0"
  in
  Js.Dict.entries request.params
  |. Js.Array.forEach ~f:(fun (k, v) ->
         let open Url.URLSearchParams in
         v |> function
         | Array a -> Js.Array.forEach a ~f:(fun v -> append k v searchParams)
         | Value v -> set k v searchParams);
  url

external fetchWithUrl : Webapi.Url.t -> Fetch.response Js.Promise.t = "fetch"

let fetchWithUrlFx url =
  let open Fx in
  Async
    (fun _ ->
      let open Js.Promise in
      fetchWithUrl url
      |> then_ (fun response -> Ok response |> resolve)
      |> catch (fun _ -> Error Error.NetworkError |> resolve))

let validateResponseJson of_json response =
  let open Fx in
  Async
    (fun _ ->
      let open Js.Promise in
      response |> Fetch.Response.json
      |> then_ (fun json ->
             (try
                json
                |> Json.Decode.oneOf
                     [
                       (fun json -> Ok (json |> of_json));
                       (fun json ->
                         let Response.{ response } = json |> Failed.of_json in
                         let ApiError.{ code; message } = response.error in
                         Error (Error.ApiError { code; message }));
                     ]
              with issues -> Error (Error.ValidationFailed { issues }))
             |> resolve))

let getContentType response =
  let open Fetch in
  response |> Response.headers |> Headers.get "content-type"
  |> Option.map (Js.String.split ~sep:";")
  |. Option.bind Js.Array.shift

let makeRequest request of_json =
  let open Fx in
  let open Monad_syntax in
  let* Deps.{ credentials } = ask () in
  let* response =
    match credentials with
    | None -> Error Error.NoCredentials
    | Some credentials ->
        request |> buildSubsonicApiUrl credentials |> fetchWithUrlFx
  in
  let* response =
    if Fetch.Response.ok response then Ok response
    else
      Error
        Fetch.Response.(
          Error.RequestFailed
            { status = response |. status; statusText = response |. statusText })
  in
  match getContentType response with
  | Some "application/json" -> response |> validateResponseJson of_json
  | actual -> Error (Error.NonJsonContentType { actual })
