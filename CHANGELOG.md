# Changelog

All notable changes to Socket Calm are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-29

Initial release.

### Added

- **Socket Calm Dark** — plum ramp anchored on `#29202e`.
- **Socket Calm Light** — warm sand ramp anchored on `#e5e1de`.
- Full workbench theming for both variants: editor, side bar, activity bar, tabs, status bar,
  panels, terminal (all 16 ANSI slots), notifications, menus, quick input, peek view, diff and
  merge editors, debug, testing and coverage, notebooks, chat and inline chat, git decorations,
  settings, breadcrumbs, and symbol icons.
- Semantic highlighting for both variants, including `defaultLibrary` and `readonly` modifiers.
- Bracket pair colorization and active bracket pair guides in six palette hues.
- TextMate coverage for TypeScript/JavaScript, JSX/TSX, JSON, HTML, CSS/SCSS/Less, Markdown,
  YAML, TOML, shell, diff, regex, Python, Rust, Go, and C-family preprocessor directives.
- `npm run validate` — checks JSON validity, duplicate keys, hex syntax, scope collisions,
  color-id existence against a local VS Code install, and WCAG contrast across 61 interface
  pairs plus all syntax and ANSI colors.
- `npm run previews` — regenerates the README screenshots from the theme JSON.

[1.0.0]: https://github.com/SocketDev/socket-calm/releases/tag/v1.0.0
