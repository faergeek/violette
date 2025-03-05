let use () =
  let store = Store.Context.useStore () in
  fun fx -> fx |. Fx.runAsync ~deps:Deps.{ store }
