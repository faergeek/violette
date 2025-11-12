open Shared

let[@react.component] make () =
  let saveSubsonicCredentials =
    Store.Context.useAppStore (fun state -> state.auth.saveSubsonicCredentials)
  and isLoginSubmitting, setIsLoginSubmitting = React.useState (Fun.const false)
  and loginResult, setLoginResult = React.useState (Fun.const (Ok ())) in
  let handleSubmit event =
    let open React.Event.Form in
    let open Webapi in
    event |. preventDefault;
    setIsLoginSubmitting (Fun.const true);
    let formData =
      event |. ReactExtra.Event.Form.currentTarget
      |> FormData.makeWithHtmlFormElement
    in
    let input name =
      let entry =
        formData |> FormData.get name |> Option.get
        |> FormData.EntryValue.classify
      in
      match entry with
      | `File _ -> Js.Exn.raiseError "Expected a string"
      | `String s -> s
    in
    let password = input "password"
    and serverBaseUrl = input "server-base-url"
    and username = input "username"
    and salt =
      Js.Typed_array.Uint8Array.fromLength 3
      |> Crypto.getRandomValues |> Js.Array.from
      |> Js.Array.map ~f:(fun b -> b |> Js.Int.toString ~radix:16)
      |> Js.Array.join ~sep:""
    in
    let token = SparkMd5.hash (password ^ salt) false in
    let credentials =
      Subsonic.Credentials.{ salt; serverBaseUrl; token; username }
    in
    let open Fx in
    Subsonic.Ping.make ()
    |. map (fun () -> saveSubsonicCredentials credentials)
    |. runAsync ~deps:{ credentials = Some credentials }
    |> Js.Promise.then_ (fun result ->
        let res = result in
        setLoginResult (Fun.const res);
        setIsLoginSubmitting (Fun.const false);
        () |> Js.Promise.resolve)
    |> ignore
  in
  let credentials =
    Store.Context.useAppStore (fun state -> state.auth.credentials)
  in
  (div ~className:"flex min-h-lvh flex-col"
     ~children:
       [
         (main ~className:"mx-auto w-full max-w-96 flex-1 pt-4"
            ~children:
              [
                (form ~ariaDescribedby:"login-form-description"
                   ~ariaLabelledby:"login-form-heading"
                   ~className:"space-y-4 px-4" ~onSubmit:handleSubmit
                   ~children:
                     [
                       (div ~className:"flex flex-col space-y-1.5"
                          ~children:
                            [
                              (div
                                 ~className:
                                   "mb-3 flex items-center justify-center gap-2"
                                 ~children:
                                   [
                                     (Logo.make ~className:"size-5" () [@JSX]);
                                     (strong ~ariaHidden:true
                                        ~children:(React.string "Violette") ()
                                      [@JSX]);
                                   ]
                                 () [@JSX]);
                              (div ~className:"text-sm text-muted-foreground"
                                 ~id:"login-form-description"
                                 ~children:
                                   [
                                     React.string
                                       "Enter your server details or ";
                                     (button
                                        ~className:
                                          "text-foreground hover:text-primary"
                                        ~type_:"button"
                                        ~onClick:
                                          (let open React.Event.Mouse in
                                           let open Webapi.Dom in
                                           fun event ->
                                             let form : Dom.htmlFormElement =
                                               (currentTarget event)##form
                                             in
                                             let input name =
                                               form |. Form.elements
                                               |> HtmlCollection.namedItem name
                                               |. Option.bind
                                                    HtmlInputElement.ofElement
                                               |> Option.get
                                             in
                                             input "server-base-url"
                                             |. HtmlInputElement.setValue
                                                  "https://demo.navidrome.org";
                                             input "username"
                                             |. HtmlInputElement.setValue "demo";
                                             input "password"
                                             |. HtmlInputElement.setValue "demo";
                                             form |. Form.requestSubmit)
                                        ~children:(React.string "try a demo")
                                        () [@JSX]);
                                   ]
                                 () [@JSX]);
                            ]
                          () [@JSX]);
                       (div ~className:"space-y-3"
                          ~children:
                            [
                              (div
                                 ~children:
                                   [
                                     (Label.make ~className:"pb-1"
                                        ~htmlFor:"login-server-base-url"
                                        ~children:[ React.string "URL:" ]
                                        () [@JSX]);
                                     (Input.make ~autoFocus:true
                                        ~defaultValue:
                                          (credentials
                                          |> Option.map (fun x ->
                                              let open Subsonic.Credentials in
                                              x.serverBaseUrl)
                                          |> Option.value ~default:"")
                                        ~disabled:isLoginSubmitting
                                        ~id:"login-server-base-url"
                                        ~name:"server-base-url" ~required:true
                                        ~type_:"url" () [@JSX]);
                                   ]
                                 () [@JSX]);
                              (div
                                 ~children:
                                   [
                                     (Label.make ~className:"pb-1"
                                        ~htmlFor:"login-username"
                                        ~children:[ React.string "Username:" ]
                                        () [@JSX]);
                                     (Input.make ~autoComplete:"username"
                                        ~defaultValue:
                                          (credentials
                                          |> Option.map (fun x ->
                                              let open Subsonic.Credentials in
                                              x.username)
                                          |> Option.value ~default:"")
                                        ~disabled:isLoginSubmitting
                                        ~id:"login-username" ~name:"username"
                                        ~required:true () [@JSX]);
                                   ]
                                 () [@JSX]);
                              (div
                                 ~children:
                                   [
                                     (Label.make ~className:"pb-1"
                                        ~htmlFor:"login-password"
                                        ~children:[ React.string "Password:" ]
                                        () [@JSX]);
                                     (Input.make
                                        ~autoComplete:"current-password"
                                        ~disabled:isLoginSubmitting
                                        ~id:"login-password" ~name:"password"
                                        ~required:true ~type_:"password" ()
                                      [@JSX]);
                                   ]
                                 () [@JSX]);
                            ]
                          () [@JSX]);
                       (div ~className:"space-y-2"
                          ~children:
                            [
                              (Button.make ~className:"w-full"
                                 ~disabled:isLoginSubmitting
                                 ~loading:isLoginSubmitting ~type_:"submit"
                                 ~children:
                                   [
                                     (LucideReact.KeyRound.make ~ariaHidden:true
                                        () [@JSX]);
                                     "Login" |> React.string;
                                   ]
                                 () [@JSX]);
                              (let message =
                                 match loginResult with
                                 | Ok () -> None
                                 | Error (ApiError error) -> Some error.message
                                 | Error (RequestFailed error) ->
                                     Some
                                       ((error.status |> Int.to_string)
                                       ^ ": " ^ error.statusText)
                                 | Error NetworkError ->
                                     Some
                                       "Network error occurred. Please check \
                                        your network connection"
                                 | Error _ -> Some "Unexpected API response"
                               in
                               match message with
                               | None -> React.null
                               | Some message ->
                                   p ~className:"text-destructive" ~role:"alert"
                                     ~children:[ React.string message ]
                                     () [@JSX]);
                            ]
                          () [@JSX]);
                     ]
                   () [@JSX]);
              ]
            () [@JSX]);
         (Footer.make () [@JSX]);
       ]
     () [@JSX])
