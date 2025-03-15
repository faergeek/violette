module NumberFormat = struct
  type t
  type options

  external [@mel.obj] options :
    minimumIntegerDigits:int ->
    minimumFractionDigits:int ->
    signDisplay:[ `always ] ->
    options = ""

  external [@mel.new] [@mel.scope "Intl"] make : string -> options -> t
    = "NumberFormat"

  external [@mel.send] format : t -> float -> string = "format"
end
