type listenerOptions

external [@mel.obj] listenerOptions :
  ?capture:bool ->
  ?passive:bool ->
  ?signal:Fetch.signal ->
  unit ->
  listenerOptions = ""

external [@mel.send] addKeyDownEventListener :
  Dom.window ->
  (_[@mel.as "keydown"]) ->
  (Dom.keyboardEvent -> unit) ->
  listenerOptions ->
  unit = "addEventListener"
