type props = {
  ariaHidden : bool option; [@mel.as "aria-hidden"] [@optional]
  className : string option; [@optional]
}

let makeProps ?ariaHidden ?className () = { ariaHidden; className }

type t = props React.component
