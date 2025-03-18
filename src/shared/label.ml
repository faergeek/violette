let[@react.component] make ?children ?className ?htmlFor ?id =
  label ?children
    ~className:
      (Clsx.make
         [|
           Item
             "block text-sm leading-none peer-disabled:cursor-not-allowed \
              peer-disabled:opacity-70";
           Item (className |> Option.value ~default:"");
         |])
    ?htmlFor ?id () [@JSX]
