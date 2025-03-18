module Monad_syntax = struct
  let ( let* ) = fun a f -> Js.Promise.then_ f a
  let ( and* ) = fun a b -> Js.Promise.all2 (a, b)
end
