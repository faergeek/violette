open FastCheck
open Fx
open Vitest

let () =
  test "ok" (fun () ->
      (fun input ->
        match ok input |. run ~deps:() |> Monads.Result.match_ with
        | Error _ -> unreachable ()
        | Ok value -> expect value |. toBe input)
      |> property1 (anything ())
      |> assert_);

  test "err" (fun () ->
      (fun input ->
        match err input |. run ~deps:() |. Monads.Result.match_ with
        | Error e -> expect e |. toBe input
        | Ok _ -> unreachable ())
      |> property1 (anything ())
      |> assert_);

  testAsync "async" (fun () ->
      let open Promise.Monad_syntax in
      let* () =
        (fun input ->
          let* result =
            async (fun n -> ok n |> Js.Promise.resolve) |. runAsync ~deps:input
          in
          (match result |> Monads.Result.match_ with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe input);
          Js.Promise.resolve ())
        |> asyncProperty1 (anything ())
        |> asyncAssert
      in
      let* () =
        (fun input ->
          let* result =
            async (fun n -> n |> err |> Js.Promise.resolve)
            |. runAsync ~deps:input
          in
          (match result |> Monads.Result.match_ with
          | Error err -> expect err |. toBe input
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
            input |> ok
            |. bind (fun n -> n |> Js.Float.toString |> ok)
            |. run ~deps:() |> Monads.Result.match_
          with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (Js.String.make input))
        |> property1 (double ())
        |> assert_
      in
      let () =
        (fun input ->
          let f = fn1 () in
          (match
             input |> err |. bind f |. run ~deps:() |> Monads.Result.match_
           with
          | Error err -> expect err |. toBe input
          | Ok _ -> unreachable ());
          expect f |. not |. toBeCalled)
        |> property1 (string ())
        |> assert_
      in
      let* () =
        (fun input ->
          let* result =
            async (fun () -> input |> ok |> Js.Promise.resolve)
            |. bind (fun n -> n |> Js.Float.toString |> ok)
            |. runAsync ~deps:()
          in
          (match result |> Monads.Result.match_ with
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
            async (fun () -> err input |> Js.Promise.resolve)
            |. bind f |. runAsync ~deps:()
          in
          (match result |> Monads.Result.match_ with
          | Error err -> expect err |. toBe input
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
            input |> ok
            |. map (fun n -> n |> Js.String.make)
            |. run ~deps:() |. Monads.Result.match_
          with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (input |. Js.Float.toString))
        |> property1 (double ())
        |> assert_
      in
      let () =
        (fun input ->
          let f = fn1 () in
          let result = input |> err |. bind f |. run ~deps:() in
          (match result |> Monads.Result.match_ with
          | Error err -> expect err |. toBe input
          | Ok _ -> unreachable ());
          expect f |. not |. toBeCalled)
        |> property1 (string ())
        |> assert_
      in
      let* () =
        (fun input ->
          let* result =
            input |. ok
            |. bind (fun n -> n |> Js.Float.toString |> ok)
            |. runAsync ~deps:()
          in
          (match result |> Monads.Result.match_ with
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
            async (fun () -> input |> err |> Js.Promise.resolve)
            |. bind f |. runAsync ~deps:()
          in
          (match result |> Monads.Result.match_ with
          | Error err -> expect err |. toBe input
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
            input |. err
            |. catch (fun n -> n |> Js.Float.toString |> ok)
            |. run ~deps:() |> Monads.Result.match_
          with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe (input |> Js.Float.toString))
        |> property1 (double ())
        |> assert_
      in
      let () =
        (fun input ->
          let f = fn1 () in
          (match
             input |> ok |. catch f |. run ~deps:() |> Monads.Result.match_
           with
          | Error _ -> unreachable ()
          | Ok value -> expect value |. toBe input);
          expect f |. not |. toBeCalled)
        |> property1 (string ())
        |> assert_
      in
      let* () =
        (fun input ->
          let* result =
            async (fun () -> input |. err |. Js.Promise.resolve)
            |. catch (fun n -> n |. Js.Float.toString |> ok)
            |. runAsync ~deps:()
          in
          (match result |> Monads.Result.match_ with
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
            async (fun () -> input |> ok |> Js.Promise.resolve)
            |. catch f |. runAsync ~deps:()
          in
          (match result |> Monads.Result.match_ with
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
        match ask () |. run ~deps:thing |> Monads.Result.match_ with
        | Error _ -> unreachable ()
        | Ok env -> expect env |. toBe thing)
      |> property1 (anything ())
      |> assert_);

  test "provide" (fun () ->
      (fun thing ->
        match
          ask () |. provide thing |. run ~deps:() |> Monads.Result.match_
        with
        | Error _ -> unreachable ()
        | Ok env -> expect env |. toBe thing)
      |> property1 (anything ())
      |> assert_)
