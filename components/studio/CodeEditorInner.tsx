'use client'

import * as React from 'react'
import Editor, { type BeforeMount, type Monaco, type OnMount } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { glslCompletions } from '@/lib/studio/glsl-completions'
import { wgslCompletions } from '@/lib/studio/wgsl-completions'
import type { CodeEditorDiagnostic } from './CodeEditor'

interface CodeEditorInnerProps {
  code: string
  onChange: (code: string) => void
  onRun?: () => void
  readOnly?: boolean
  language?: 'javascript' | 'glsl' | 'wgsl'
  diagnostic?: CodeEditorDiagnostic | null
  onReadyChange?: (ready: boolean) => void
  onCursorChange?: (line: number, column: number) => void
  onEditorReady?: (ref: { editor: Monaco['editor']['IStandaloneCodeEditor']; monaco: Monaco } | null) => void
}

type CompletionType = 'variable' | 'function' | 'keyword' | 'type'

const P5_COMPLETIONS = [
  { label: 'createCanvas', type: 'function' as const, detail: 'createCanvas(width, height)', info: 'Create a drawing canvas' },
  { label: 'background', type: 'function' as const, detail: 'background(gray | r, g, b)', info: 'Clear the canvas' },
  { label: 'ellipse', type: 'function' as const, detail: 'ellipse(x, y, w, h)', info: 'Draw an ellipse' },
  { label: 'rect', type: 'function' as const, detail: 'rect(x, y, w, h)', info: 'Draw a rectangle' },
  { label: 'line', type: 'function' as const, detail: 'line(x1, y1, x2, y2)', info: 'Draw a line' },
  { label: 'fill', type: 'function' as const, detail: 'fill(r, g, b)', info: 'Set fill color' },
  { label: 'stroke', type: 'function' as const, detail: 'stroke(r, g, b)', info: 'Set stroke color' },
  { label: 'noStroke', type: 'function' as const, detail: 'noStroke()', info: 'Disable stroke drawing' },
  { label: 'noFill', type: 'function' as const, detail: 'noFill()', info: 'Disable fill drawing' },
  { label: 'translate', type: 'function' as const, detail: 'translate(x, y)', info: 'Translate the drawing origin' },
  { label: 'rotate', type: 'function' as const, detail: 'rotate(angle)', info: 'Rotate the drawing context' },
  { label: 'push', type: 'function' as const, detail: 'push()', info: 'Push drawing state' },
  { label: 'pop', type: 'function' as const, detail: 'pop()', info: 'Pop drawing state' },
  { label: 'mouseX', type: 'variable' as const, detail: 'number', info: 'Mouse X position' },
  { label: 'mouseY', type: 'variable' as const, detail: 'number', info: 'Mouse Y position' },
  { label: 'width', type: 'variable' as const, detail: 'number', info: 'Canvas width' },
  { label: 'height', type: 'variable' as const, detail: 'number', info: 'Canvas height' },
  { label: 'frameCount', type: 'variable' as const, detail: 'number', info: 'Current frame count' },
  { label: 'PI', type: 'variable' as const, detail: 'number', info: 'PI constant' },
]

let languagesInitialized = false
let p5CompletionRegistered = false
let p5LibRegistered = false
let themesInitialized = false

function toMonacoKind(monaco: Monaco, type: CompletionType) {
  switch (type) {
    case 'function':
      return monaco.languages.CompletionItemKind.Function
    case 'keyword':
      return monaco.languages.CompletionItemKind.Keyword
    case 'type':
      return monaco.languages.CompletionItemKind.Class
    case 'variable':
    default:
      return monaco.languages.CompletionItemKind.Variable
  }
}

function createWordRange(
  monaco: Monaco,
  model: Monaco['editor']['ITextModel'],
  position: Monaco['Position']
) {
  const word = model.getWordUntilPosition(position)
  return new monaco.Range(
    position.lineNumber,
    word.startColumn,
    position.lineNumber,
    word.endColumn
  )
}

function createCompletionProvider(
  monaco: Monaco,
  items: ReadonlyArray<{ label: string; type: CompletionType; detail?: string; info?: string }>,
  snippets: ReadonlyArray<{ label: string; insertText: string; detail?: string; documentation?: string }>
) {
  return {
    triggerCharacters: ['.', '@', '_'],
    provideCompletionItems(
      model: Monaco['editor']['ITextModel'],
      position: Monaco['Position']
    ) {
      const range = createWordRange(monaco, model, position)

      const itemSuggestions = items.map((item) => ({
        label: item.label,
        kind: toMonacoKind(monaco, item.type),
        insertText: item.label,
        detail: item.detail,
        documentation: item.info,
        range,
      }))

      const snippetSuggestions = snippets.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: snippet.detail ?? 'Snippet',
        documentation: snippet.documentation,
        range,
      }))

      return {
        suggestions: [...snippetSuggestions, ...itemSuggestions],
      }
    },
  }
}

function ensureStudioLanguages(monaco: Monaco) {
  if (languagesInitialized) return
  languagesInitialized = true

  if (!monaco.languages.getLanguages().some((lang: { id: string }) => lang.id === 'glsl')) {
    monaco.languages.register({ id: 'glsl' })
  }
  if (!monaco.languages.getLanguages().some((lang: { id: string }) => lang.id === 'wgsl')) {
    monaco.languages.register({ id: 'wgsl' })
  }

  monaco.languages.setLanguageConfiguration('glsl', {
    comments: { lineComment: '//', blockComment: ['/*', '*/'] },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  })

  monaco.languages.setMonarchTokensProvider('glsl', {
    tokenizer: {
      root: [
        [/#\s*[a-zA-Z_]\w*/, 'keyword'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/\b\d+(\.\d+)?([eE][\-+]?\d+)?\b/, 'number'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
        [/\b(vec[234]|ivec[234]|uvec[234]|bvec[234]|mat[234]|float|int|uint|bool|sampler2D|samplerCube|void)\b/, 'type'],
        [/\b(uniform|varying|attribute|in|out|inout|const|precision|highp|mediump|lowp|return|if|else|for|while|do|break|continue|discard|struct)\b/, 'keyword'],
        [/\b(gl_Position|gl_FragCoord|gl_FragColor|iTime|iResolution|iMouse|iFrame|iDate|iTimeDelta)\b/, 'variable.predefined'],
        [/[a-zA-Z_]\w*/, 'identifier'],
        [/[{}()[\]<>]/, '@brackets'],
        [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],
    },
  })

  monaco.languages.setLanguageConfiguration('wgsl', {
    comments: { lineComment: '//', blockComment: ['/*', '*/'] },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
      ['<', '>'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '<', close: '>' },
      { open: '"', close: '"' },
    ],
  })

  monaco.languages.setMonarchTokensProvider('wgsl', {
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/@[a-zA-Z_]\w*/, 'annotation'],
        [/\b\d+(\.\d+)?([eE][\-+]?\d+)?(u|i|f)?\b/, 'number'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
        [/\b(vec[234][fui]?|mat\d+x\d+f|f32|i32|u32|bool|array|texture_storage_2d|texture_2d|sampler)\b/, 'type'],
        [/\b(fn|struct|var|let|const|return|if|else|for|loop|while|break|continue|discard|override|read|write|read_write|storage|uniform|private|workgroup)\b/, 'keyword'],
        [/[a-zA-Z_]\w*/, 'identifier'],
        [/[{}()[\]<>]/, '@brackets'],
        [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],
    },
  })

  monaco.languages.registerCompletionItemProvider(
    'glsl',
    createCompletionProvider(monaco, glslCompletions, [
      {
        label: 'mainImage',
        detail: 'Snippet',
        documentation: 'Shadertoy-style entry point',
        insertText: [
          'void mainImage(out vec4 fragColor, in vec2 fragCoord) {',
          '  vec2 uv = fragCoord / iResolution.xy;',
          '  fragColor = vec4(uv, 0.5 + 0.5 * sin(iTime), 1.0);',
          '}',
        ].join('\n'),
      },
    ])
  )

  monaco.languages.registerCompletionItemProvider(
    'wgsl',
    createCompletionProvider(monaco, wgslCompletions, [
      {
        label: 'wgsl fragment',
        detail: 'Snippet',
        documentation: 'WGSL full-screen fragment entry points',
        insertText: [
          '@vertex',
          'fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {',
          '  var pos = array<vec2f, 6>(',
          '    vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),',
          '    vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1),',
          '  );',
          '  return vec4f(pos[idx], 0.0, 1.0);',
          '}',
          '',
          '@fragment',
          'fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {',
          '  let uv = pos.xy / vec2f(${1:800.0}, ${2:600.0});',
          '  return vec4f(uv, 0.5, 1.0);',
          '}',
        ].join('\n'),
      },
      {
        label: 'wgsl compute',
        detail: 'Snippet',
        documentation: 'WGSL compute shader entry point',
        insertText: [
          '@compute @workgroup_size(${1:8}, ${2:8})',
          'fn main(@builtin(global_invocation_id) id: vec3u) {',
          '  let _gid = id;',
          '  ${0}',
          '}',
        ].join('\n'),
      },
    ])
  )

  if (!p5CompletionRegistered) {
    p5CompletionRegistered = true
    monaco.languages.registerCompletionItemProvider(
      'javascript',
      createCompletionProvider(monaco, P5_COMPLETIONS, [
        {
          label: 'p5 setup/draw',
          detail: 'Snippet',
          documentation: 'Default p5.js sketch skeleton',
          insertText: [
            'function setup() {',
            '  createCanvas(${1:400}, ${2:400});',
            '}',
            '',
            'function draw() {',
            '  background(${3:220});',
            '  ${0}',
            '}',
          ].join('\n'),
        },
      ])
    )
  }

  try {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })

    if (!p5LibRegistered) {
      p5LibRegistered = true
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        `
declare const mouseX: number;
declare const mouseY: number;
declare const width: number;
declare const height: number;
declare const frameCount: number;
declare const PI: number;
declare function createCanvas(width: number, height: number): void;
declare function background(...args: number[]): void;
declare function ellipse(x: number, y: number, w: number, h?: number): void;
declare function rect(x: number, y: number, w: number, h: number): void;
declare function line(x1: number, y1: number, x2: number, y2: number): void;
declare function fill(...args: number[]): void;
declare function stroke(...args: number[]): void;
declare function noStroke(): void;
declare function noFill(): void;
declare function translate(x: number, y: number): void;
declare function rotate(angle: number): void;
declare function push(): void;
declare function pop(): void;
declare function sin(value: number): number;
declare function cos(value: number): number;
declare function noise(...args: number[]): number;
        `,
        'ts:studio-p5-globals.d.ts'
      )
    }
  } catch {
    // Monaco language worker may not be available in every environment.
  }
}

function defineStudioThemes(monaco: Monaco) {
  if (themesInitialized) return
  themesInitialized = true

  monaco.editor.defineTheme('studio-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'variable.predefined', foreground: '9CDCFE' },
      { token: 'annotation', foreground: 'DCDCAA' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'operator', foreground: 'd4d4d4' },
    ],
    colors: {
      'editor.background': '#080810',
      'editor.foreground': '#d4d4d8',
      'editor.lineHighlightBackground': '#1a1a30',
      'editor.lineHighlightBorder': '#ffffff08',
      'editorLineNumber.foreground': '#3a3a5a',
      'editorLineNumber.activeForeground': '#8b8bab',
      'editor.selectionBackground': '#264f7880',
      'editorCursor.foreground': '#818cf8',
      'editor.findMatchHighlightBackground': '#fbbf2430',
      'editorBracketMatch.background': '#818cf820',
      'editorBracketMatch.border': '#818cf840',
      'editorIndentGuide.background': '#ffffff08',
      'editorIndentGuide.activeBackground': '#ffffff15',
      'editorOverviewRuler.border': '#00000000',
      'scrollbar.shadow': '#00000000',
      'editorGutter.background': '#080810',
    },
  })

  monaco.editor.defineTheme('studio-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'AF00DB' },
      { token: 'type', foreground: '267f99' },
      { token: 'variable.predefined', foreground: '001080' },
      { token: 'annotation', foreground: '795E26' },
      { token: 'number', foreground: '087F4C' },
      { token: 'string', foreground: 'A31515' },
      { token: 'operator', foreground: '1e1e1e' },
    ],
    colors: {
      'editor.background': '#fafafa',
      'editor.foreground': '#1e1e1e',
      'editor.lineHighlightBackground': '#f5f5ff',
      'editor.lineHighlightBorder': '#00000008',
      'editorLineNumber.foreground': '#b0b0c0',
      'editorLineNumber.activeForeground': '#505070',
      'editor.selectionBackground': '#add6ff80',
      'editorCursor.foreground': '#4f46e5',
      'editor.findMatchHighlightBackground': '#fbbf2430',
      'editorBracketMatch.background': '#4f46e520',
      'editorBracketMatch.border': '#4f46e540',
      'editorIndentGuide.background': '#00000008',
      'editorIndentGuide.activeBackground': '#00000015',
      'editorOverviewRuler.border': '#00000000',
      'scrollbar.shadow': '#00000000',
      'editorGutter.background': '#fafafa',
    },
  })
}

function useStableEditorPath(language: CodeEditorInnerProps['language']) {
  const idRef = React.useRef<string | null>(null)
  if (!idRef.current) {
    idRef.current = `editor-${Math.random().toString(36).slice(2)}`
  }

  const ext = language === 'glsl' ? 'glsl' : language === 'wgsl' ? 'wgsl' : 'js'
  return `inmemory://studio/${idRef.current}.${ext}`
}

function markerRangeForLine(model: Monaco['editor']['ITextModel'], lineNumber: number) {
  const line = Math.max(1, Math.min(lineNumber, model.getLineCount()))
  const contentLength = model.getLineContent(line).length
  return {
    startLineNumber: line,
    startColumn: 1,
    endLineNumber: line,
    endColumn: Math.max(2, contentLength + 1),
  }
}

export function CodeEditorInner({
  code,
  onChange,
  onRun,
  readOnly = false,
  language = 'javascript',
  diagnostic,
  onReadyChange,
  onCursorChange,
  onEditorReady,
}: CodeEditorInnerProps) {
  const { resolvedTheme } = useTheme()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const editorRef = React.useRef<Monaco['editor']['IStandaloneCodeEditor'] | null>(null)
  const monacoRef = React.useRef<Monaco | null>(null)
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null)
  const testHostRef = React.useRef<
    (HTMLElement & {
      __studioMonacoSetValue?: (value: string) => void
      __studioMonacoGetValue?: () => string
    }) | null
  >(null)
  const onRunRef = React.useRef(onRun)
  onRunRef.current = onRun

  const onCursorChangeRef = React.useRef(onCursorChange)
  onCursorChangeRef.current = onCursorChange

  const onEditorReadyRef = React.useRef(onEditorReady)
  onEditorReadyRef.current = onEditorReady

  const cmdActionRef = React.useRef<{ dispose(): void } | null>(null)
  const cursorDisposableRef = React.useRef<{ dispose(): void } | null>(null)

  const path = useStableEditorPath(language)
  const monacoLanguage = language

  const options = React.useMemo(() => ({
    readOnly,
    automaticLayout: true,
    wordWrap: 'on' as const,
    minimap: { enabled: false },
    smoothScrolling: true,
    scrollBeyondLastLine: false,
    lineNumbersMinChars: 3,
    roundedSelection: true,
    padding: { top: 12, bottom: 12 },
    fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
    fontLigatures: true,
    fontSize: 13,
    tabSize: 2,
    insertSpaces: true,
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: 'active' as const,
      indentation: true,
    },
    stickyScroll: { enabled: false },
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    overviewRulerBorder: false,
  }), [readOnly])

  const beforeMount = React.useCallback<BeforeMount>((monaco) => {
    ensureStudioLanguages(monaco)
    defineStudioThemes(monaco)
  }, [])

  const onMount = React.useCallback<OnMount>((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    onEditorReadyRef.current?.({ editor, monaco })

    const runCommand = () => {
      onRunRef.current?.()
    }

    cmdActionRef.current = editor.addAction({
      id: 'studio.run',
      label: 'Run Sketch',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: runCommand,
    })

    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelMarkers(model, 'studio-editor', [])
    }

    cursorDisposableRef.current = editor.onDidChangeCursorPosition((e) => {
      onCursorChangeRef.current?.(e.position.lineNumber, e.position.column)
    })

    const host = containerRef.current?.closest('[data-testid="code-editor"]') as
      | (HTMLElement & {
          __studioMonacoSetValue?: (value: string) => void
          __studioMonacoGetValue?: () => string
        })
      | null
    if (host) {
      host.__studioMonacoSetValue = (value: string) => {
        const currentModel = editor.getModel()
        if (!currentModel) return
        editor.executeEdits('studio-e2e', [
          {
            range: currentModel.getFullModelRange(),
            text: value,
            forceMoveMarkers: true,
          },
        ])
        editor.setPosition({ lineNumber: 1, column: 1 })
        editor.revealPositionInCenter({ lineNumber: 1, column: 1 })
      }
      host.__studioMonacoGetValue = () => editor.getValue()
      testHostRef.current = host
    }

    const relayout = () => {
      editor.layout()
      const width = containerRef.current?.clientWidth ?? 0
      editor.updateOptions({
        minimap: { enabled: width >= 860 },
      })
    }

    const frame = requestAnimationFrame(relayout)

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        relayout()
      })
      resizeObserverRef.current.observe(containerRef.current)
    }

    onReadyChange?.(true)

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [onReadyChange])

  React.useEffect(() => {
    return () => {
      cmdActionRef.current?.dispose()
      cmdActionRef.current = null
      cursorDisposableRef.current?.dispose()
      cursorDisposableRef.current = null
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      if (testHostRef.current) {
        delete testHostRef.current.__studioMonacoSetValue
        delete testHostRef.current.__studioMonacoGetValue
      }
      testHostRef.current = null
      onEditorReadyRef.current?.(null)
      editorRef.current = null
      monacoRef.current = null
      onReadyChange?.(false)
    }
  }, [onReadyChange])

  React.useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const frame = requestAnimationFrame(() => {
      editor.layout()
    })

    return () => cancelAnimationFrame(frame)
  }, [resolvedTheme, language, readOnly])

  React.useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    const model = editor.getModel()
    if (!model) return

    const canMarkLine =
      (language === 'glsl' || language === 'wgsl') &&
      Boolean(diagnostic?.message) &&
      typeof diagnostic?.line === 'number'

    if (!canMarkLine) {
      monaco.editor.setModelMarkers(model, 'studio-editor', [])
      return
    }

    const range = markerRangeForLine(model, diagnostic!.line as number)
    monaco.editor.setModelMarkers(model, 'studio-editor', [
      {
        ...range,
        message: diagnostic!.message,
        severity: monaco.MarkerSeverity.Error,
        source: 'Studio',
      },
    ])
  }, [diagnostic, language, code])

  const theme = resolvedTheme === 'dark' ? 'studio-dark' : 'studio-light'

  return (
    <div ref={containerRef} className="h-full w-full">
      <Editor
        value={code}
        language={monacoLanguage}
        path={path}
        theme={theme}
        onChange={(value) => onChange(value ?? '')}
        beforeMount={beforeMount}
        onMount={onMount}
        options={options}
        width="100%"
        height="100%"
      />
    </div>
  )
}
