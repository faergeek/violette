(lang dune 3.17)

(using melange 0.1)

(homepage "https://github.com/faergeek/violette")

(bug_reports "https://github.com/faergeek/violette/issues")

(license GPL-3.0-only)

(source
 (github faergeek/violette))

(authors "Sergei Slipchenko <faergeek@gmail.com>")

(maintainers "Sergei Slipchenko <faergeek@gmail.com>")

(generate_opam_files)

(package
 (name violette)
 (synopsis "Web-based subsonic client")
 (allow_empty)
 (depends
  (melange
   (>= 5.0.0))
  (melange-fetch
   (>= 0.1.0))
  (melange-webapi
   (>= 0.21.0))
  (melange-json
   (and
    (>= 1.0.0)
    (< 2.0.0)))
  (ocaml
   (>= 5.3.0))
  (opam-dune-lint :with-dev-setup)
  (ocaml-lsp-server :with-dev-setup)
  (ocamlformat :with-dev-setup)
  (opam-check-npm-deps :with-dev-setup)
  (reason-react
   (>= 0.14.0))
  (reason-react-ppx
   (>= 0.14.0))))
