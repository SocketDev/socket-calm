# Socket Calm

A low-noise syntax theme in warm plum and sand. Six colors do the work, and nothing shouts.

Most themes assign a color to every grammar rule they can find. Socket Calm goes the other
way: operators, punctuation, and variables stay in the foreground color, so the things that
actually carry meaning — keywords, calls, strings, keys, literals — are the only things that
change hue. Both variants are lifted directly from Socket's design system.

## Socket Calm Dark

![Socket Calm Dark](images/preview-dark.png)

## Socket Calm Light

![Socket Calm Light](images/preview-light.png)

## Install

From the Extensions view (`⇧⌘X` / `Ctrl+Shift+X`), search for **Socket Calm** and click
Install. Then pick a variant with `⌘K ⌘T` / `Ctrl+K Ctrl+T`:

- **Socket Calm Dark**
- **Socket Calm Light**

Or from the command line:

```bash
code --install-extension socketdev.socket-calm
```

## Vim / Neovim

The same theme ships as a Vim colorscheme in [vim/colors/socket-calm.vim](vim/colors/socket-calm.vim) —
one file covering both variants, true-color and 256-color terminals, Vim 8+ and Neovim
(including Treesitter, LSP semantic tokens, diagnostics, and terminal ANSI colors).

### Install

**Manually** — copy the file into your colors directory:

```bash
mkdir -p ~/.vim/colors && curl -fLo ~/.vim/colors/socket-calm.vim https://raw.githubusercontent.com/SocketDev/socket-calm/main/vim/colors/socket-calm.vim
```

For Neovim, use `~/.config/nvim/colors/` instead of `~/.vim/colors/`.

**With a plugin manager** — point it at this repo and set the runtime path to the `vim/`
subdirectory:

```vim
" vim-plug
Plug 'SocketDev/socket-calm', { 'rtp': 'vim' }
```

```lua
-- lazy.nvim
{ "SocketDev/socket-calm", lazy = false, priority = 1000,
  config = function(plugin) vim.opt.rtp:append(plugin.dir .. "/vim") end }
```

### Use

Typing `:colorscheme socket-calm` works, but only for that session. To make it stick, put it in
your config file — `~/.vimrc` for Vim, `~/.config/nvim/init.lua` for Neovim. Neither file exists
on a fresh install; create it if it isn't there.

```vim
" ~/.vimrc
syntax enable
set termguicolors        " true color; without it the theme falls back to 256 colors
set background=dark      " Socket Calm Dark — or 'light' for Socket Calm Light
silent! colorscheme socket-calm
```

```lua
-- ~/.config/nvim/init.lua
vim.opt.termguicolors = true
vim.opt.background = "dark"   -- or "light"
vim.cmd.colorscheme("socket-calm")
```

Set `background` *before* `colorscheme` — the colorscheme reads it to decide which variant to
build. The `silent!` is optional and just keeps Vim starting cleanly if the colorscheme file ever
goes missing, instead of raising `E185` on every launch.

Switching `set background=light` ⇄ `set background=dark` after loading swaps variants on the
spot. Comments are italic by default; to disable that (e.g. for terminals without italics),
set this before loading:

```vim
let g:socket_calm_italics = 0
```

Inside tmux or screen, Vim can't infer true-color support from termcap, so `termguicolors` alone
silently leaves you on the 256-color fallback. Add these above it:

```vim
let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
```

Neovim handles this itself and doesn't need them.

## Palette

Both variants share one structure: a neutral ramp for the interface, six syntax colors, and a
small set of derived accents for things a syntax palette doesn't cover (diagnostics, git
decorations, terminal ANSI).

### Syntax

| Role | Dark | Light | Applies to |
| --- | --- | --- | --- |
| Plain | `#f5f5fa` | `#2a2a30` | Variables, parameters, operators, punctuation |
| Comment | `#7e7e91` | `#7e7e91` | Comments and doc blocks (italic) |
| Keyword | `#d29af7` | `#8735d9` | Keywords, control flow, storage, tags |
| Function | `#8fb8f2` | `#2e4dc7` | Function and method names, calls, decorators |
| Property | `#bb72ee` | `#510d79` | Object keys, members, attributes, CSS properties |
| String | `#97e0af` | `#4a7b5a` | Strings and template literals |
| Number | `#ff5fbd` | `#e60086` | Numbers, booleans, `null`, enum members |
| Type | `#8ad3cb` | `#17636b` | Classes, interfaces, enums, type parameters |

The first seven rows are the Socket design tokens as-authored. **Type** is derived — the source
palette has no color for it, and reusing Property would collide with object keys in annotations
like `{ foo: Bar }`.

### Interface neutrals

Dark is a plum ramp built around the background at `#29202e`; light is a warm sand ramp built
around `#e5e1de`. The two anchors are the same pair of colors the design system uses for
background and primary text, swapped.

| | Dark | Light |
| --- | --- | --- |
| Editor background | `#29202e` | `#e5e1de` |
| Side bar | `#231b27` | `#ddd8d4` |
| Activity / title / status bar | `#1d1721` | `#d4cec9` |
| Widgets, inputs, menus | `#1d1721` | `#f2efee` |
| Current line | `#302636` | `#ddd8d4` |
| Selection | `#43344b` | `#d4cec9` |
| Borders | `#43344b` | `#c9c1bb` |

### Derived accents

Not used for syntax — only diagnostics, git decorations, diffs, and terminal ANSI.

| Role | Dark | Light |
| --- | --- | --- |
| Error | `#ee8a86` | `#a8332b` |
| Warning | `#e8c07a` | `#8a5a00` |
| Escapes, regex, macros | `#f0a878` | `#a05320` |

## Design notes

**Operators are not keywords.** `=>`, `+`, `===`, and `??` render in the plain foreground
color. This is the single biggest reason the theme reads quietly, and it matches the source
design exactly.

**Member access is plain; calls are colored.** In `chrome.runtime.onMessage.addListener(...)`
only `addListener` picks up the function color. Property color is reserved for keys you
*write* — object literals, CSS properties, JSON keys, HTML attributes.

**Comments share one color across both variants.** `#7e7e91` is the same in light and dark by
design, which is why it sits lower on contrast than body text in the light variant (see below).

**Bracket pair colorization** rotates through keyword → function → string → number → type →
warning, so nesting depth is legible without introducing new hues.

## Accessibility

`pnpm run validate` enforces, on every change:

- Every one of the 61 interface foreground/background pairs the workbench actually renders
  meets WCAG AA (4.5:1) for body text or AA-large (3:1) for secondary text and icons.
- Every syntax color clears 3:1 against its editor background.
- Every chromatic terminal ANSI color clears 3:1 against the terminal background.
- Every color id is real — the script cross-checks each one against the color registry in a
  local VS Code install, so a typo can't silently do nothing.

Honest caveat: in the light variant, comments (`3.06:1`), strings (`3.78:1`), and numbers
(`3.43:1`) land between 3:1 and 4.5:1. Those are the design-system values as authored, and
they're kept rather than "corrected" so the theme matches its source. If you want more bite
from comments specifically, override just that one:

```jsonc
// settings.json
"editor.tokenColorCustomizations": {
  "[Socket Calm Light]": {
    "comments": "#6a6a7d"
  }
}
```

## Recommended settings

Nothing here is required — the theme stands on its own — but this is what the previews use:

```jsonc
{
  "editor.semanticHighlighting.enabled": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.renderLineHighlight": "all",
  "editor.cursorBlinking": "smooth"
}
```

Semantic highlighting is on by default in both variants and is what makes types, default-library
symbols, and enum members resolve correctly in TypeScript, Python, Rust, and Go.

## Development

```bash
pnpm install
pnpm run validate    # JSON, color ids, duplicate keys, contrast
pnpm run previews    # regenerate README screenshots (needs Google Chrome)
pnpm run package     # build socket-calm-<version>.vsix
```

The previews are generated from the theme JSON rather than screenshotted by hand, so the
images in this README can't drift from the actual colors.

## License

MIT — see [LICENSE](LICENSE).
