type props = {
  ariaHidden : bool option; [@mel.as "aria-hidden"] [@optional]
  className : string option; [@optional]
  role : string option; [@optional]
}

let makeProps ?ariaHidden ?className ?role () = { ariaHidden; className; role }

type t = props React.component
