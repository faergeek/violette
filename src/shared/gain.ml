open Intl.NumberFormat

let format =
  options ~minimumIntegerDigits:2 ~minimumFractionDigits:1 ~signDisplay:`always
  |> make "en-US" |> format
