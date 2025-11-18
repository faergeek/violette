## Development

### Requirements

- Either [asdf](https://asdf-vm.com) or [proper versions of node and opam](./.tool-versions)
- [pnpm](https://pnpm.io)

### Setup

If you don't have a switch, to create it and install packages:

```sh
opam switch create --deps-only --with-dev-setup .
```

If you do have a switch, just install packages:

```sh
opam install --deps-only --with-dev-setup .
```

Install node packages:

```sh
pnpm i
```

### Developing

Compile OCaml to JS in watch mode:

```sh
dune build --watch
```

In another terminal start a vite development server:

```sh
pnpm run dev
```

Run tests:

```sh
pnpm test
```

Format everything:

```sh
dune fmt
```

### Links

- [Melange](https://melange.re)
- [Icons](https://lucide.dev/icons)
- [Brand icons](https://simpleicons.org/)
  - [package for React](https://github.com/icons-pack/react-simple-icons)
- [Subsonic API](https://www.subsonic.org/pages/api.jsp)
- [OpenSubsonic API](https://opensubsonic.netlify.app)

## Artwork

- [Favicon](https://www.figma.com/design/4fi9GDFXvHlNJapC230Ly0/Violette?m=auto&t=k5jszBlmYI9ksUQ3-7)
