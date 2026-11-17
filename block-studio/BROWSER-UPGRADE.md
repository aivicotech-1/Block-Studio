# Browser studio upgrade

## Start
Double-click START.cmd, or run `python server.py` in this directory. Open http://localhost:5500/?editor=python . No Node build or host Python package installation is required. The host Python process serves files; user Python runs in a browser worker.

## Install Packages
Choose Install Packages below Modules / Libraries. Install a package by name or version, such as `numpy` or `emoji==2.16.0`. Recommended cards are shortcuts to the same installer. The panel lists declared project packages, loaded versions, and extension requirements. Remove resets the kernel; packages required by an enabled extension must be removed through that extension first. Declarations travel with exported projects and are restored on the next run. Unpinned declarations may resolve to newer versions later.

The runtime supports Pyodide-compatible WebAssembly builds and pure Python wheels, not arbitrary native desktop wheels. See [Pyodide package loading](https://pyodide.org/en/stable/usage/loading-packages.html). Core Python is bundled. First package downloads need internet; official scientific wheels are cached by the supplied server and verified against the bundled lockfile SHA256. Pure PyPI wheels use micropip and browser networking. Package changes restart the session and clear Python variables.

## Add Extension
Search or filter the catalog, choose Add extension, then Insert example to append working sample code. The catalog includes Sprite & Stage, Pen, Music, Text to Speech, Keyboard & Mouse, Camera, Machine Learning Models, Virtual Board & UART, NumPy, pandas, and Matplotlib. Extensions requiring packages install those dependencies first. Camera and speech depend on browser support and device permissions. UART uses an already connected compatible device; firmware flashing is not implemented.

Get template downloads the custom extension format. Import extension accepts that JSON, then Add extension enables its modules. Custom module names use `ext_*.py`; the importer rejects paths and standard-module replacement. Custom modules are Python code executed when imported, and have the same browser-runtime access as project code. No arbitrary JavaScript extension loader is provided.

## Notebook and input
Open Py Notebook from the sidebar or notebook tab. Code cells share a kernel. Run individually or Run all; move, duplicate, delete, and switch cell type. Import/export Jupyter nbformat 4 `.ipynb` files. Import asks before replacing cells and never executes imported code automatically. Text outputs are persisted. Markdown is displayed as safe plain text; rendered figures are session-only and are not embedded in exported notebook output yet.

`input()` displays an in-app prompt. The executor transforms input and `time.sleep()` in entry scripts and ordinary helper functions to cooperate with the UI. Imported module functions and aliases such as `from time import sleep` are not transformed. Input in special methods is rejected with an explanatory error. Stop terminates the worker, including infinite loops, and clears kernel state.

## Blocks and project saving
The block runtime now executes variables, lists, repeat/forever, if/else, custom define/call blocks, broadcasts, keyboard and sprite click events. Expressions are parsed without JavaScript eval. Custom blocks currently take no arguments. This remains the project's textual block interface, not a full Scratch socket editor.

Exports/recovery include multiple sprites, positions, visibility, costumes, backdrops, embedded sounds, pen drawing, blocks, serializable model state, Python files, notebook cells, package declarations and enabled extensions. Device connections and live streams must be re-established. Legacy project JSON still imports.

## Verification and remaining work
The upgrade passes 21 Node tests and 9 Python tests. Browser checks are recorded in the adjacent feature-checks.json delivery artifact. Verified: NumPy and a pure PyPI package install, Matplotlib figures, input, notebook shared state/import/export, extension selection, block events/custom blocks/lists, and multi-sprite scene recovery. QA-REPORT.md describes the earlier 339-item audit; it is not evidence that every newly added control has been exhaustively tested.

Still outside this release: complete proprietary PictoBlox API compatibility, 3D/XR, advanced pretrained vision integrations, desktop/native package support, production cloud accounts, Python firmware flashing, and breakpoint debugging. Camera/microphone permissions, physical hardware, and perceptual audio output have not been exercised in this upgrade. Browser first is the selected platform; desktop integration remains later work.
