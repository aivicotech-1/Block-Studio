# Block Studio

A block-coding studio: blocks, Python view, costumes, sounds, sprites and backdrops, AI and hardware extensions, and an ML Environment.

## Run in VS Code
1. Open the `block-studio` folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension, right-click `index.html`, choose **Open with Live Server**.
   - Or in a terminal inside this folder: `python -m http.server 5500`, then open http://localhost:5500
3. Use Chrome or Edge. Camera, microphone, USB (Web Serial) and Bluetooth only work on `localhost` or `https`, not when `index.html` is opened directly as a file.

## Files
- `index.html` page structure
- `style.css` all styling
- `script.js` all behaviour

No build step or dependencies are needed.

## ML Environment (File > Open ML Environment)
Trainable here: Image, Audio, Text, and Number (classification and regression) models.
Add classes, add examples, Train model, test, then Use in blocks (an "AI Models" category appears).
Trained models are kept only while the page is open (not saved on reload yet).
Object Detection, Pose Classifier and Hand Pose Classifier need pretrained TensorFlow.js models and are not built yet.

## Where to customise
- `LIB` (sprites) and `BL` (backdrops) lists in `script.js`: swap in your own artwork.
- `BG` and the board block lists (`ARD`, `ESP`, `MB`, `QK`, ...): board-specific blocks.
- `EXS`: the example projects under Learn > Examples.
