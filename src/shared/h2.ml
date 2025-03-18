let[@react.component] make ?children ?className ?id =
  h2
    ~className:
      (Clsx.make
         [|
           Item "font-bold tracking-widest [font-variant-caps:all-small-caps]";
           Item (className |> Option.value ~default:"");
         |])
    ?children ?id () [@JSX]
