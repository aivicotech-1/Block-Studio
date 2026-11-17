# Block Studio

A block-coding studio with an editable Python workspace, costumes, sounds, sprites and backdrops, AI and hardware extensions, and an ML Environment. See PYTHON-EDITOR.md for the editor and BROWSER-UPGRADE.md for packages, extensions, notebooks and current scope.

## Run in VS Code
1. Open the `block-studio` folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension, right-click `index.html`, choose **Open with Live Server**.
   - Or in a terminal inside this folder: `python server.py`, then open http://localhost:5500
3. Use Chrome or Edge. Camera, microphone, USB (Web Serial) and Bluetooth only work on `localhost` or `https`, not when `index.html` is opened directly as a file.

## Files
- `index.html` page structure
- `style.css` all styling
- `script.js` original studio behaviour; additional editor/runtime modules extend it
- `project-store.js` versioned project validation and local recovery
- `tests/project-store.test.cjs` project-format tests (`node --test`)

No build step or dependencies are needed.

Projects are autosaved in this browser's local storage and restored when the app is reopened. File imports accept the current versioned format and older project JSON files. Current project exports include Python files, package declarations, enabled extensions, notebook cells, sprites, costumes, backdrops, sounds and scene state. Older project files remain importable.

## ML Environment (File > Open ML Environment)
Trainable here: Image, Audio, Text, and Number (classification and regression) models.
Add classes, add examples, Train model, test, then Use in blocks (an "AI Models" category appears).
Current scene exports and recovery include serializable training/model state. Device streams and permission grants are not project assets.
Object Detection, Pose Classifier and Hand Pose Classifier need pretrained TensorFlow.js models and are not built yet.

## Where to customise
- `LIB` (sprites) and `BL` (backdrops) lists in `script.js`: swap in your own artwork.
- `BG` and the board block lists (`ARD`, `ESP`, `MB`, `QK`, ...): board-specific blocks.
- `EXS`: the example projects under Learn > Examples.
