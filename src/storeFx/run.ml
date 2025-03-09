let use () =
  let store = Store.Context.useStore () in
  fun fx -> fx |. Fx.run ~deps:Deps.{ store }
