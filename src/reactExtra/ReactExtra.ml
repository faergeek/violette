external [@mel.get] getProps : React.element -> < .. > Js.t = "props"

module Event = struct
  module Form = struct
    external [@mel.get] currentTarget :
      React.Event.Form.t -> Dom.htmlFormElement = "currentTarget"

    external [@mel.get] target : React.Event.Form.t -> Dom.element = "target"
  end

  module Keyboard = struct
    external [@mel.get] code : React.Event.Keyboard.t -> string = "code"

    external [@mel.get] currentTarget : React.Event.Keyboard.t -> Dom.element
      = "currentTarget"

    external [@mel.get] target : React.Event.Keyboard.t -> Dom.element
      = "target"
  end

  module Mouse = struct
    external [@mel.get] currentTarget : React.Event.Mouse.t -> Dom.element
      = "currentTarget"
  end
end
