# Block Studio — functional QA report

Date: 16 November 2026. Environment: Windows, ChatGPT in-app browser, local development server. Tested the updated project in `outputs/block-studio`, using the separate `127.0.0.1` browser origin for generated QA data. The user’s `localhost` storage and original Downloads project were not reset.

## Result

**339 recorded audit entries: 298 PASS, 10 FIXED, 20 LIMITED, 5 BLOCKED, 6 UI_ONLY.** The ten FIXED entries originally failed and have matching passing retests. No unresolved FAIL entries remain in this log. This does not mean every advertised feature is implemented.

These are audit entries, not a claim of 339 distinct buttons or exhaustive state combinations. Some entries group repeated controls. In particular, all **46 base palette buttons** and **152 extension palette buttons** were clicked and their **198 resulting blocks** verified in the rendered script list. Those checks establish insertion, not execution support for every block.

All **12 automated tests pass**: four project-store tests, four numeric-model tests, and four Python Sprite bridge tests. All four application JavaScript files pass syntax checks. The final browser session reported no console errors.

## Reproduced bugs fixed and retested

| Area | Reproduced problem | Change and verification |
|---|---|---|
| Python file dialogs | New File, Rename, Delete and confirmation actions used unsupported browser prompt/confirm dialogs. | Added accessible dialogs inside the application; create/rename/delete/cancel/import/new-project paths retested. |
| Shared toolbar | Upload Firmware was outside the header click listener and did nothing. | Added action delegation on the moved toolbar; firmware, undo and redo retested. |
| Snapshot download | The data-URL download emitted no download event in the in-app browser. | Create a PNG Blob URL; download event verified. |
| Python stage sizing | S/M/L buttons changed a variable that the Python layout ignored. | Connect the Python grid to the stage-width variable; measured small=300px and large≈525px in the test viewport. |
| Stop and artwork | Stop replaced the selected non-cat sprite with a cat. | Restore the actual selected costume; Bear remains Bear after Stop. |
| Python sprite references | Two Sprite instances for the same sprite could hold different positions/directions. | Share state and expose synchronized properties; browser and Python regression tests pass. |
| Numeric prediction validation | A one-feature model accepted two input values. | Require exactly the trained number of finite numeric features; invalid input is rejected. |
| Numeric training validation | Inconsistent feature counts were accepted and produced a NaN model. | Reject inconsistent rows and malformed/nonfinite values with a visible error. |
| Python Restore | Edit → Restore operated on hidden block data instead of restoring deleted Python files. | Added a Python deleted-file stack; filename and content recovery retested. |
| Tutorial navigation | Try it loaded blocks while the Python workspace stayed visible. | Example loading selects the Blocks tab; all four Try it buttons retested. |

Additional edge fix: the Python import file input now resets in `finally`, including after cancelling an overwrite. Selecting the same file again was tested twice after cancellation.

## Coverage

- Python: every editor toolbar button; file creation, selection, rename, deletion, restoration, import/export; malformed JSON and filename validation; duplicate files; overwrite/cancel flows; local recovery; syntax coloring and indentation; search and no-match behavior; font controls; comment toggle; terminal/log tabs; run/run-all/stop; REPL; Python error tracebacks; multi-file imports; sprite methods; keyboard shortcuts; header and File-menu save/load integration.
- Navigation: all home cards and home-header actions; shared header menus; four main tabs; settings/themes; all six language selections; local sign-in display name; all twelve board selections; offline connection states; firmware simulation; help/tutorials; all five example loaders and four Try it buttons.
- Blocks: all base/extension palette insertion buttons; extension chooser; search/results; undo/redo/restore; new/load/save/download; malformed project handling; workspace zoom; loops/motion execution; virtual LED/motor/servo and sensor sliders.
- Stage and assets: S/M/L, full screen and Escape, show/hide, snapshot creation/download/add-as-costume; sprite rename/numeric properties; every one of the 28 sprite assets and 16 backdrop assets; category filters/search; surprise/paint/upload menus; sprite deletion and selection; backpack save/restore.
- Costumes: tool selection and actual visual drawing for brush, eraser, line, circle, rectangle, fill and text; horizontal/vertical flip; clear; copy/paste; undo/redo; duplication/deletion; rename and zoom. The visual checks used generated QA artwork.
- Sounds: every built-in Play button, Stop all, delete and undo/redo, volume/pitch sliders. Playback buttons were exercised, but audible output was not measured.
- Machine learning: all model tabs; class add/delete/rename; generated red/blue image uploads and training; no-data/no-camera guards; text data/training/prediction; numeric classification/regression and invalid-input validation; Use in blocks; close.

## Remaining gaps and unverified behavior

**LIMITED means the control responds, but its advertised capability is incomplete or simulated.** The following still need implementation or further testing:

- Py Notebook and 3D/XR Studio explicitly show unavailable notices.
- Language buttons change the language label but do not translate the application. Sign In sets a local display name, not a real account.
- Firmware upload is a progress simulation. Selecting a board does not prove real hardware compatibility. Virtual board tests do not establish USB/Bluetooth device operation.
- Custom block definitions, click/key/broadcast event dispatch, several Sensing/reporters, Operators, Variables/lists, and Pen/Music execution are incomplete. Source inspection and UI checks found missing runtime behavior or explicit placeholder blocks. Palette insertion passes should not be read as runtime passes.
- Object Detection, Pose Classifier and Hand Pose Classifier ML tabs are explicitly unavailable. Legacy camera/face/body extension names should not be interpreted as verification of neural-network detection accuracy.
- Camera capture, live camera prediction, microphone recording/audio classification, and physical USB/Bluetooth operation remain unverified without permissions/devices. Device chooser cancellation/offline handling was exercised; no device was connected.
- Sound playback handlers were exercised, but this browser interface provides no audible-output assertion. Clipboard Copy feedback was observed; clipboard contents were not independently compared.
- Share copies the page URL rather than publishing a project. The Link/QR dialog supports pasted block JSON; web-link retrieval and QR scanning are unavailable.
- Python `input()`, package installation UI, hardware/AI Python modules, breakpoints/debugging, and notebook behavior are not implemented. Python exports/recovery contain source files and the project name, not complete sprite artwork, backdrop, sound, or model data. Existing block exports also save only their documented subset.
- Snapshot download was verified as a PNG download. Full visual fidelity for multi-sprite scenes, image/gradient backdrops and camera frames was not exhaustively validated.
- This was a desktop in-app-browser audit, not a browser/device matrix, load test, accessibility certification, security audit, or exhaustive check of every input combination. Mobile, Safari, real camera/microphone environments, physical hardware, and long-running/resource-intensive user programs need separate coverage.

## Re-run automated checks

From the updated project directory:

```powershell
node --test tests/project-store.test.cjs tests/ml-number.test.cjs
python -B -m unittest discover -s tests -p "test_*.py" -v
node --check script.js
node --check python-editor.js
node --check python-worker.js
node --check project-store.js
```

For manual verification, run `python server.py`, open `http://localhost:5500/?editor=python`, and use disposable projects. Test fixtures included synthetic Python/block JSON and plain red/blue images, not user data.

## Detailed audit log

The matching machine-readable log is `qa-results.json`. FIXED retains its original failure evidence and links to the named passing retest. PASS applies only to the criterion described, not an entire feature family. UI_ONLY means activation was checked without proving sensory output. BLOCKED means required hardware/permission/input was absent.

| # | Check | Status | Evidence / scope |
|---:|---|---|---|
| 1 | Python New file (original) | FIXED | Click throws: prompt() is not supported in the in-app browser. Replaced native prompt/confirm with app dialogs. Retest: Python New file / Create |
| 2 | Python New file / Create | PASS | true |
| 3 | Python File actions / Rename | PASS | true |
| 4 | Python File actions / Delete | PASS | true |
| 5 | Python dialogs / Cancel | PASS | true |
| 6 | Python Comment button | PASS | true |
| 7 | Python Font larger | PASS | true |
| 8 | Python Font smaller | PASS | true |
| 9 | Python Find next | PASS | true |
| 10 | Python Close find | PASS | true |
| 11 | Python pf-api help | PASS | true |
| 12 | Python pf-help help | PASS | true |
| 13 | Python Log tab | PASS | true |
| 14 | Python Terminal tab | PASS | true |
| 15 | Python Run | PASS | true |
| 16 | Python REPL / Enter | PASS | true |
| 17 | Python REPL toggle off | PASS | true |
| 18 | Python Clear terminal | PASS | true |
| 19 | Python Example programs | PASS | true |
| 20 | Python Run All | PASS | true |
| 21 | Python Download active file | PASS | true |
| 22 | Python Export project | PASS | true |
| 23 | Python Import / replace .py file | PASS | true |
| 24 | Python Import project JSON | PASS | true |
| 25 | Python Stop button | PASS | true |
| 26 | Toolbar Upload Firmware (original) | FIXED | No dialog: toolbar moved outside delegated header listener. Retest: Toolbar Upload Firmware retest |
| 27 | Python File > New | PASS | Reset to Stage.py and Sprite1.py with starter content; original assertion also counted the Sprite API button. |
| 28 | Toolbar Upload Firmware retest | PASS | true |
| 29 | Python toolbar Undo | PASS | true |
| 30 | Python toolbar Redo | PASS | true |
| 31 | Achievements | PASS | true |
| 32 | Settings / Light | PASS | true |
| 33 | Settings / Dark | PASS | true |
| 34 | Settings / Auto | PASS | true |
| 35 | Language / English | LIMITED | Selection changes label only; dialog explicitly says translation is unavailable. |
| 36 | Language / Hindi | LIMITED | Selection changes label only; dialog explicitly says translation is unavailable. |
| 37 | Language / Urdu | LIMITED | Selection changes label only; dialog explicitly says translation is unavailable. |
| 38 | Language / Spanish | LIMITED | Selection changes label only; dialog explicitly says translation is unavailable. |
| 39 | Language / French | LIMITED | Selection changes label only; dialog explicitly says translation is unavailable. |
| 40 | Language / Chinese | LIMITED | Selection changes label only; dialog explicitly says translation is unavailable. |
| 41 | Sign In / Continue | LIMITED | Local display name becomes QA Tester; no real account authentication. |
| 42 | Board / 🧩evive | PASS | true |
| 43 | Board / 🔷Quarky | PASS | true |
| 44 | Board / 🤖Wizbot | PASS | true |
| 45 | Board / 🟦Arduino Uno | PASS | true |
| 46 | Board / 🟦Arduino Mega | PASS | true |
| 47 | Board / 🟦Arduino Nano | PASS | true |
| 48 | Board / 📶ESP32 | PASS | true |
| 49 | Board / ⌚T-Watch | PASS | true |
| 50 | Board / 🔴micro:bit | PASS | true |
| 51 | Board / 🧪TECbits | PASS | true |
| 52 | Board / 🧱LEGO EV3 | PASS | true |
| 53 | Board / 🧱LEGO BOOST | PASS | true |
| 54 | Mode / Upload without device | PASS | true |
| 55 | Connect / Disconnect while offline | PASS | true |
| 56 | Mode / Stage | PASS | true |
| 57 | Connect via USB | BLOCKED | No physical USB board supplied; browser/device authorization cannot be completed as a hardware test. UI feedback: Hardware: disconnected |
| 58 | Connect via Bluetooth | BLOCKED | No Bluetooth board supplied. UI feedback: Hardware: disconnected |
| 59 | File / Share / Copy link | LIMITED | Copies page URL only, not project data; QR codes and project publishing are not implemented. |
| 60 | Block import / malformed JSON | PASS | true |
| 61 | Block import / pasted project | PASS | true |
| 62 | Blocks Green flag / movement | PASS | true |
| 63 | Blocks Stop / reset | PASS | true |
| 64 | Blocks File / Save | PASS | true |
| 65 | Blocks Save / Copy | PASS | true |
| 66 | Blocks Save / Download | PASS | Download event emitted. Exported JSON verified in save field. |
| 67 | Blocks File / New | PASS | true |
| 68 | Blocks Edit / Restore | PASS | true |
| 69 | Blocks toolbar Undo | PASS | true |
| 70 | Blocks toolbar Redo | PASS | true |
| 71 | Learn / Getting Started | PASS | true |
| 72 | Learn / Tutorials | PASS | true |
| 73 | Learn / Examples | PASS | true |
| 74 | Learn / Help | PASS | true |
| 75 | Example / Walk and say hello | PASS | true |
| 76 | Example / Bounce forever | PASS | true |
| 77 | Example / Follow my face | PASS | true |
| 78 | Example / Blink an LED | PASS | true |
| 79 | Example / Greet when I say hello | PASS | true |
| 80 | Stage size / Small stage (Blocks) | PASS | true |
| 81 | Stage size / Normal stage (Blocks) | PASS | true |
| 82 | Stage size / Large stage (Blocks) | PASS | true |
| 83 | Stage full screen | PASS | true |
| 84 | Stage exit full screen | PASS | true |
| 85 | Hide sprite | PASS | true |
| 86 | Show sprite | PASS | true |
| 87 | Stage snapshot | PASS | true |
| 88 | Stage snapshot Download (original) | FIXED | Click did not emit a download event within 10 seconds (data URL download). Retest: Snapshot Download retest |
| 89 | Stage snapshot Add as costume | PASS | true |
| 90 | Python stage resizing (original) | FIXED | false Retest: Python stage resizing retest |
| 91 | Costumes Duplicate | PASS | true |
| 92 | Costumes Delete | PASS | true |
| 93 | Costumes cflipH | PASS | Subsequently verified visually; see Costumes Horizontal flip visual |
| 94 | Costumes cflipV | PASS | Subsequently verified visually; see Costumes Vertical flip visual |
| 95 | Costumes cclip | PASS | Subsequently verified visually; see Costumes Copy and Paste visual |
| 96 | Costumes cpaste | PASS | Subsequently verified visually; see Costumes Copy and Paste visual |
| 97 | Costumes cclear | PASS | Subsequently verified visually; see Costumes Clear visual |
| 98 | Costumes cundo | PASS | Subsequently verified visually; see Costumes Undo visual |
| 99 | Costumes credo | PASS | Subsequently verified visually; see Costumes Redo visual |
| 100 | Costumes zoom zin | PASS | true |
| 101 | Costumes zoom zout | PASS | true |
| 102 | Costumes zoom zrst | PASS | true |
| 103 | Costumes tool / brush | PASS | true |
| 104 | Costumes tool / eraser | PASS | true |
| 105 | Costumes tool / line | PASS | true |
| 106 | Costumes tool / circle | PASS | true |
| 107 | Costumes tool / rect | PASS | true |
| 108 | Costumes tool / fill | PASS | true |
| 109 | Costumes tool / text | PASS | true |
| 110 | Costumes Text drawing | PASS | Canvas visibly rendered Hello at the clicked position. |
| 111 | Costumes Brush drawing | PASS | Black stroke is visible on the canvas. |
| 112 | Costumes Line drawing | PASS | Shape visibly rendered in canvas screenshot. |
| 113 | Costumes Circle drawing | PASS | Shape visibly rendered in canvas screenshot. |
| 114 | Costumes Rectangle drawing | PASS | Shape visibly rendered in canvas screenshot. |
| 115 | Costumes Bucket fill drawing | PASS | Purple fill visibly covers transparent background. |
| 116 | Costumes Eraser drawing | PASS | Checkerboard erasure stroke visible. |
| 117 | Costumes Horizontal flip visual | PASS | Hello and shapes mirrored horizontally. |
| 118 | Costumes Vertical flip visual | PASS | Shapes and text inverted vertically. |
| 119 | Costumes Clear visual | PASS | Canvas is fully transparent after Clear. |
| 120 | Costumes Undo visual | PASS | Undo restored the artwork after Clear. |
| 121 | Costumes Redo visual | PASS | Redo cleared the artwork again. |
| 122 | Costumes Copy and Paste visual | PASS | Paste restored copied artwork with its expected offset. |
| 123 | Costumes Rename | PASS | true |
| 124 | Sound Play / Meow | UI_ONLY | Play handler completed; audible output is not measured by this browser tool. |
| 125 | Sound Play / Pop | UI_ONLY | Play handler completed; audible output is not measured by this browser tool. |
| 126 | Sound Play / Chirp | UI_ONLY | Play handler completed; audible output is not measured by this browser tool. |
| 127 | Sound Play / Drum | UI_ONLY | Play handler completed; audible output is not measured by this browser tool. |
| 128 | Sound Play / Laser | UI_ONLY | Play handler completed; audible output is not measured by this browser tool. |
| 129 | Sounds Stop all | UI_ONLY | Stop handler completed; no audio assertion available. |
| 130 | Sounds Delete | PASS | true |
| 131 | Sounds Undo deletion | PASS | true |
| 132 | Sounds Redo deletion | PASS | true |
| 133 | Sounds Record | BLOCKED | Microphone permission and a recording source were not provided; recording is not claimed tested. |
| 134 | Backpack / + Scripts | PASS | true |
| 135 | Backpack / + Costume | PASS | true |
| 136 | Backpack restore scripts | PASS | true |
| 137 | Backpack restore costume as sprite | PASS | true |
| 138 | Sprite menu / Choose from Backpack | PASS | true |
| 139 | Sprite library category / All | PASS | true |
| 140 | Sprite library category / Animals | PASS | true |
| 141 | Sprite library category / Fantasy | PASS | true |
| 142 | Sprite library category / People | PASS | true |
| 143 | Sprite library category / Food | PASS | true |
| 144 | Sprite library category / Transportation | PASS | true |
| 145 | Sprite library category / Things | PASS | true |
| 146 | Sprite library search | PASS | true |
| 147 | Sprite library asset / 🐱Cat | PASS | true |
| 148 | Sprite library asset / 🐶Dog | PASS | true |
| 149 | Sprite library asset / 🐻Bear | PASS | true |
| 150 | Sprite library asset / 🐼Panda | PASS | true |
| 151 | Sprite library asset / 🦊Fox | PASS | true |
| 152 | Sprite library asset / 🦁Lion | PASS | true |
| 153 | Sprite library asset / 🐸Frog | PASS | true |
| 154 | Sprite library asset / 🐧Penguin | PASS | true |
| 155 | Sprite library asset / 🐉Dragon | PASS | true |
| 156 | Sprite library asset / 🦄Unicorn | PASS | true |
| 157 | Sprite library asset / 🧙Wizard | PASS | true |
| 158 | Sprite library asset / 👻Ghost | PASS | true |
| 159 | Sprite library asset / 🤖Robot | PASS | true |
| 160 | Sprite library asset / 👽Alien | PASS | true |
| 161 | Sprite library asset / 🧑‍🚀Astronaut | PASS | true |
| 162 | Sprite library asset / 👧Girl | PASS | true |
| 163 | Sprite library asset / 👦Boy | PASS | true |
| 164 | Sprite library asset / 🍎Apple | PASS | true |
| 165 | Sprite library asset / 🍕Pizza | PASS | true |
| 166 | Sprite library asset / 🎂Cake | PASS | true |
| 167 | Sprite library asset / 🚗Car | PASS | true |
| 168 | Sprite library asset / 🚀Rocket | PASS | true |
| 169 | Sprite library asset / ✈️Plane | PASS | true |
| 170 | Sprite library asset / ⛵Boat | PASS | true |
| 171 | Sprite library asset / ⚽Ball | PASS | true |
| 172 | Sprite library asset / ⭐Star | PASS | true |
| 173 | Sprite library asset / ❤️Heart | PASS | true |
| 174 | Sprite library asset / 🌳Tree | PASS | true |
| 175 | Stop preserves selected sprite appearance (original) | FIXED | false Retest: Stop preserves sprite appearance retest |
| 176 | Delete selected sprite | PASS | true |
| 177 | Sprite menu / Surprise | PASS | true |
| 178 | Sprite menu / Paint | PASS | true |
| 179 | Backdrop library category / All | PASS | true |
| 180 | Backdrop library category / Outdoors | PASS | true |
| 181 | Backdrop library category / Space | PASS | true |
| 182 | Backdrop library category / Indoors | PASS | true |
| 183 | Backdrop library category / Patterns | PASS | true |
| 184 | Backdrop library category / Sports | PASS | true |
| 185 | Backdrop library category / Nature | PASS | true |
| 186 | Backdrop library asset / Blue Sky | PASS | true |
| 187 | Backdrop library asset / Sunset | PASS | true |
| 188 | Backdrop library asset / Grass | PASS | true |
| 189 | Backdrop library asset / Beach | PASS | true |
| 190 | Backdrop library asset / Night Sky | PASS | true |
| 191 | Backdrop library asset / Galaxy | PASS | true |
| 192 | Backdrop library asset / Moon | PASS | true |
| 193 | Backdrop library asset / Classroom | PASS | true |
| 194 | Backdrop library asset / Bedroom | PASS | true |
| 195 | Backdrop library asset / Stripes | PASS | true |
| 196 | Backdrop library asset / Grid | PASS | true |
| 197 | Backdrop library asset / Sports Field | PASS | true |
| 198 | Backdrop library asset / Court | PASS | true |
| 199 | Backdrop library asset / Underwater | PASS | true |
| 200 | Backdrop library asset / Forest | PASS | true |
| 201 | Backdrop library asset / Desert | PASS | true |
| 202 | Backdrop menu / Surprise | PASS | true |
| 203 | Backdrop menu / Paint / Use colour | PASS | true |
| 204 | Sprite menu / Upload Sprite | PASS | true |
| 205 | Backdrop menu / Upload Backdrop | PASS | true |
| 206 | Sprite numeric properties | PASS | true |
| 207 | Sprite rename | PASS | true |
| 208 | Python stage resizing retest | PASS | true |
| 209 | Snapshot Download retest | PASS | Blob PNG download event emitted. |
| 210 | Python Enter auto-indent | PASS | true |
| 211 | Python Shift+Tab unindent | PASS | true |
| 212 | Python Tab indent | PASS | true |
| 213 | Python shared Sprite instances (original) | FIXED | false Retest: Python shared Sprite instances retest |
| 214 | All base palette insertions | PASS | {"count": 46, "buttons": ["move 50 steps", "turn right 15 degrees", "go to x: 0 y: 0", "go to random position", "change x by 40", "change y by 40", "bounce if on edge", "say Hello! for 2 seconds", "think Hmm...", "next costume", "switch backdrop to Backdrop1", "change size by 10", "show", "hide", "play sound Meow until done", "start sound Pop", "play sound Chirp until done", "start sound Drum", "start sound Laser", "stop all sounds", "change volume by -10", "when green flag clicked", "when this sprite clicked", "when key space pressed", "broadcast message1", "wait 1 seconds", "repeat 10", "forever", "if x > 0 then", "if touching edge then", "end", "stop all", "touching mouse-pointer?", "ask What's your name? and wait", "key space pressed?", "timer", "reset timer", "pick random 1 to 10", "join hello world", "() + ()", "() = ()", "set my variable to 0", "change my variable by 1", "show variable", "make a list", "Make a Block"], "note": "Every button clicked in the preceding completed browser batch."} |
| 215 | Extension palette / + Image Classification | PASS | {"inserted": 6, "buttons": ["add camera sample to class 1", "clear dataset", "train model", "classify camera image", "if image class is 1 then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 216 | Extension palette / + Dataset Collection | PASS | {"inserted": 6, "buttons": ["add camera sample to class 1", "clear dataset", "train model", "classify camera image", "if image class is 1 then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 217 | Extension palette / + AI Model Training | PASS | {"inserted": 6, "buttons": ["add camera sample to class 1", "clear dataset", "train model", "classify camera image", "if image class is 1 then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 218 | Extension palette / + Face Recognition | PASS | {"inserted": 3, "buttons": ["remember face as person 1", "if recognized person is 1 then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 219 | Extension palette / + Pose Detection | PASS | {"inserted": 5, "buttons": ["if body is left of center then", "if body is right of center then", "if body is above of center then", "if body is below of center then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 220 | Extension palette / + Hand Gesture | PASS | {"inserted": 5, "buttons": ["if swipe left detected then", "if swipe right detected then", "if swipe up detected then", "if swipe down detected then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 221 | Extension palette / + Body Tracking | PASS | {"inserted": 3, "buttons": ["follow body motion", "if body motion detected then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 222 | Extension palette / + OCR | PASS | {"inserted": 2, "buttons": ["read text from camera", "show recognized text"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 223 | Extension palette / + Natural Language | PASS | {"inserted": 5, "buttons": ["if text is positive then", "if text is negative then", "if text is a question then", "show text word count", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 224 | Extension palette / + Sensors | PASS | {"inserted": 12, "buttons": ["LED on", "LED off", "blink LED 3 times", "set motor speed to 50", "stop motor", "set servo angle to 90", "if button pressed then", "if temperature > 30 then", "if light level < 40 then", "if distance < 20 then", "show temperature", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 225 | Extension palette / + Motors & Servos | PASS | {"inserted": 12, "buttons": ["LED on", "LED off", "blink LED 3 times", "set motor speed to 50", "stop motor", "set servo angle to 90", "if button pressed then", "if temperature > 30 then", "if light level < 40 then", "if distance < 20 then", "show temperature", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 226 | Extension palette / + Bluetooth | PASS | {"inserted": 3, "buttons": ["send hello over Bluetooth", "if Bluetooth connected then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 227 | Extension palette / + IoT | PASS | {"inserted": 2, "buttons": ["publish sensors to cloud", "show cloud temperature"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 228 | Extension palette / + Face Detection | PASS | {"inserted": 6, "buttons": ["camera on", "camera off", "if face detected then", "end", "glide to face position", "show number of faces"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 229 | Extension palette / + Speech Recognition | PASS | {"inserted": 8, "buttons": ["listen and wait", "show what was heard", "if heard hello then", "if heard yes then", "if heard no then", "if heard go then", "if heard stop then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 230 | Extension palette / + Text to Speech | PASS | {"inserted": 4, "buttons": ["speak Hello there", "speak I can see you", "speak Goodbye", "speak the typed text"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 231 | Extension palette / + Object Detection | PASS | {"inserted": 6, "buttons": ["find red object", "find green object", "find blue object", "if object found then", "glide to object position", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 232 | Extension palette / + Machine Learning Environment | PASS | {"inserted": 6, "buttons": ["add camera sample to class 1", "clear dataset", "train model", "classify camera image", "if image class is 1 then", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 233 | Extension palette / + Quarky | PASS | {"inserted": 12, "buttons": ["LED on", "LED off", "blink LED 3 times", "set motor speed to 50", "stop motor", "set servo angle to 90", "if button pressed then", "if temperature > 30 then", "if light level < 40 then", "if distance < 20 then", "show temperature", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 234 | Extension palette / + Arduino Uno | PASS | {"inserted": 12, "buttons": ["LED on", "LED off", "blink LED 3 times", "set motor speed to 50", "stop motor", "set servo angle to 90", "if button pressed then", "if temperature > 30 then", "if light level < 40 then", "if distance < 20 then", "show temperature", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 235 | Extension palette / + ESP32 | PASS | {"inserted": 12, "buttons": ["LED on", "LED off", "blink LED 3 times", "set motor speed to 50", "stop motor", "set servo angle to 90", "if button pressed then", "if temperature > 30 then", "if light level < 40 then", "if distance < 20 then", "show temperature", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 236 | Extension palette / + micro:bit | PASS | {"inserted": 12, "buttons": ["LED on", "LED off", "blink LED 3 times", "set motor speed to 50", "stop motor", "set servo angle to 90", "if button pressed then", "if temperature > 30 then", "if light level < 40 then", "if distance < 20 then", "show temperature", "end"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 237 | Extension palette / + Pen | PASS | {"inserted": 2, "buttons": ["Pen block 1", "Pen block 2"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 238 | Extension palette / + Music | PASS | {"inserted": 2, "buttons": ["Music block 1", "Music block 2"], "note": "Click batch completed before browser test timeout; confirmed every resulting block in script DOM."} |
| 239 | Block search | PASS | true |
| 240 | Block search result insertion | PASS | true |
| 241 | Blocks workspace zoom / + | PASS | true |
| 242 | Blocks workspace zoom / - | PASS | true |
| 243 | Blocks workspace zoom / = | PASS | true |
| 244 | Add Extension chooser | PASS | true |
| 245 | Add Extension / choose | PASS | true |
| 246 | Runtime feature gap / My Blocks custom definition | LIMITED | Source inspection and UI checks: palette insertion exists, but full execution/definition behavior is missing. |
| 247 | Runtime feature gap / Events click/key/broadcast | LIMITED | Source inspection and UI checks: palette insertion exists, but full execution/definition behavior is missing. |
| 248 | Runtime feature gap / Sensing ask/timer/reporters | LIMITED | Source inspection and UI checks: palette insertion exists, but full execution/definition behavior is missing. |
| 249 | Runtime feature gap / Operators arithmetic/text/reporters | LIMITED | Source inspection and UI checks: palette insertion exists, but full execution/definition behavior is missing. |
| 250 | Runtime feature gap / Variables and lists | LIMITED | Source inspection and UI checks: palette insertion exists, but full execution/definition behavior is missing. |
| 251 | Runtime feature gap / Pen and Music | LIMITED | Source inspection and UI checks: palette insertion exists, but full execution/definition behavior is missing. |
| 252 | Python shared Sprite instances retest | PASS | true |
| 253 | File / Open ML Environment | PASS | true |
| 254 | ML Image / no-data training validation | PASS | true |
| 255 | ML Image / untrained prediction guard | PASS | true |
| 256 | ML Add class | PASS | true |
| 257 | ML Delete class | PASS | true |
| 258 | ML Image / Rename classes | PASS | true |
| 259 | ML Image / Upload samples | PASS | true |
| 260 | ML Image / Train | PASS | true |
| 261 | ML Image / no-camera prediction guard | PASS | true |
| 262 | ML Image / camera sample guard | PASS | true |
| 263 | ML Image / Turn camera on and live prediction | BLOCKED | Camera capture permission was not provided. Live camera behavior remains unverified. |
| 264 | ML Image / Use in blocks | PASS | true |
| 265 | ML tab / obj | LIMITED | Explicit not-yet-implemented notice displayed. |
| 266 | ML tab / pose | LIMITED | Explicit not-yet-implemented notice displayed. |
| 267 | ML tab / hand | LIMITED | Explicit not-yet-implemented notice displayed. |
| 268 | ML tab / Audio | BLOCKED | Class UI opens; microphone training/prediction needs permission and audio input. |
| 269 | ML Text / Add examples | PASS | true |
| 270 | ML Text / Train | PASS | true |
| 271 | ML Text / Predict | PASS | true |
| 272 | ML Text / Use in blocks | PASS | true |
| 273 | ML Number / Classification Train | PASS | true |
| 274 | ML Number / Classification Predict | PASS | true |
| 275 | ML Number / Regression Train | PASS | true |
| 276 | ML Number / Regression Predict | PASS | true |
| 277 | ML Number / mismatched prediction dimensions (original) | FIXED | Two input features accepted for a one-feature model: Predicted value: 11 Retest: ML prediction dimension guard retest |
| 278 | ML Number / inconsistent training dimensions (original) | FIXED | Linear regression fitted on 3 rows. R squared: NaN. Press Use in blocks to add it to your project. Retest: ML inconsistent training dimensions retest |
| 279 | ML inconsistent training dimensions retest | PASS | true |
| 280 | ML prediction dimension guard retest | PASS | true |
| 281 | ML regression after validation fix | PASS | true |
| 282 | ML Number / Use in blocks | PASS | true |
| 283 | Blocks File / Load from computer | PASS | true |
| 284 | Blocks imported project execution | PASS | Move 25 steps moved sprite to x=25. |
| 285 | Stop preserves sprite appearance retest | PASS | true |
| 286 | Costume selection / 1 🐻Bear | PASS | true |
| 287 | Firmware Upload simulation | LIMITED | Progress reaches Done. This is explicitly simulated, not real flashing. |
| 288 | Home header / Achievements | PASS | true |
| 289 | Home header / Settings | PASS | true |
| 290 | Home header / Language | PASS | true |
| 291 | Home header / Sign In | PASS | true |
| 292 | Home / Py Notebook | LIMITED | Explicit unavailable notice shown. |
| 293 | Home / 3D and XR Studio | LIMITED | Explicit unavailable notice shown. |
| 294 | Home card / jr | PASS | true |
| 295 | Home card / bl | PASS | true |
| 296 | Home card / pe | PASS | true |
| 297 | Home card / pt | PASS | true |
| 298 | Home / Machine Learning Environment | PASS | true |
| 299 | ML Close | PASS | true |
| 300 | Python Sprite API integrated execution | PASS | true |
| 301 | Python Ctrl+Enter shortcut | PASS | Shortcut ran Python and emitted All sprite checks passed. The selected-sprite status bar referred to Bear, not Sprite1. |
| 302 | Python Ctrl+F shortcut | PASS | true |
| 303 | Python Ctrl+S shortcut | PASS | Project download event emitted |
| 304 | Python traceback and filename | PASS | true |
| 305 | Python infinite-loop cancellation | PASS | true |
| 306 | Python malformed JSON import | PASS | true |
| 307 | Python new .py file import | PASS | true |
| 308 | Python cross-file imports | PASS | Python terminal · Run your code to get started.; Running Sprite1.py…; All sprite checks passed; Process finished.; Running Sprite1.py…; Traceback (most recent call last):;   File "/lib/python314.zip/_pyodide/_base.py", line 619, in eval_code_async;     await CodeRunner(;     ...<10 lines>...;     .run_async(globals, locals);   File "/lib/python314.zip/_pyodide/_base.py", line 420, in run_async;     coroutine = eval(self.code, globals, locals);   File "<exec>", line 1, in <module>;   File "Sprite1.py", line 1, in <module>;     print(1 / 0);           ~~^~~; ZeroDivisionError: division by zero; ; Running Sprite1.py…; Execution stopped.; Expected property name or '}' in JSON at position 1 (line 1 column 2); Running Sprite1.py…; Module import passed; Process finished.;  |
| 309 | Python Ctrl+Z | PASS | true |
| 310 | Python Ctrl+Shift+Z | PASS | true |
| 311 | Python Ctrl+/ | PASS | true |
| 312 | Python Edit menu Undo | PASS | true |
| 313 | Python Edit menu Redo | PASS | true |
| 314 | Python Edit / Restore deleted file (original) | FIXED | false Retest: Python Edit / Restore deleted file retest |
| 315 | Python Edit / Restore deleted file retest | PASS | true |
| 316 | Python Restore preserves file content | PASS | true |
| 317 | Python rejects invalid filename | PASS | true |
| 318 | Python rejects duplicate filename | PASS | true |
| 319 | Tutorial Try it opens visible Blocks workspace (original) | FIXED | false Retest: Tutorial Try it 1 navigation retest |
| 320 | Tutorial Try it 1 navigation retest | PASS | true |
| 321 | Tutorial Try it 2 navigation retest | PASS | true |
| 322 | Tutorial Try it 3 navigation retest | PASS | true |
| 323 | Tutorial Try it 4 navigation retest | PASS | true |
| 324 | Python File menu Load | PASS | true |
| 325 | Python repeat import after cancel / 1 | PASS | true |
| 326 | Python repeat import after cancel / 2 | PASS | true |
| 327 | Python Ctrl+Shift+Enter Run All | PASS | true |
| 328 | Python header Save icon | PASS | Project download event emitted |
| 329 | Python File menu Save | PASS | Project download event emitted |
| 330 | Python Green flag Run All | PASS | true |
| 331 | Python Find / no matches | PASS | true |
| 332 | Block loops and motion integration | PASS | Two repeats, turn, x/y changes produced x=45 y=10 direction=180. |
| 333 | Virtual sensor slider / st | PASS | true |
| 334 | Virtual sensor slider / sl | PASS | true |
| 335 | Virtual sensor slider / sd | PASS | true |
| 336 | Virtual board LED, motor and servo | PASS | true |
| 337 | Virtual board LED off and stop motor | PASS | true |
| 338 | Sound Volume and Pitch sliders | PASS | true |
| 339 | Python dialog Escape cancellation | PASS | true |
