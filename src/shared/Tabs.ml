module Root = struct
  external [@mel.module "./tabs"] [@react.component] make :
    ?children:React.element -> ?value:string -> unit -> React.element = "Tabs"
end

module List = struct
  external [@mel.module "./tabs"] [@react.component] make :
    ?children:React.element -> ?className:string -> unit -> React.element
    = "TabsList"
end

module Trigger = struct
  external [@mel.module "./tabs"] [@react.component] make :
    ?children:React.element -> ?value:string -> unit -> React.element
    = "TabsTrigger"
end

module Content = struct
  external [@mel.module "./tabs"] [@react.component] make :
    ?children:React.element ->
    ?id:string ->
    ?value:string ->
    unit ->
    React.element = "TabsContent"
end
