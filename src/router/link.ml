type hashScrollIntoViewParams = {
  behavior : [ `instant ];
  block : [ `start | `nearest ];
}

type 'a props = {
  ariaLabel : string option; [@mel.as "aria-label"]
  children : React.element option;
  className : string option;
  hash : string option;
  hashScrollIntoView : hashScrollIntoViewParams option;
  params : 'a Js.t option;
  resetScroll : bool option;
  _to : string; [@mel.as "to"]
}

let makeProps ?ariaLabel ?children ?className ?hash ?hashScrollIntoView ?params
    ?resetScroll ~_to () =
  {
    ariaLabel;
    children;
    className;
    hash;
    hashScrollIntoView;
    params;
    resetScroll;
    _to;
  }

external [@mel.module "@tanstack/react-router"] make : 'a props React.component
  = "Link"
