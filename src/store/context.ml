let context : State.t Zustand.t option React.Context.t =
  React.createContext None

let useStore () = React.useContext context |> Option.get
let useAppStore selector = Zustand.useStore (useStore ()) selector

module ProviderInternal = struct
  include React.Context

  let make = React.Context.provider context
end

module Provider = struct
  let[@react.component] make ~children ~store =
    ProviderInternal.make ~value:(Some store) ~children () [@JSX]
end

module Consumer = struct
  let[@react.component] make ~children ~selector =
    children (Zustand.useStore (useStore ()) selector)
end
