module Context = struct
  include React.Context

  type value = { isOpen : bool; setIsOpen : (bool -> bool) -> unit }

  let context : value option React.Context.t = React.createContext None
  let make = React.Context.provider context
  let use () = context |> React.useContext |> Option.get
end

module Provider = struct
  let[@react.component] make ~children =
    let isOpen, setIsOpen = React.useState (Fun.const false) in
    let value =
      React.useMemo1 (fun () -> Some Context.{ isOpen; setIsOpen }) [| isOpen |]
    in
    (Context.make ~value ~children () [@JSX])
end

module Consumer = struct
  let[@react.component] make ~children = Context.use () |> children
end
