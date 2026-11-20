" Name:    Socket Calm
" Author:  Socket (https://socket.dev)
" License: MIT
" Source:  https://github.com/SocketDev/socket-calm
"
" A low-noise syntax theme in warm plum and sand, ported from the Socket Calm
" VS Code theme. Operators, punctuation, and variables stay in the plain
" foreground color; only keywords, calls, strings, keys, literals, and types
" change hue.
"
" One file, two variants — pick with 'background':
"   set background=dark   " Socket Calm Dark
"   set background=light  " Socket Calm Light
"   colorscheme socket-calm

hi clear
if exists('syntax_on')
  syntax reset
endif
let g:colors_name = 'socket-calm'

let s:italics = get(g:, 'socket_calm_italics', 1)

" Palettes: [gui, cterm256]
if &background ==# 'light'
  let s:bg          = ['#f7f3ef', 255]
  let s:fg          = ['#2a2a30', 236]
  let s:ui_fg       = ['#29202e', 235]
  let s:bg_widget   = ['#fcfaf8', 231]   " floats, menus
  let s:bg_bright   = ['#fefdfc', 231]
  let s:bg_panel    = ['#efebe7', 254]   " cursorline, side areas
  let s:bg_soft     = ['#efebe7', 254]   " pmenu selection
  let s:visual      = ['#e6e1dc', 253]
  let s:border      = ['#dbd8d4', 252]
  let s:border_hi   = ['#b8b1ac', 250]
  let s:linenr      = ['#746d78', 243]
  let s:status_fg   = ['#4b4550', 239]
  let s:muted       = ['#5b555e', 240]
  let s:dim         = ['#8a838e', 245]
  let s:comment     = ['#7e7e91', 244]
  let s:keyword     = ['#8735d9', 98]
  let s:func        = ['#2e4dc7', 26]
  let s:prop        = ['#510d79', 54]
  let s:string      = ['#4a7b5a', 65]
  let s:number      = ['#e60086', 162]
  let s:type        = ['#17636b', 23]
  let s:error       = ['#a8332b', 124]
  let s:warn        = ['#8a5a00', 94]
  let s:orange      = ['#a05320', 130]
  let s:cursor      = ['#e60086', 162]
  let s:diff_add    = ['#dde1d9', 194]
  let s:diff_del    = ['#ebd6d2', 224]
  let s:diff_change = ['#eae0d2', 230]
  let s:diff_text   = ['#d4c2a2', 222]
  let s:search      = ['#d1be9c', 222]
  let s:search_lite = ['#e1d4bf', 230]
  let s:ansi = [
        \ ['#2a2a30', 236], ['#a8332b', 124], ['#4a7b5a', 65],  ['#8a5a00', 94],
        \ ['#2e4dc7', 26],  ['#e60086', 162], ['#17636b', 23],  ['#efebe7', 254],
        \ ['#5b555e', 240], ['#8d251e', 88],  ['#366646', 65],  ['#613f00', 58],
        \ ['#203dac', 25],  ['#bd006e', 125], ['#0d464c', 23],  ['#fefdfc', 231]]
else
  let s:bg          = ['#29202e', 235]
  let s:fg          = ['#f5f5fa', 255]
  let s:ui_fg       = ['#f7f3ef', 255]
  let s:bg_widget   = ['#1d1721', 234]   " floats, menus
  let s:bg_bright   = ['#1d1721', 234]
  let s:bg_panel    = ['#231b27', 234]   " side areas
  let s:bg_soft     = ['#382c3f', 236]   " pmenu selection
  let s:visual      = ['#43344b', 237]
  let s:border      = ['#302636', 236]
  let s:border_hi   = ['#5b4766', 240]
  let s:linenr      = ['#886c98', 96]
  let s:status_fg   = ['#b6a5c0', 249]
  let s:muted       = ['#9278a1', 103]
  let s:dim         = ['#7e628d', 96]
  let s:comment     = ['#7e7e91', 244]
  let s:keyword     = ['#d29af7', 177]
  let s:func        = ['#8fb8f2', 111]
  let s:prop        = ['#bb72ee', 135]
  let s:string      = ['#97e0af', 115]
  let s:number      = ['#ff5fbd', 205]
  let s:type        = ['#8ad3cb', 116]
  let s:error       = ['#ee8a86', 210]
  let s:warn        = ['#e8c07a', 180]
  let s:orange      = ['#f0a878', 216]
  let s:cursor      = ['#ff5fbd', 205]
  let s:diff_add    = ['#34333b', 22]
  let s:diff_del    = ['#3d2b37', 52]
  let s:diff_change = ['#382d34', 236]
  let s:diff_text   = ['#5e4d43', 58]
  let s:search      = ['#625045', 58]
  let s:search_lite = ['#463839', 237]
  let s:ansi = [
        \ ['#130f15', 233], ['#ee8a86', 210], ['#97e0af', 115], ['#e8c07a', 180],
        \ ['#8fb8f2', 111], ['#ff5fbd', 205], ['#8ad3cb', 116], ['#cfc4d6', 252],
        \ ['#5b4766', 240], ['#f4b1ae', 217], ['#baebca', 151], ['#efd3a1', 223],
        \ ['#b8d2f7', 153], ['#ff8dd0', 212], ['#abe0da', 152], ['#f5f5fa', 255]]
endif

" s:hi(group, fg, bg, attr [, special])  — pass [] to leave fg/bg unset
function! s:hi(group, fg, bg, attr, ...) abort
  let l:cmd = 'hi ' . a:group
  if !empty(a:fg)
    let l:cmd .= ' guifg=' . a:fg[0] . ' ctermfg=' . a:fg[1]
  else
    let l:cmd .= ' guifg=NONE ctermfg=NONE'
  endif
  if !empty(a:bg)
    let l:cmd .= ' guibg=' . a:bg[0] . ' ctermbg=' . a:bg[1]
  else
    let l:cmd .= ' guibg=NONE ctermbg=NONE'
  endif
  let l:attr = empty(a:attr) ? 'NONE' : a:attr
  let l:cmd .= ' gui=' . l:attr . ' cterm=' . l:attr
  if a:0 > 0 && !empty(a:1)
    let l:cmd .= ' guisp=' . a:1[0]
  endif
  execute l:cmd
endfunction

let s:italic = s:italics ? 'italic' : ''

" ----------------------------------------------------------------------------
" UI
" ----------------------------------------------------------------------------
call s:hi('Normal',       s:fg, s:bg, '')
call s:hi('NormalNC',     s:fg, s:bg, '')
call s:hi('NormalFloat',  s:fg, s:bg_widget, '')
call s:hi('FloatBorder',  s:border_hi, s:bg_widget, '')
call s:hi('FloatTitle',   s:ui_fg, s:bg_widget, 'bold')
call s:hi('Cursor',       s:bg, s:cursor, '')
call s:hi('lCursor',      s:bg, s:cursor, '')
call s:hi('CursorIM',     s:bg, s:cursor, '')
call s:hi('TermCursor',   s:bg, s:cursor, '')
call s:hi('CursorLine',   [], s:bg_panel, '')
call s:hi('CursorColumn', [], s:bg_panel, '')
call s:hi('ColorColumn',  [], s:bg_panel, '')
call s:hi('CursorLineNr', s:ui_fg, [], 'bold')
call s:hi('LineNr',       s:linenr, [], '')
hi! link LineNrAbove LineNr
hi! link LineNrBelow LineNr
call s:hi('SignColumn',   s:linenr, [], '')
call s:hi('FoldColumn',   s:linenr, [], '')
call s:hi('Folded',       s:muted, s:bg_panel, '')
call s:hi('VertSplit',    s:border, [], '')
hi! link WinSeparator VertSplit
call s:hi('StatusLine',   s:status_fg, s:bg_widget, '')
call s:hi('StatusLineNC', s:dim, s:bg_widget, '')
hi! link StatusLineTerm StatusLine
hi! link StatusLineTermNC StatusLineNC
call s:hi('TabLine',      s:muted, s:bg_panel, '')
call s:hi('TabLineSel',   s:ui_fg, s:bg, 'bold')
call s:hi('TabLineFill',  s:muted, s:bg_widget, '')
call s:hi('WinBar',       s:ui_fg, [], 'bold')
call s:hi('WinBarNC',     s:muted, [], '')
call s:hi('Visual',       [], s:visual, '')
call s:hi('VisualNOS',    [], s:visual, '')
call s:hi('Search',       [], s:search, '')
call s:hi('IncSearch',    s:bg, s:warn, '')
call s:hi('CurSearch',    s:bg, s:warn, '')
call s:hi('MatchParen',   [], s:visual, 'bold')
call s:hi('Pmenu',        s:fg, s:bg_widget, '')
call s:hi('PmenuSel',     s:ui_fg, s:bg_soft, '')
call s:hi('PmenuSbar',    [], s:bg_widget, '')
call s:hi('PmenuThumb',   [], s:border_hi, '')
hi! link PmenuKind Pmenu
hi! link PmenuKindSel PmenuSel
hi! link PmenuExtra Pmenu
hi! link PmenuExtraSel PmenuSel
call s:hi('WildMenu',     s:ui_fg, s:bg_soft, 'bold')
call s:hi('QuickFixLine', [], s:bg_soft, '')
call s:hi('qfLineNr',     s:muted, [], '')
call s:hi('Directory',    s:func, [], '')
call s:hi('Title',        s:func, [], 'bold')
call s:hi('ErrorMsg',     s:error, [], '')
call s:hi('WarningMsg',   s:warn, [], '')
call s:hi('ModeMsg',      s:muted, [], '')
call s:hi('MoreMsg',      s:string, [], '')
call s:hi('Question',     s:string, [], '')
call s:hi('NonText',      s:border_hi, [], '')
call s:hi('SpecialKey',   s:border_hi, [], '')
call s:hi('Whitespace',   s:border_hi, [], '')
call s:hi('EndOfBuffer',  s:border_hi, [], '')
call s:hi('Conceal',      s:muted, [], '')
call s:hi('SpellBad',     [], [], 'undercurl', s:error)
call s:hi('SpellCap',     [], [], 'undercurl', s:func)
call s:hi('SpellLocal',   [], [], 'undercurl', s:type)
call s:hi('SpellRare',    [], [], 'undercurl', s:prop)

" Diff (buffer view)
call s:hi('DiffAdd',      [], s:diff_add, '')
call s:hi('DiffDelete',   s:error, s:diff_del, '')
call s:hi('DiffChange',   [], s:diff_change, '')
call s:hi('DiffText',     [], s:diff_text, '')
" Diff (patch filetype) — Added/Changed/Removed exist in Vim 9.1+/Nvim 0.10+
call s:hi('Added',        s:string, [], '')
call s:hi('Changed',      s:warn, [], '')
call s:hi('Removed',      s:error, [], '')
hi! link diffAdded Added
hi! link diffRemoved Removed
hi! link diffChanged Changed
call s:hi('diffFile',     s:prop, [], '')
call s:hi('diffIndexLine', s:prop, [], '')
call s:hi('diffLine',     s:prop, [], '')
call s:hi('diffSubname',  s:muted, [], '')

" ----------------------------------------------------------------------------
" Syntax — the calm part: Identifier, Operator, and Delimiter stay plain
" ----------------------------------------------------------------------------
call s:hi('Comment',      s:comment, [], s:italic)
call s:hi('Constant',     s:number, [], '')
call s:hi('String',       s:string, [], '')
call s:hi('Character',    s:string, [], '')
call s:hi('Number',       s:number, [], '')
call s:hi('Boolean',      s:number, [], '')
call s:hi('Float',        s:number, [], '')
call s:hi('Identifier',   s:fg, [], '')
call s:hi('Function',     s:func, [], '')
call s:hi('Statement',    s:keyword, [], '')
call s:hi('Conditional',  s:keyword, [], '')
call s:hi('Repeat',       s:keyword, [], '')
call s:hi('Label',        s:fg, [], '')
call s:hi('Operator',     s:fg, [], '')
call s:hi('Keyword',      s:keyword, [], '')
call s:hi('Exception',    s:keyword, [], '')
call s:hi('PreProc',      s:keyword, [], '')
call s:hi('Include',      s:keyword, [], '')
call s:hi('Define',       s:keyword, [], '')
call s:hi('Macro',        s:orange, [], '')
call s:hi('PreCondit',    s:keyword, [], '')
call s:hi('Type',         s:type, [], '')
call s:hi('StorageClass', s:keyword, [], '')
call s:hi('Structure',    s:type, [], '')
call s:hi('Typedef',      s:type, [], '')
call s:hi('Special',      s:orange, [], '')
call s:hi('SpecialChar',  s:orange, [], '')
call s:hi('Tag',          s:keyword, [], '')
call s:hi('Delimiter',    s:fg, [], '')
call s:hi('SpecialComment', s:muted, [], s:italic)
call s:hi('Debug',        s:orange, [], '')
call s:hi('Underlined',   s:func, [], 'underline')
call s:hi('Ignore',       s:dim, [], '')
call s:hi('Error',        s:error, [], '')
call s:hi('Todo',         s:warn, [], 'bold')

" ----------------------------------------------------------------------------
" Filetype specifics — keys/attributes get the property color
" ----------------------------------------------------------------------------
" HTML / XML
call s:hi('htmlTag',        s:keyword, [], '')
call s:hi('htmlEndTag',     s:keyword, [], '')
call s:hi('htmlTagName',    s:keyword, [], '')
call s:hi('htmlSpecialTagName', s:keyword, [], '')
call s:hi('htmlArg',        s:prop, [], '')
call s:hi('htmlTitle',      s:fg, [], '')
hi! link xmlTag htmlTag
hi! link xmlEndTag htmlEndTag
hi! link xmlTagName htmlTagName
hi! link xmlAttrib htmlArg

" CSS
call s:hi('cssTagName',     s:keyword, [], '')
call s:hi('cssClassName',   s:keyword, [], '')
call s:hi('cssIdentifier',  s:keyword, [], '')
call s:hi('cssPseudoClassId', s:keyword, [], '')
call s:hi('cssAtRule',      s:keyword, [], '')
call s:hi('cssProp',        s:prop, [], '')
call s:hi('cssAttr',        s:func, [], '')
call s:hi('cssBraces',      s:fg, [], '')
call s:hi('cssNoise',       s:fg, [], '')
hi! link cssVendor cssProp
hi! link scssVariable Type
hi! link lessVariable Type

" JSON / YAML / TOML / INI / dotenv
call s:hi('jsonKeyword',    s:prop, [], '')
call s:hi('jsonQuote',      s:string, [], '')
hi! link jsonBoolean Boolean
hi! link jsonNull Boolean
call s:hi('yamlBlockMappingKey', s:prop, [], '')
hi! link yamlFlowMappingKey yamlBlockMappingKey
hi! link yamlKeyValueDelimiter Delimiter
hi! link yamlAnchor Type
hi! link yamlAlias Type
hi! link tomlKey jsonKeyword
hi! link tomlTable Type
hi! link dosiniLabel jsonKeyword
hi! link dosiniHeader Type

" Markdown
call s:hi('markdownH1',     s:func, [], 'bold')
hi! link markdownH2 markdownH1
hi! link markdownH3 markdownH1
hi! link markdownH4 markdownH1
hi! link markdownH5 markdownH1
hi! link markdownH6 markdownH1
hi! link markdownHeadingDelimiter markdownH1
hi! link markdownHeadingRule markdownH1
call s:hi('markdownBold',   s:warn, [], 'bold')
call s:hi('markdownItalic', s:keyword, [], s:italic)
call s:hi('markdownBoldItalic', s:warn, [], empty(s:italic) ? 'bold' : 'bold,italic')
call s:hi('markdownCode',   s:string, [], '')
hi! link markdownCodeBlock markdownCode
hi! link markdownCodeDelimiter markdownCode
call s:hi('markdownUrl',    s:func, [], 'underline')
call s:hi('markdownLinkText', s:func, [], '')
call s:hi('markdownBlockquote', s:muted, [], s:italic)
call s:hi('markdownListMarker', s:prop, [], '')
hi! link markdownOrderedListMarker markdownListMarker
call s:hi('markdownRule',   s:linenr, [], '')
hi! link htmlH1 markdownH1
hi! link htmlBold markdownBold
hi! link htmlItalic markdownItalic

" Shell
call s:hi('shDeref',        s:type, [], '')
call s:hi('shDerefSimple',  s:type, [], '')
call s:hi('shVariable',     s:fg, [], '')
hi! link shQuote String
hi! link shCommandSub Type

" Vimscript
call s:hi('vimOption',      s:prop, [], '')
call s:hi('vimGroup',       s:fg, [], '')
call s:hi('vimHiGroup',     s:fg, [], '')
hi! link vimCommentTitle SpecialComment

" Rust / Python / Go accents matching the VS Code theme
call s:hi('rustLifetime',   s:orange, [], '')
call s:hi('rustMacro',      s:orange, [], '')
hi! link pythonDecorator Keyword
hi! link pythonDecoratorName Keyword
hi! link pythonSelf Keyword
hi! link goPackage Type

" Git commit
call s:hi('gitcommitSummary', s:fg, [], '')
call s:hi('gitcommitOverflow', s:warn, [], '')
call s:hi('gitcommitComment', s:comment, [], s:italic)
hi! link gitcommitBranch Type

" ----------------------------------------------------------------------------
" Plugins
" ----------------------------------------------------------------------------
call s:hi('GitGutterAdd',    s:string, [], '')
call s:hi('GitGutterChange', s:warn, [], '')
call s:hi('GitGutterDelete', s:error, [], '')
hi! link GitGutterChangeDelete GitGutterChange
hi! link GitSignsAdd GitGutterAdd
hi! link GitSignsChange GitGutterChange
hi! link GitSignsDelete GitGutterDelete
hi! link SignifySignAdd GitGutterAdd
hi! link SignifySignChange GitGutterChange
hi! link SignifySignDelete GitGutterDelete
hi! link ALEErrorSign ErrorMsg
hi! link ALEWarningSign WarningMsg
hi! link CocErrorSign ErrorMsg
hi! link CocWarningSign WarningMsg
call s:hi('CocInfoSign',   s:func, [], '')
call s:hi('CocHintSign',   s:type, [], '')

" ----------------------------------------------------------------------------
" Terminal colors
" ----------------------------------------------------------------------------
if has('nvim')
  for s:i in range(16)
    let g:terminal_color_{s:i} = s:ansi[s:i][0]
  endfor
elseif has('terminal')
  let g:terminal_ansi_colors = map(copy(s:ansi), 'v:val[0]')
endif

" ----------------------------------------------------------------------------
" Neovim: diagnostics, Treesitter, LSP semantic tokens
" ----------------------------------------------------------------------------
if has('nvim')
  call s:hi('DiagnosticError', s:error, [], '')
  call s:hi('DiagnosticWarn',  s:warn, [], '')
  call s:hi('DiagnosticInfo',  s:func, [], '')
  call s:hi('DiagnosticHint',  s:type, [], '')
  call s:hi('DiagnosticOk',    s:string, [], '')
  call s:hi('DiagnosticUnderlineError', [], [], 'undercurl', s:error)
  call s:hi('DiagnosticUnderlineWarn',  [], [], 'undercurl', s:warn)
  call s:hi('DiagnosticUnderlineInfo',  [], [], 'undercurl', s:func)
  call s:hi('DiagnosticUnderlineHint',  [], [], 'undercurl', s:type)
  call s:hi('DiagnosticUnderlineOk',    [], [], 'undercurl', s:string)
  hi! link DiagnosticVirtualTextError DiagnosticError
  hi! link DiagnosticVirtualTextWarn DiagnosticWarn
  hi! link DiagnosticVirtualTextInfo DiagnosticInfo
  hi! link DiagnosticVirtualTextHint DiagnosticHint
  call s:hi('DiagnosticUnnecessary', s:dim, [], '')
  call s:hi('DiagnosticDeprecated', [], [], 'strikethrough')
  call s:hi('LspInlayHint', s:muted, s:bg_panel, '')
  call s:hi('LspReferenceText',  [], s:bg_soft, '')
  hi! link LspReferenceRead LspReferenceText
  hi! link LspReferenceWrite LspReferenceText
  hi! link LspSignatureActiveParameter Visual

  " Treesitter — keep punctuation, operators, and variables plain
  hi! link @variable Identifier
  hi! link @variable.parameter Identifier
  hi! link @variable.builtin Keyword
  call s:hi('@variable.member', s:prop, [], '')
  hi! link @field @variable.member
  hi! link @property @variable.member
  hi! link @punctuation Delimiter
  hi! link @punctuation.bracket Delimiter
  hi! link @punctuation.delimiter Delimiter
  hi! link @punctuation.special Keyword
  hi! link @operator Operator
  hi! link @constant Identifier
  hi! link @constant.builtin Boolean
  hi! link @constant.macro Macro
  hi! link @function Function
  hi! link @function.builtin Function
  hi! link @function.call Function
  hi! link @function.method Function
  hi! link @function.method.call Function
  hi! link @function.macro Macro
  hi! link @constructor Function
  hi! link @keyword Keyword
  hi! link @keyword.operator Keyword
  hi! link @keyword.function Keyword
  hi! link @keyword.return Keyword
  hi! link @keyword.import Keyword
  hi! link @keyword.directive Keyword
  hi! link @string String
  hi! link @string.documentation String
  hi! link @string.escape Special
  hi! link @string.regexp Special
  hi! link @string.special Special
  hi! link @string.special.url Underlined
  hi! link @string.special.symbol String
  hi! link @character String
  hi! link @number Number
  hi! link @boolean Boolean
  hi! link @type Type
  hi! link @type.builtin Type
  hi! link @type.definition Type
  hi! link @module Type
  hi! link @namespace Type
  hi! link @attribute Keyword
  hi! link @decorator Keyword
  hi! link @label Identifier
  hi! link @tag Keyword
  hi! link @tag.builtin Keyword
  hi! link @tag.delimiter Keyword
  call s:hi('@tag.attribute', s:prop, [], '')
  hi! link @comment Comment
  hi! link @comment.todo Todo
  call s:hi('@comment.error', s:error, [], 'bold')
  call s:hi('@comment.warning', s:warn, [], 'bold')
  call s:hi('@comment.note', s:func, [], 'bold')
  hi! link @comment.documentation Comment
  hi! link @markup.heading markdownH1
  hi! link @markup.strong markdownBold
  hi! link @markup.italic markdownItalic
  hi! link @markup.strikethrough markdownRule
  hi! link @markup.raw markdownCode
  hi! link @markup.link markdownLinkText
  hi! link @markup.link.url markdownUrl
  hi! link @markup.link.label markdownLinkText
  hi! link @markup.quote markdownBlockquote
  hi! link @markup.list markdownListMarker
  hi! link @diff.plus Added
  hi! link @diff.minus Removed
  hi! link @diff.delta Changed
  " JSON/YAML/TOML keys are properties
  hi! link @property.json @variable.member
  hi! link @property.yaml @variable.member
  hi! link @property.toml @variable.member

  " LSP semantic tokens (mirror the VS Code semanticTokenColors)
  hi! link @lsp.type.variable Identifier
  hi! link @lsp.type.parameter Identifier
  hi! link @lsp.type.property @variable.member
  hi! link @lsp.type.enumMember Boolean
  hi! link @lsp.type.function Function
  hi! link @lsp.type.method Function
  hi! link @lsp.type.keyword Keyword
  hi! link @lsp.type.selfKeyword Keyword
  hi! link @lsp.type.decorator Keyword
  hi! link @lsp.type.macro Macro
  hi! link @lsp.type.namespace Type
  hi! link @lsp.type.type Type
  hi! link @lsp.type.class Type
  hi! link @lsp.type.struct Type
  hi! link @lsp.type.interface Type
  hi! link @lsp.type.enum Type
  hi! link @lsp.type.typeParameter Type
  hi! link @lsp.type.operator Operator
  hi! link @lsp.type.comment Comment
  hi! link @lsp.mod.deprecated DiagnosticDeprecated
endif
