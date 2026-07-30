#!/usr/bin/env node
// Validates both Socket Calm themes: JSON shape, hex syntax, duplicate keys,
// and WCAG contrast for every foreground/background pair the UI actually renders.
//
// Run with: pnpm run validate

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const themes = [
  'themes/socket-calm-dark-color-theme.json',
  'themes/socket-calm-light-color-theme.json',
]

// Optional stricter pass: if VS Code is installed locally, confirm every color id
// we set is actually registered. Unknown ids are silently ignored by VS Code,
// so this catches typos that would otherwise just do nothing.
const vscodeBundle = [
  '/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/workbench.desktop.main.js',
  '/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js',
].find(p => existsSync(p))
const gitExt = [
  '/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/git/package.json',
  '/usr/share/code/resources/app/extensions/git/package.json',
].find(p => existsSync(p))

let knownIds = null
if (vscodeBundle) {
  let src = readFileSync(vscodeBundle, 'utf8')
  if (gitExt) src += readFileSync(gitExt, 'utf8')
  knownIds = new Set(
    [...src.matchAll(/["']([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*)["']/g)].map(m => m[1]),
  )
}

const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const FONT_STYLES = new Set(['italic', 'bold', 'underline', 'strikethrough'])

const toRgb = hex => {
  let h = hex.slice(1)
  if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map(c => c + c).join('')
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
}
const toAlpha = hex => {
  const h = hex.slice(1)
  if (h.length === 8) return parseInt(h.slice(6, 8), 16) / 255
  if (h.length === 4) return parseInt(h[3] + h[3], 16) / 255
  return 1
}
// Composite a possibly-translucent color over an opaque one.
const over = (fg, bg) => {
  const a = toAlpha(fg)
  const f = toRgb(fg)
  const b = toRgb(bg)
  const c = [0, 1, 2].map(i => Math.round(255 * (f[i] * a + b[i] * (1 - a))))
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')
}
const luminance = hex => {
  const [r, g, b] = toRgb(hex).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

// [foreground id, background id, minimum ratio, human label]
const PAIRS = [
  ['editor.foreground', 'editor.background', 4.5, 'editor text'],
  ['editorLineNumber.foreground', 'editor.background', 3, 'line numbers'],
  ['editorLineNumber.activeForeground', 'editor.background', 4.5, 'active line number'],
  ['editorCodeLens.foreground', 'editor.background', 3, 'code lens'],
  ['editorInlayHint.foreground', 'editorInlayHint.background', 3, 'inlay hint'],
  ['editorGhostText.foreground', 'editor.background', 2.5, 'ghost text'],
  ['sideBar.foreground', 'sideBar.background', 4.5, 'sidebar text'],
  ['sideBarTitle.foreground', 'sideBar.background', 3, 'sidebar title'],
  ['sideBarSectionHeader.foreground', 'sideBarSectionHeader.background', 4.5, 'section header'],
  ['list.activeSelectionForeground', 'list.activeSelectionBackground', 4.5, 'list active selection'],
  ['list.inactiveSelectionForeground', 'list.inactiveSelectionBackground', 4.5, 'list inactive selection'],
  ['list.hoverForeground', 'list.hoverBackground', 4.5, 'list hover'],
  ['list.deemphasizedForeground', 'sideBar.background', 3, 'list deemphasized'],
  ['activityBar.foreground', 'activityBar.background', 4.5, 'activity bar icon'],
  ['activityBar.inactiveForeground', 'activityBar.background', 3, 'activity bar inactive'],
  ['activityBarBadge.foreground', 'activityBarBadge.background', 4.5, 'activity bar badge'],
  ['badge.foreground', 'badge.background', 4.5, 'badge'],
  ['button.foreground', 'button.background', 4.5, 'button'],
  ['button.secondaryForeground', 'button.secondaryBackground', 4.5, 'secondary button'],
  ['extensionButton.prominentForeground', 'extensionButton.prominentBackground', 4.5, 'extension button'],
  ['statusBar.foreground', 'statusBar.background', 4.5, 'status bar'],
  ['statusBar.debuggingForeground', 'statusBar.debuggingBackground', 4.5, 'status bar debugging'],
  ['statusBarItem.errorForeground', 'statusBarItem.errorBackground', 4.5, 'status bar error'],
  ['statusBarItem.warningForeground', 'statusBarItem.warningBackground', 4.5, 'status bar warning'],
  ['statusBarItem.remoteForeground', 'statusBarItem.remoteBackground', 4.5, 'status bar remote'],
  ['statusBarItem.prominentForeground', 'statusBarItem.prominentBackground', 4.5, 'status bar prominent'],
  ['titleBar.activeForeground', 'titleBar.activeBackground', 4.5, 'title bar'],
  ['titleBar.inactiveForeground', 'titleBar.inactiveBackground', 3, 'title bar inactive'],
  ['tab.activeForeground', 'tab.activeBackground', 4.5, 'active tab'],
  ['tab.inactiveForeground', 'tab.inactiveBackground', 3, 'inactive tab'],
  ['panelTitle.activeForeground', 'panel.background', 4.5, 'panel title active'],
  ['panelTitle.inactiveForeground', 'panel.background', 3, 'panel title inactive'],
  ['terminal.foreground', 'terminal.background', 4.5, 'terminal text'],
  ['input.foreground', 'input.background', 4.5, 'input text'],
  ['input.placeholderForeground', 'input.background', 3, 'input placeholder'],
  ['dropdown.foreground', 'dropdown.background', 4.5, 'dropdown'],
  ['menu.foreground', 'menu.background', 4.5, 'menu'],
  ['menu.selectionForeground', 'menu.selectionBackground', 4.5, 'menu selected'],
  ['quickInput.foreground', 'quickInput.background', 4.5, 'quick input'],
  ['quickInputList.focusForeground', 'quickInputList.focusBackground', 4.5, 'quick input focus'],
  ['editorWidget.foreground', 'editorWidget.background', 4.5, 'editor widget'],
  ['editorSuggestWidget.foreground', 'editorSuggestWidget.background', 4.5, 'suggest widget'],
  ['editorSuggestWidget.selectedForeground', 'editorSuggestWidget.selectedBackground', 4.5, 'suggest selected'],
  ['editorHoverWidget.foreground', 'editorHoverWidget.background', 4.5, 'hover widget'],
  ['breadcrumb.foreground', 'breadcrumb.background', 3, 'breadcrumb'],
  ['breadcrumb.focusForeground', 'breadcrumb.background', 4.5, 'breadcrumb focus'],
  ['peekViewResult.fileForeground', 'peekViewResult.background', 4.5, 'peek file'],
  ['peekViewResult.lineForeground', 'peekViewResult.background', 3, 'peek line'],
  ['notifications.foreground', 'notifications.background', 4.5, 'notification'],
  ['keybindingLabel.foreground', 'keybindingLabel.background', 4.5, 'keybinding label'],
  ['commandCenter.foreground', 'commandCenter.background', 4.5, 'command center'],
  ['banner.foreground', 'banner.background', 4.5, 'banner'],
  ['descriptionForeground', 'editor.background', 3, 'description text'],
  ['errorForeground', 'editor.background', 3, 'error text'],
  ['textLink.foreground', 'editor.background', 4.5, 'text link'],
  ['editorError.foreground', 'editor.background', 3, 'error squiggle'],
  ['editorWarning.foreground', 'editor.background', 3, 'warning squiggle'],
  ['editorInfo.foreground', 'editor.background', 3, 'info squiggle'],
  ['debugTokenExpression.value', 'editorWidget.background', 4.5, 'debug value'],
  ['debugView.stateLabelForeground', 'debugView.stateLabelBackground', 4.5, 'debug state label'],
  ['testing.coverCountBadgeForeground', 'testing.coverCountBadgeBackground', 4.5, 'coverage badge'],
]

// Every token color must clear WCAG AA-large (3:1) against the editor background.
const MIN_TOKEN_CONTRAST = 3

const ANSI = ['Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan']

let failed = false
const fail = msg => {
  failed = true
  console.log(`  ✗ ${msg}`)
}

for (const rel of themes) {
  const path = join(root, rel)
  const raw = readFileSync(path, 'utf8')
  let theme
  try {
    theme = JSON.parse(raw)
  } catch (err) {
    console.log(`\n=== ${basename(rel)} ===`)
    fail(`invalid JSON: ${err.message}`)
    continue
  }
  const colors = theme.colors
  const bg = colors['editor.background']
  console.log(`\n=== ${theme.name} (${theme.type}) ===`)
  console.log(
    `  ${Object.keys(colors).length} color keys, ${theme.tokenColors.length} token rules, ` +
      `${Object.keys(theme.semanticTokenColors).length} semantic entries`,
  )

  // Duplicate keys survive JSON.parse silently (last wins), so scan the text.
  const block = raw.split('"colors": {')[1].split('\n  },')[0]
  const keys = [...block.matchAll(/^\s*"([^"]+)":/gm)].map(m => m[1])
  const dupes = [...new Set(keys.filter(k => keys.filter(x => x === k).length > 1))]
  if (dupes.length) fail(`duplicate color keys: ${dupes.join(', ')}`)

  for (const [k, v] of Object.entries(colors)) {
    if (!HEX.test(v)) fail(`malformed hex for ${k}: ${v}`)
  }

  if (knownIds) {
    const unknown = Object.keys(colors).filter(k => !knownIds.has(k))
    if (unknown.length) fail(`unregistered color ids: ${unknown.join(', ')}`)
    else console.log(`  ✓ all color ids registered in VS Code`)
  } else {
    console.log('  – skipped color-id check (no local VS Code install found)')
  }

  const seenScopes = new Map()
  for (const rule of theme.tokenColors) {
    const s = rule.settings
    if (!s) {
      fail(`token rule "${rule.name}" has no settings`)
      continue
    }
    if (s.foreground) {
      if (!HEX.test(s.foreground)) fail(`token "${rule.name}" bad hex ${s.foreground}`)
      else {
        const ratio = contrast(over(s.foreground, bg), bg)
        if (ratio < MIN_TOKEN_CONTRAST)
          fail(`token "${rule.name}" only ${ratio.toFixed(2)}:1 on editor background`)
      }
    }
    for (const part of (s.fontStyle ?? '').split(' ').filter(Boolean)) {
      if (!FONT_STYLES.has(part)) fail(`token "${rule.name}" bad fontStyle "${part}"`)
    }
    const scopes = typeof rule.scope === 'string' ? [rule.scope] : (rule.scope ?? [])
    for (const sc of scopes) {
      if (seenScopes.has(sc))
        fail(`scope "${sc}" claimed twice: "${seenScopes.get(sc)}" then "${rule.name}"`)
      seenScopes.set(sc, rule.name)
    }
  }
  console.log(`  ✓ ${seenScopes.size} distinct scopes, no collisions`)

  for (const [k, v] of Object.entries(theme.semanticTokenColors)) {
    const val = typeof v === 'string' ? v : v.foreground
    if (val != null && !HEX.test(val)) fail(`semantic "${k}" bad hex ${val}`)
  }

  let low = 0
  for (const [fk, bk, min, label] of PAIRS) {
    if (!(fk in colors) || !(bk in colors)) {
      fail(`contrast pair references missing key: ${fk} / ${bk}`)
      low++
      continue
    }
    const base = over(colors[bk], bg)
    const ratio = contrast(over(colors[fk], base), base)
    if (ratio < min) {
      fail(`${label}: ${ratio.toFixed(2)}:1 (needs ${min}:1) — ${colors[fk]} on ${colors[bk]}`)
      low++
    }
  }
  console.log(`  ✓ ${PAIRS.length - low}/${PAIRS.length} UI contrast pairs pass`)

  const termBg = over(colors['terminal.background'], bg)
  for (const name of ANSI) {
    for (const prefix of ['terminal.ansi', 'terminal.ansiBright']) {
      const key = prefix + name
      const ratio = contrast(over(colors[key], termBg), termBg)
      if (ratio < 3) fail(`${key}: ${ratio.toFixed(2)}:1 on terminal background`)
    }
  }
  console.log('  ✓ all chromatic ANSI colors ≥ 3:1 on terminal background')
}

console.log(failed ? '\nFAILED' : '\nAll checks passed.')
process.exit(failed ? 1 : 0)
