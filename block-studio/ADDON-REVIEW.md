# Backdrops and remaining add-ons

## Implemented backdrop upgrade
Open Add a backdrop on the stage, or use /?editor=notebook&library=backdrops. The full-screen chooser has Back, search, the reference category groups (All, Fantasy, Music, Sports, Outdoors, Indoors, Space, Underwater, Patterns), a responsive preview grid, and 24 original local illustrations. These are Block Studio vector illustrations rather than the reference product's photographic/artwork collection.

Selecting a card rasterizes the illustration to an embedded 480x360 PNG, adds it to the scene, selects it, and persists it with the project. Upload accepts PNG/JPEG/WebP/GIF up to 5 MB and normalizes it to the same stage size. Surprise selects from the new illustrated catalog. Paint is now a real brush/eraser canvas with color, thickness, undo, redo, clear and a named save action; it replaces the previous color-only dialog. The side panel has image previews and a count. Use Manage selected in the chooser, or right-click a preview (Shift+F10 also works), to rename/remove. At least one backdrop is retained. Existing gradient/color backdrops still work.

The existing sprite and backdrop hover menus now escape clipped side panels. Other asset editors and Python extensions remain connected to their existing implementations.

## Verification
23 Node tests passed, including two new catalog tests for category coverage, unique names, and self-contained SVGs. Changed JavaScript passes syntax checks. Browser checks covered filtering, empty search, embedded stage selection, reload recovery, paint stroke, undo/redo, paint saving, rename, remove, upload, Surprise, preview rendering, and opening the existing sprite library. See backdrop-checks.json. The screenshot comparison at 1920x990 had an eight-column gallery with no dialog horizontal overflow. A compact browser view was also inspected. Hardware and microphone/camera permissions were not exercised.

## Remaining add-on review
This is a source review plus targeted browser checks, not a full acceptance audit of every extension.

| Area | Current behavior | Remaining work |
|---|---|---|
| Backdrops | Full-screen illustrated catalog, search, categories, upload, drawing, selection, rename/remove and scene recovery | More curated artwork; selection crops uploaded images to the stage ratio; no animation/vector-object editor |
| Sprite add-ons | Existing chooser, search/categories, image upload, paint entry, Surprise, backpack; hover menu reachable | Library is mostly emoji-based, not a large illustrated costume collection; advanced sprite tooling needs further testing |
| Costumes | Raster painting tools, shapes, copy/paste, undo/redo and costume controls | Complete vector editor and broader import-format support |
| Sounds | Synthesized sound library and microphone recording code | Audio-file import and waveform editing; physical microphone/perceptual playback testing |
| Python files and data | New/edit/import helper modules; image/text/CSV imports embedded in notebook cells | Folder tree, richer data previews and larger asset workflow |
| Packages | Pyodide and compatible pure-Python wheels; project declarations and loaded versions | Native desktop wheels require the later desktop/runtime phase; not every listed package tested |
| Python extensions | Sprite/Stage, Pen, Music, speech, sensing, camera, text/numeric ML, virtual board/UART, NumPy, pandas, Matplotlib | Device-dependent paths and all scientific packages need further acceptance testing |
| Camera and advanced vision | Browser camera integration, experimental browser OCR, some simulated detection behavior | Production object/pose/hand/face model integrations and cross-browser coverage |
| ML environment | Existing training flows and text/number model bridge | Pretrained object detection, pose and hand-pose integrations remain incomplete |
| Hardware | Virtual board and browser serial/Bluetooth connection paths | Real-device compatibility tests; firmware upload currently simulates progress |
| Cloud IoT | Sensor publish action stores simulated local data | Actual backend/broker integration |
| Accounts | Local session name only | Real authentication and cloud project sync |
| 3D/XR | Placeholder entry | Studio/runtime implementation |
| Debugger | Run, Stop, terminal, REPL, notebook session controls | Breakpoints and step debugging |

Priorities: finish asset import/editing workflows; replace or clearly distinguish simulated hardware/vision/cloud behavior; then device/browser acceptance testing. Full PictoBlox feature parity is not complete.

## Delivery state
Available on the local running application. The working Git checkout and downloadable archive include this change; it has not been pushed to GitHub or published to a public hosting destination in this turn.
