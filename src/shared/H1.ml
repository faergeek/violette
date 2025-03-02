let[@react.component] make ?children ?className =
  h1
    ~className:
      (Clsx.make
         [|
           Item "text-4xl font-bold tracking-wide";
           Item (className |> Option.value ~default:"");
         |])
    ?children () [@JSX]
