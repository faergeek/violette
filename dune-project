(lang dune 3.20)

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
   (and
    (>= 4)
    (< 6)))
  (melange-fetch
   (and
    (>= 0.1)
    (< 0.2)))
  (melange-webapi
   (and
    (>= 0.21)
    (< 0.22)))
  (melange-json
   (and
    (>= 1)
    (< 2)))
  (opam-dune-lint
   (and
    :with-dev-setup
    (>= 0.6)
    (< 0.7)))
  (opam-check-npm-deps
   (and
    :with-dev-setup
    (>= 4)
    (< 5)))
  (ocamlformat
   (and
    :with-dev-setup
    (= 0.28.1)))
  (ocaml-lsp-server
   (and
    :with-dev-setup
    (>= 1.21)))
  (reason-react
   (and
    (>= 0.15)
    (< 0.17)))
  (reason-react-ppx
   (and
    (>= 0.15)
    (< 0.17)))))
