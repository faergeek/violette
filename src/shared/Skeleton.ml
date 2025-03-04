let[@react.component] make ?className =
  span
    ~className:
      (Clsx.make
         [|
           Item "my-[0.25lh] block h-[0.75lh] animate-pulse rounded-md bg-muted";
           Item (className |> Option.value ~default:"");
         |])
    () [@JSX]
