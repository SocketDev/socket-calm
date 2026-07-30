#!/usr/bin/env node
// Renders the README preview images from the theme JSON, so a screenshot can
// never drift from the actual colors. Needs Google Chrome for the screenshot
// step; writes images/preview-{dark,light}.png.
//
// Run with: npm run previews

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find(p => existsSync(p))

if (!CHROME) {
  console.error('No Chrome/Chromium found — cannot render previews.')
  process.exit(1)
}

const WIDTH = 1160
const HEIGHT = 700

// Token class -> the tokenColors rule name that owns it, so the mapping below
// stays honest about which theme rule each class is pulling from.
const TOKEN_RULES = {
  kw: 'Keywords, control flow, storage',
  fn: 'Functions and methods',
  pr: 'Object keys and properties',
  st: 'Strings',
  nu: 'Numbers, booleans, and language constants',
  ty: 'Types, classes, interfaces, enums',
  cm: 'Comments',
  pl: 'Plain text and punctuation',
}

// The sample is hand-tokenized to match what the TextMate scopes + semantic
// tokens in these themes actually produce for TypeScript.
const CODE = String.raw`<span class="kw">import</span> { <span class="fn">readFile</span> } <span class="kw">from</span> <span class="st">'node:fs/promises'</span>
<span class="kw">import type</span> { <span class="ty">Manifest</span>, <span class="ty">Advisory</span> } <span class="kw">from</span> <span class="st">'./types'</span>

<span class="kw">const</span> REGISTRY = <span class="st">'https://registry.npmjs.org'</span>
<span class="kw">const</span> MAX_DEPTH = <span class="nu">12</span>

<span class="cm">/** Walks the dependency tree and flags anything with a known advisory. */</span>
<span class="kw">export async function</span> <span class="fn">audit</span>(root: <span class="ty">string</span>): <span class="ty">Promise</span>&lt;<span class="ty">Advisory</span>[]&gt; {
  <span class="kw">const</span> manifest: <span class="ty">Manifest</span> = <span class="ty">JSON</span>.<span class="fn">parse</span>(<span class="kw">await</span> <span class="fn">readFile</span>(root, <span class="st">'utf8'</span>))
  <span class="kw">const</span> findings: <span class="ty">Advisory</span>[] = []

  <span class="kw">for</span> (<span class="kw">const</span> [name, range] <span class="kw">of</span> <span class="ty">Object</span>.<span class="fn">entries</span>(manifest.<span class="pr">dependencies</span> ?? {})) {
    <span class="kw">const</span> meta = <span class="kw">await</span> <span class="fn">fetch</span>(<span class="st">&#96;</span><span class="kw">&#36;{</span>REGISTRY<span class="kw">}</span><span class="st">/</span><span class="kw">&#36;{</span>name<span class="kw">}</span><span class="st">&#96;</span>).<span class="fn">then</span>(r =&gt; r.<span class="fn">json</span>())

    <span class="kw">if</span> (meta.<span class="pr">deprecated</span> === <span class="nu">true</span>) {
      findings.<span class="fn">push</span>({ <span class="pr">name</span>, <span class="pr">range</span>, <span class="pr">severity</span>: <span class="st">'low'</span>, <span class="pr">reason</span>: <span class="st">'deprecated'</span> })
    }
  }

  <span class="cm">// Install scripts are the highest-signal supply chain risk.</span>
  <span class="kw">return</span> findings.<span class="fn">filter</span>(f =&gt; f.<span class="pr">severity</span> !== <span class="st">'low'</span> || !f.<span class="pr">suppressed</span>)
}`

const LINE_COUNT = CODE.split('\n').length

// Activity bar glyphs: explorer, search, source control, run.
const GLYPHS = [
  '<path d="M4 4.5h6l1.5 2H20v13H4z"/>',
  '<circle cx="10.5" cy="10.5" r="5.5"/><path d="M14.5 14.5 20 20"/>',
  '<circle cx="7" cy="6" r="2.2"/><circle cx="7" cy="18" r="2.2"/>' +
    '<circle cx="17" cy="9.5" r="2.2"/><path d="M7 8.2v7.6M9.2 6h3.4a2.2 2.2 0 0 1 2.2 2.2v0"/>',
  '<circle cx="12" cy="12" r="8"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
]
const ICONS = GLYPHS.map(
  (d, i) =>
    `<div class="ico${i === 0 ? ' on' : ''}"><svg viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.6" stroke-linecap="round" ` +
    `stroke-linejoin="round">${d}</svg></div>`,
).join('')

const FILES = [
  ['audit.ts', 'mod'],
  ['manifest.ts', ''],
  ['types.d.ts', ''],
  ['registry.ts', 'add'],
  ['index.ts', ''],
]

function buildHtml(theme) {
  const c = theme.colors
  const tok = {}
  for (const rule of theme.tokenColors) {
    if (rule.settings.foreground) tok[rule.name] = rule.settings
  }
  const cls = Object.entries(TOKEN_RULES)
    .map(([k, ruleName]) => {
      const s = tok[ruleName]
      if (!s) throw new Error(`preview references missing token rule: ${ruleName}`)
      const style = s.fontStyle?.includes('italic') ? 'font-style:italic;' : ''
      return `.${k}{color:${s.foreground};${style}}`
    })
    .join('\n')

  const gutter = Array.from({ length: LINE_COUNT }, (_, i) => i + 1)
    .map(n => `<div${n === 16 ? ' class="cur"' : ''}>${n}</div>`)
    .join('')

  const tree = FILES.map(([name, kind]) => {
    const color =
      kind === 'mod'
        ? c['gitDecoration.modifiedResourceForeground']
        : kind === 'add'
          ? c['gitDecoration.untrackedResourceForeground']
          : c['sideBar.foreground']
    const badge = kind === 'mod' ? 'M' : kind === 'add' ? 'U' : ''
    const active = name === 'audit.ts'
    return `<div class="row${active ? ' sel' : ''}" style="color:${color}">
      <span>${name}</span><span class="badge">${badge}</span></div>`
  }).join('')

  return `<!doctype html>
<meta charset="utf-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;
    font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
    background:${c['editor.background']}}
  .win{display:flex;flex-direction:column;height:100%}
  .title{height:36px;flex:none;display:flex;align-items:center;gap:8px;padding:0 12px;
    background:${c['titleBar.activeBackground']};color:${c['titleBar.activeForeground']};
    border-bottom:1px solid ${c['titleBar.border']}}
  .dot{width:11px;height:11px;border-radius:50%}
  .center{margin:0 auto;display:flex;align-items:center;gap:8px;
    background:${c['commandCenter.background']};color:${c['commandCenter.foreground']};
    border:1px solid ${c['commandCenter.border']};border-radius:6px;
    padding:3px 40px;font-size:11.5px}
  .body{flex:1;display:flex;min-height:0}
  .act{width:48px;flex:none;display:flex;flex-direction:column;align-items:center;gap:18px;
    padding-top:14px;background:${c['activityBar.background']};
    border-right:1px solid ${c['activityBar.border']}}
  .ico{width:24px;height:24px;position:relative;color:${c['activityBar.inactiveForeground']}}
  .ico svg{display:block;width:24px;height:24px}
  .ico.on{color:${c['activityBar.foreground']}}
  .ico.on::before{content:"";position:absolute;left:-12px;top:-3px;width:2px;height:30px;
    background:${c['activityBar.activeBorder']};border-radius:1px}
  .side{width:216px;flex:none;display:flex;flex-direction:column;
    background:${c['sideBar.background']};border-right:1px solid ${c['sideBar.border']}}
  .sect{padding:8px 14px;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;
    color:${c['sideBarTitle.foreground']};
    background:${c['sideBarSectionHeader.background']};
    border-bottom:1px solid ${c['sideBarSectionHeader.border']}}
  .row{display:flex;align-items:center;justify-content:space-between;
    padding:4px 14px 4px 26px;font-size:12.5px}
  .row.sel{background:${c['list.activeSelectionBackground']};
    color:${c['list.activeSelectionForeground']}!important}
  .badge{font-size:11px;opacity:.9}
  .main{flex:1;display:flex;flex-direction:column;min-width:0}
  .tabs{height:35px;flex:none;display:flex;background:${c['editorGroupHeader.tabsBackground']};
    border-bottom:1px solid ${c['editorGroupHeader.tabsBorder']}}
  .tab{display:flex;align-items:center;padding:0 16px;font-size:12.5px;
    background:${c['tab.inactiveBackground']};color:${c['tab.inactiveForeground']};
    border-right:1px solid ${c['tab.border']}}
  .tab.on{background:${c['tab.activeBackground']};color:${c['tab.activeForeground']};
    box-shadow:inset 0 2px 0 ${c['tab.activeBorderTop']}}
  .crumbs{flex:none;padding:5px 18px;font-size:11.5px;
    background:${c['breadcrumb.background']};color:${c['breadcrumb.foreground']}}
  .crumbs b{color:${c['breadcrumb.activeSelectionForeground']};font-weight:400}
  .ed{flex:1;display:flex;overflow:hidden;background:${c['editor.background']};
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    font-size:13.5px;line-height:22px}
  .gut{flex:none;text-align:right;padding:14px 14px 0 18px;
    color:${c['editorLineNumber.foreground']};user-select:none}
  .gut .cur{color:${c['editorLineNumber.activeForeground']}}
  .code{flex:1;padding:14px 0 0 0;white-space:pre;color:${c['editor.foreground']};
    position:relative;overflow:hidden}
  .code .hl{position:absolute;left:0;right:0;height:22px;top:${14 + 15 * 22}px;
    background:${c['editor.lineHighlightBackground']}}
  .code pre{position:relative}
  ${cls}
  .status{height:24px;flex:none;display:flex;align-items:center;gap:18px;padding:0 14px;
    font-size:11.5px;background:${c['statusBar.background']};color:${c['statusBar.foreground']};
    border-top:1px solid ${c['statusBar.border']}}
  .status .err{color:${c['statusBarItem.errorForeground']}}
  .status .warn{color:${c['statusBarItem.warningForeground']}}
  .spacer{flex:1}
</style>
<div class="win">
  <div class="title">
    <span class="dot" style="background:${c['editorError.foreground']}"></span>
    <span class="dot" style="background:${c['editorWarning.foreground']}"></span>
    <span class="dot" style="background:${c['gitDecoration.untrackedResourceForeground']}"></span>
    <span class="center">socket-calm — audit.ts</span>
  </div>
  <div class="body">
    <div class="act">${ICONS}</div>
    <div class="side">
      <div class="sect">Explorer</div>
      <div style="padding-top:4px;color:${c['sideBar.foreground']}">${tree}</div>
    </div>
    <div class="main">
      <div class="tabs">
        <div class="tab on">audit.ts</div>
        <div class="tab">types.d.ts</div>
      </div>
      <div class="crumbs">src &nbsp;›&nbsp; audit.ts &nbsp;›&nbsp; <b>audit</b></div>
      <div class="ed">
        <div class="gut">${gutter}</div>
        <div class="code"><div class="hl"></div><pre>${CODE}</pre></div>
      </div>
      <div class="status">
        <span>main*</span>
        <span class="err">✗ 0</span><span class="warn">⚠ 2</span>
        <span class="spacer"></span>
        <span>Ln 16, Col 42</span><span>Spaces: 2</span><span>UTF-8</span><span>TypeScript</span>
      </div>
    </div>
  </div>
</div>`
}

for (const variant of ['dark', 'light']) {
  const theme = JSON.parse(
    readFileSync(join(root, `themes/socket-calm-${variant}-color-theme.json`), 'utf8'),
  )
  const html = buildHtml(theme)
  const htmlPath = join(tmpdir(), `socket-calm-preview-${variant}.html`)
  const out = join(root, `images/preview-${variant}.png`)
  writeFileSync(htmlPath, html)
  execFileSync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${out}`,
    `file://${htmlPath}`,
  ], { stdio: 'pipe' })
  rmSync(htmlPath)
  console.log(`wrote images/preview-${variant}.png`)
}
