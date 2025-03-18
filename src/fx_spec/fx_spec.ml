open FastCheck
open Fx
open Vitest

let () =
  test "Ok" (fun () ->
      (fun input ->
        match Ok input |. run ~deps:() with
        | Error _ -> unreachable ()
        | Ok value -> expect value |. toBe input)
      |> property1 (anything ())
      |> assert_);

  test "Error" (fun () ->
      (fun input ->
        match Error input |. run ~deps:() with
        | Error error -> expect error |. toBe input
        | Ok _ -> unreachable ())
      |> property1 (anything ())
      |> assert_);

  testAsync "async" (fun () ->
      let open Promise.Monad_syntax in
      let* () =
        (fun input ->
          let* result =
            Async (fun n -> Ok n |> Js.Promise.resolve) |. runAsync ~deps:input
          in
          (match result with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe input);
          Js.Promise.resolve ())
        |> asyncProperty1 (anything ())
        |> asyncAssert
      in
      let* () =
        (fun input ->
          let* result =
            Async (fun n -> Error n |> Js.Promise.resolve)
            |. runAsync ~deps:input
          in
          (match result with
          | Error error -> expect error |. toBe input
          | Ok _ -> unreachable ());
          Js.Promise.resolve ())
        |> asyncProperty1 (anything ())
        |> asyncAssert
      in
      Js.Promise.resolve ());

  testAsync "bind" (fun () ->
      let open Promise.Monad_syntax in
      let () =
        (fun input ->
          match
            Ok input
            |. bind (fun n -> Ok (n |> Js.Float.toString))
            |. run ~deps:()
          with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (Js.String.make input))
        |> property1 (double ())
        |> assert_
      in
      let () =
        (fun input ->
          let f = fn1 () in
          (match Error input |. bind f |. run ~deps:() with
          | Error error -> expect error |. toBe input
          | Ok _ -> unreachable ());
          expect f |. not |. toBeCalled)
        |> property1 (string ())
        |> assert_
      in
      let* () =
        (fun input ->
          let* result =
            Async (fun () -> Ok input |> Js.Promise.resolve)
            |. bind (fun n -> Ok (n |> Js.Float.toString))
            |. runAsync ~deps:()
          in
          (match result with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (Js.String.make input));
          Js.Promise.resolve ())
        |> asyncProperty1 (double ())
        |> asyncAssert
      in
      let* () =
        (fun input ->
          let f = fn1 () in
          let* result =
            Async (fun () -> Error input |> Js.Promise.resolve)
            |. bind f |. runAsync ~deps:()
          in
          (match result with
          | Error error -> expect error |. toBe input
          | Ok _ -> unreachable ());
          expect f |. not |. toBeCalled;
          Js.Promise.resolve ())
        |> asyncProperty1 (string ())
        |> asyncAssert
      in
      Js.Promise.resolve ());

  testAsync "map" (fun () ->
      let open Promise.Monad_syntax in
      let () =
        (fun input ->
          match
            Ok input |. map (fun n -> n |> Js.String.make) |. run ~deps:()
          with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (input |. Js.Float.toString))
        |> property1 (double ())
        |> assert_
      in
      let () =
        (fun input ->
          let f = fn1 () in
          let result = Error input |. bind f |. run ~deps:() in
          (match result with
          | Error error -> expect error |. toBe input
          | Ok _ -> unreachable ());
          expect f |. not |. toBeCalled)
        |> property1 (string ())
        |> assert_
      in
      let* () =
        (fun input ->
          let* result =
            Ok input
            |. bind (fun n -> Ok (n |> Js.Float.toString))
            |. runAsync ~deps:()
          in
          (match result with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (input |> Js.Float.toString));
          Js.Promise.resolve ())
        |> asyncProperty1 (double ())
        |> asyncAssert
      in
      let* () =
        (fun input ->
          let f = fn1 () in
          let* result =
            Async (fun () -> Error input |> Js.Promise.resolve)
            |. bind f |. runAsync ~deps:()
          in
          (match result with
          | Error error -> expect error |. toBe input
          | Ok _ -> unreachable ());
          expect f |. not |. toBeCalled;
          Js.Promise.resolve ())
        |> asyncProperty1 (string ())
        |> asyncAssert
      in
      Js.Promise.resolve ());

  testAsync "catch" (fun () ->
      let open Promise.Monad_syntax in
      let () =
        (fun input ->
          match
            Error input
            |. catch (fun n -> Ok (n |> Js.Float.toString))
            |. run ~deps:()
          with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (input |> Js.Float.toString))
        |> property1 (double ())
        |> assert_
      in
      let () =
        (fun input ->
          let f = fn1 () in
          (match Ok input |. catch f |. run ~deps:() with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe input);
          expect f |. not |. toBeCalled)
        |> property1 (string ())
        |> assert_
      in
      let* () =
        (fun input ->
          let* result =
            Async (fun () -> Error input |. Js.Promise.resolve)
            |. catch (fun n -> Ok (n |. Js.Float.toString))
            |. runAsync ~deps:()
          in
          (match result with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (input |. Js.Float.toString));
          Js.Promise.resolve ())
        |> asyncProperty1 (double ())
        |> asyncAssert
      in
      let* () =
        (fun input ->
          let f = fn1 () in
          let* result =
            Async (fun () -> Ok input |> Js.Promise.resolve)
            |. catch f |. runAsync ~deps:()
          in
          (match result with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe input);
          expect f |. not |. toBeCalled;
          Js.Promise.resolve ())
        |> asyncProperty1 (string ())
        |> asyncAssert
      in
      Js.Promise.resolve ());

  test "ask" (fun () ->
      (fun thing ->
        match ask () |. run ~deps:thing with
        | Error _ -> unreachable ()
        | Ok env -> expect env |. toBe thing)
      |> property1 (anything ())
      |> assert_);

  test "provide" (fun () ->
      (fun thing ->
        match provide (ask ()) ~deps:thing |. run ~deps:() with
        | Error _ -> unreachable ()
        | Ok env -> expect env |. toBe thing)
      |> property1 (anything ())
      |> assert_)
