let[@react.component] make ?autoComplete ?autoFocus ?defaultValue ?disabled ?id
    ?name ?required ?type_ =
  input ?autoComplete ?autoFocus
    ~className:
      "focus-visible:ring-ring flex h-10 w-full rounded-md border border-input \
       bg-background px-3 py-2 text-base ring-offset-background file:border-0 \
       file:bg-transparent file:text-sm file:font-medium file:text-foreground \
       placeholder:text-muted-foreground focus-visible:outline-none \
       focus-visible:ring-2 focus-visible:ring-offset-2 \
       disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    ?defaultValue ?disabled ?id ?name ?required ?type_ () [@JSX]
