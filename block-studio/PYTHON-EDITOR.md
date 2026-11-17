# Block Studio Python workspace

## Open the updated application

On Windows, double-click `START.cmd`, then open **http://localhost:5500/?editor=python**.
Python 3 must be installed on your computer. Alternatively run `python server.py` from this directory. The existing home page also offers **Py Editor**, and the Python tab opens the same workspace.

Use the supplied server: it serves JavaScript modules with the correct MIME type on Windows. Opening index.html directly as a file does not support workers. VS Code Live Server can also serve the project if `.mjs` files have a JavaScript MIME type.

## What changed

- Purple and white Python workspace based on the supplied reference, retaining Block Studio branding and existing artwork.
- Editable Python files, line numbers, syntax coloring, automatic indentation, comment toggle, font sizing, search, undo and redo, and cursor position.
- Create, rename, delete, restore, import and download `.py` files. Edit > Restore recovers the most recently deleted Python file during the current session. File prompts use accessible in-app dialogs. Python project JSON exports contain every Python file and the project name. The File menu operates on Python projects while the Python tab is active.
- Browser-local recovery with visible save status. Python and block projects use separate storage keys.
- Real CPython via the bundled Pyodide 314.0.8 distribution, running in a module Web Worker. No CDN request is needed for core Python execution.
- Run active file, Run All, stop, stdout/stderr, Python tracebacks with source filenames, execution logs, clear output, and REPL.
- Sprite bridge for movement, rotation, speech, visibility, size, costume changes and edge detection. Existing sprite property controls remain available.
- API help, walking example and keyboard shortcuts inside the workspace.
- Local server supplies `.mjs` and WebAssembly MIME types and binds to the configured host.

## Execution model

Run starts a fresh user namespace. Run All executes Stage.py first and then other files in the order shown in Project Files, sharing a namespace. It executes each file as an entry script; helper files imported by another entry can also execute as entries under Run All. Prefer Run on your main file when using imported helper modules.

Files can import each other from the virtual `/studio` directory. REPL expressions and statements share variables from the last successful run. Stop terminates the worker, so it works for infinite loops and resets REPL state. Leaving the Python tab does not automatically stop execution; use Stop when needed.

Use the exact sprite name shown in the sprite panel:

```python
import time

sprite = Sprite('Sprite1')
sprite.goto(-100, 0)
for step in range(10):
    sprite.move(20)
    time.sleep(0.1)
sprite.say('Finished!')
print(sprite.x, sprite.y)
```

Shortcuts: Ctrl+Enter Run, Ctrl+Shift+Enter Run All, Ctrl+S Export Python project, Ctrl+F Find, Ctrl+/ Comment, Tab Indent, Shift+Tab Unindent, Ctrl+Z Undo, Ctrl+Shift+Z Redo.

## Scope and limitations

This browser application now includes Install Packages, Add Extension, interactive input, a cell notebook, and full-scene project persistence. See BROWSER-UPGRADE.md for usage, tested coverage and remaining limitations. It does not yet provide complete PictoBlox parity, native Python packages, firmware flashing from Python, or breakpoint debugging.

Browser storage belongs to the current browser and origin; export JSON to transfer projects or keep a backup. Use the supplied Python server for on-demand scientific package downloads.

## Verification

Verified in the browser: startup using bundled runtime; Python arithmetic/print; source editing; sprite movement and property updates; REPL variable persistence and expression results; filename-bearing division-by-zero tracebacks; stopping an infinite loop. JavaScript syntax checks and all four existing project-store tests pass. See the accompanying delivery note for additional browser checks.

## Runtime attribution

Bundled runtime files are from https://cdn.jsdelivr.net/pyodide/v314.0.8/full/ . Pyodide source: https://github.com/pyodide/pyodide . Its MPL-2.0 license is included in `vendor/pyodide/LICENSE`. Python and bundled components retain their upstream licenses. The runtime's Python standard library contains Python's license text (`import sys; print(sys.copyright)`).

## QA fixes

The comprehensive QA pass fixed in-app file dialogs, toolbar event routing, stage resizing, PNG downloads, Stop preserving artwork, shared Python sprite state, Python file restoration, tutorial navigation, and number-model input validation. The separate QA report records scope and remaining gaps.
