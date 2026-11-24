# 3D and XR Studio — implementation and feature matrix

## Opening the studio

Open http://127.0.0.1:5500/?editor=xr or choose 3D and XR Studio on the Block Studio home screen. The My Projects dashboard and Create New Project form follow the two supplied screenshots. This is an independent implementation with original Block Studio assets and a distinct project file format. It is a working initial studio, not complete PictoBlox feature parity.

## Implemented

| Area | Current behavior |
| --- | --- |
| My Projects | Search, six category filters, grid/list views, pagination, rename, export and confirmed deletion. Saved scenes receive rendered thumbnail previews. |
| Create New Project | Name, optional description, category filtering and template selection. Seven usable templates: Default, Bouncing Objects, Animated Characters, Maze, Car Scene, Solar System and City. Face/hand template cards explicitly say not implemented and are disabled. |
| File handling | Versioned .xr.json import/export; local browser storage; up to five persisted earlier save versions; unsaved-scene confirmation; PNG scene snapshots. HTTPS project link loading is implemented with CORS requirements and credentials omitted. |
| 3D objects | Box, sphere, cylinder, cone, plane, torus, original procedural bear/robot/house/tree/car, text labels and point lights. Geometry-only OBJ import, up to 3 MB. |
| Scene editing | Layer selection, visibility, object names, three-axis Move/Rotate/Scale gizmos, numeric transforms, explicit Apply properties, snapping, duplicate, delete, ground placement, focus, standard camera views and orbit/pan/zoom. Forty undo steps. |
| Materials | Color, matte, metal, glass, glow and wireframe. Text is a camera-facing label, not extruded typography. |
| Sketch/path | Click points or drag a freehand sketch; rectangle and circle presets; polygon extrusion with depth; polyline paths and object path following. |
| Solid modeling | Union, subtraction and intersection of two solid meshes through bundled CSG. Keeps undo for the originals. Group/character CSG is rejected with an explanation. Per-axis object alignment. |
| Physics | Cannon rigid bodies, gravity, static/dynamic mass, bounce, an implicit ground plane, fixed/hinge constraints and a fixed 60 Hz step. Sphere colliders or world-bounds box approximations. Play previews simulation; Stop restores the editing state. |
| Animation/game | Spin, bob, orbit, path following, continuous rotate/move/bounce behavior cards; WASD control for the first car or Player; axis-aligned maze-wall collision checks. |
| Python | Separate off-thread Pyodide worker, independent from the notebook runtime. XRObject(name) supports set_position, set_rotation, set_scale, set_color, move, show and hide. Commands are validated and applied as one scene update after completion. Run/Stop, terminal output and saved source supported. |
| Multimedia | Local audio/video import under 3 MB, embedded data, video texture planes and playback on Play. Format/codec support depends on the browser. |
| WebXR | Device capability checks and native immersive AR/VR session entry. Buttons are disabled where unavailable. AR hides the editor ground/background for the passthrough view. Requires HTTPS/localhost, permission and supported hardware. |

## Remaining work for full parity

- Face, hand, image and cube/marker tracking are not implemented. No simulated tracking is presented as real tracking.
- Full Scratch-style 3D block programming with event hats/control flow, and PictoBlox-compatible Python APIs. Current behavior cards and XRObject scripts are a smaller coding system.
- Skeletal character animation, a keyframe timeline, imported character animation clips and the full proprietary model/template catalogs.
- Sketchfab/other online asset integration, glTF/GLB imports, texture-image material libraries and full 3D font geometry.
- Hollow/concave physics colliders, fracture/breakable physics, articulated vehicles and configurable simulation FPS.
- Annotation tracking overlays, equation-generated sketches, dedicated road tools, graph/content-creation extensions, webcam mirror/recording workflows, online accounts/cloud sharing and translation.
- AR/VR hardware verification and controller interaction tests; broad browser/device and long-duration performance testing.

These items are explicitly unfinished; the studio should not be described as containing every PictoBlox feature.

## Verification — 24 November 2026

49 JavaScript tests pass, including 15 new XR tests. Tests cover templates, transform limits, malformed object data, source/media restrictions, behavior validation, sketch constraints, joint references, serialization, real gravity/floor collision, a real fixed constraint, all three CSG operations, unique template names, unsafe thumbnails and source-size limits. Syntax checks pass for the new modules and the Paint integration change.

Browser checks completed on the local development server:

- Dashboard, category filtering, grid/list switching and new-project form; counts 9/1/2/2/2/2 for All/Physics/Game/Animation/Tracker/Environment. Seven templates are available and two tracker cards are explicitly unavailable.
- Default scene renders with original bear and sphere; City template renders houses and trees.
- Layer selection and transform gizmos rendered; numeric properties applied; duplicate, Undo/Redo, Save and reload exercised.
- Enabled physics, raised a sphere to y=5, observed it on the ground during simulation, and verified Stop restored y=5.
- UI union on overlapping boxes; all three operations also tested against the bundled engine in Node.
- Rectangle sketch extrusion, circle path creation, follow-path attachment and continuous rotate behavior added and played.
- Fixed joint added through the UI and Play/Stop exercised. Fixed constraint separation is also tested numerically.
- Python printed XR Python works and visibly changed the original bear to orange and moved it left. An initial missing worker-state field was found and corrected during testing.
- Geometry-only triangle OBJ imported and selected in the layer list.
- PNG and .xr.json downloads confirmed through browser download events.
- Save backups appeared; an unsaved edit produced Cancel / Save and leave / Leave without saving choices, and Cancel preserved the editor.
- Compact 480 × 800 creation form and 1280/1920 desktop screens visually checked. No captured console errors in the final tab.

Not verified end-to-end in this browser: real XR hardware, audio/video codecs/playback, HTTPS remote project hosting/CORS, project JSON import picker round-trip, hinge dynamics, dashboard pagination with more than 12 projects, or real touch/stylus input. Model validation and engine tests cover parts of these flows, but are not substitutes for device testing.

## Python example

```python
bear = XRObject("Scout Bear")
bear.set_color("#ff9900")
bear.move(-2, 0, 0)
print("Scene updated")
```

Use unique object names. Scripts modify the editable scene after completing; they are not frame callbacks. Invalid command batches are rejected without applying a partial scene update. Stop Python terminates its worker. Project size limit: 200 objects. Imported media and geometry can fill browser storage: export project files for durable backups. This format does not import proprietary PictoBlox projects.

## Research sources

The screenshots guided the project/dashboard layout. Official descriptions guided the capability checklist:

- [Getting Started with PictoBlox 3D and XR Studio](https://ai.thestempedia.com/docs/pictoblox/3d-and-xr-studio/getting-started-with-pictoblox-3d-and-xr-studio/)
- [PictoBlox release notes](https://thestempedia.com/product/pictoblox/release-notes/)
- [3D and XR Studio Physics](https://ai.thestempedia.com/extension/3d-and-xr-studio-physics/)

## Dependencies

Vendored locally for offline core rendering: Three.js 0.170.0, OrbitControls, TransformControls, OBJLoader; cannon-es 0.20.0; three-csg-ts 3.2.0. All use MIT licenses; notices are in vendor/xr. The addon imports were rewritten to the local Three.js module. Python reuses the existing local Pyodide runtime. No new npm install/build step is required to run the studio.

The studio uses separate block-studio.xr.projects.v1 browser storage and its own script worker. Paint and notebook data remain separate. Paint.close now ignores calls when Paint is already hidden, preserving the previous editor body state when XR opens.

Changes are local. No new GitHub commit or push was performed for XR. The earlier Paint commit remains subject to the previously reported credential blocker.

## Scene settings update — 24 November 2026

Added an independently scrolling Editor Settings inspector with validated scene colors, embedded background image upload/removal, exponential fog, exposure, main/AR editor camera selection, camera FOV and positions, ground settings, light switches/colors/intensities, grid/axes/helper switches, snap spacing, simulation rates (30/60/120 Hz), and XYZ gravity. Apply Settings commits one undoable change. Save/export preserves the active scene and all other scenes. Up to eight independently editable scenes are supported, with add, switch, remove, and undo/redo. System layers open scene settings; model layers retain their object inspector. The left hierarchy remains visible by default. Camera movement buttons and Joints shortcut are connected.

Soft Rigid is a six-node spring sphere preview; other meshes remain rigid. This is not a complete soft-body engine or PictoBlox parity. Hardware AR/VR and camera selection during a native immersive session remain unverified on this browser. Unsupported tracking and other previously documented gaps remain.

Validation: 52 automated JavaScript tests passed, including settings bounds, legacy migration, multi-scene serialization, and a 600-step soft-sphere floor simulation. Browser checks passed for project creation, settings application, invalid gravity rejection, save/reload persistence, settings undo/redo, adding and switching independent scenes, system camera view, six navigation buttons, layer search, and Play/Stop. No browser error logs were reported during these checks. Background image upload and hardware immersive sessions were not exercised in this update; do not interpret this report as exhaustive feature certification.

## Layers hierarchy update — 24 November 2026

Replaced the flat list with an indented, expandable scene tree, including cameras and their Audio Listener entries, geometry groups, and actual named procedural/imported model children. The screenshot's Tobi deformation skeleton is not present in the original Scout Bear asset; no fake bone rows were added. Existing OBJ groups retain their imported names. Each part supports local translation/rotation/scale, rename, visibility, mesh color, reset, gizmo transforms, undo, and save/reload through validated part overrides. Search retains matching ancestors and temporarily reveals collapsed matches. Layer menu supports Add Layer (opens the current library), expand all, and collapse all. Keyboard Up/Down/Home/End moves through layer labels.

The Joints footer now expands to show actual fixed/hinge constraints, opens the modeling controls, selects connected objects, and removes constraints with Undo support. Fixed an overlapping footer that intercepted model-row clicks by giving the hierarchy its own scroll region.

Audio Listener entries expose a shared playback volume/mute setting for embedded HTML audio/video; this is not spatial audio. Volume/mute settings are saved per scene. Full skeletal rigging, deformation joints, and spatial audio are still not implemented.

Validation: all 55 automated JavaScript tests pass. Browser checks covered part selection, rename/rotation, hide + Undo, reset, invalid zero scale rejection, saved part reload, ancestor-aware search, expand/collapse menus, listener setting changes, joint shortcut, fixed-joint creation, simulation Play/Stop, joint removal, Undo/Redo. Audible media output, imported skeletons, and hardware XR were not verified in this update.

Reference reviewed: STEMpedia's official Solar System Using 3D and XR Studio notes (https://ai.thestempedia.com/example/solar-system-using-3d-and-xr-studio/) describes layer renaming and the Layers menu Add Layer > camera workflow. This implementation's Add Layer opens its supported object library; it does not yet add arbitrary extra perspective cameras or camera animation states.

Ground zoom fix: the grid now covers the configured ground size instead of a fixed 40-unit square. Grid divisions are capped at 1000 for performance. Orbit distance is limited to 5000, the camera far plane is 20000, and orbit cannot cross below the floor. Ground renders both sides. Browser wheel zoom verified the entire ground remains visible at distance; scene fog still intentionally fades distant surfaces. All 55 JavaScript tests pass.

Camera navigation fix: arrows pan along the camera's screen axes with distance-scaled speed. Forward/Back dolly around the existing orbit focus, respecting 0.1–5000 distance limits. Pointer hold repeats after 300 ms and stops on release, cancellation, lost capture, blur or visibility change. Keyboard activation is supported. All six click actions and keyboard activation were checked in browser; the automated suite now has 58 passing tests including rotated views, reversible pan/zoom and distance limits.

## Remaining-feature browser regression — 24 November 2026

Completed in a separate QA tab and projects (`Remaining features QA`, `200 object stress QA`), preserving the user's open editor tab.

| Check | Result |
|---|---|
| PNG background upload, visual rendering, save/reload, removal + Undo | Passed |
| Corrupt PNG import | Rejected with decode message; scene retained |
| Grouped OBJ, named children, negative face indices | Passed in browser; automated loader test added |
| External OBJ material reference | Rejected with clear error |
| WAV import and decoding | 2-second fixture, readyState 4, playback advanced |
| Audio mute/unmute and playback volume UI | Applied; native media controls added for direct inspection |
| Audio Stop | Paused and reset to time 0 |
| WebM VP8 video import/play | Decoded 160x120, 2 seconds; animated preview and scene plane rendered |
| Backup restore / Cancel / Undo | Passed; video layer disappeared on restore and returned with Undo |
| Invalid XR JSON | Rejected; open project retained |
| Tablet 768x1024 and phone 390x844 layout | Viewport remained usable; scrolling panels and controls available; no physical touch certification |
| 200-object scene | Imported, rendered, searched, edited, Undo, saved/reloaded, Play/Stop |
| 201st object | Correctly blocked |
| Modeling/sketch regression | Material edit, duplicate, valid box union, Undo and rectangle extrusion passed; invalid pair rejected safely |
| Automated JavaScript suite | 60 tests passed, including OBJ and scene-limit cases |
| Browser console errors | None observed in final QA tab |

Added native audio/video playback previews in the Library panel and decode-error messages so imported media can be inspected directly. Browser reports establish decoding/playback state; physical speaker output was not independently listened to or calibrated. Codec coverage is limited to the generated WAV and VP8/WebM fixtures, not every supported container/codec combination.

Not completed: physical AR/VR sessions, native touch-device gestures, Firefox/Safari/other engines, full-day endurance/leak profiling, live external HTTPS/CORS project links, and every modeling operation through every UI combination. Face/hand tracking, full skeletal deformation and spatial audio remain implementation gaps. The existing Python unittest discovery run did not complete in this session and was stopped; no new Python test-pass claim is made. Python scene scripts were not rerun in this regression pass.

## Button audit and fixes — 24 November 2026

Reproduced and fixed:
1. Undo after a Boolean operation restored objects but lost the selected object and second modeling target. History now restores both; part selection also returns when available.
2. Boolean results imported as OBJ groups could not be used in subsequent Boolean operations. Solid child meshes now flatten into temporary world-space geometry, allowing chained operations. Temporary resources are disposed.
3. Text inspector scale exposed the sprite's built-in 4:1 width; repeated Apply multiplied the width. Inspector and gizmo serialization now normalize that built-in scale. Repeated Apply was verified at scale [1,1,1], including exported JSON validation.
4. Editor Settings opened from a selected model part could remain hidden under the part inspector. Opening Settings now switches the active panel correctly.

Modeling now displays its current object pair and requirements, offers a first-object chooser, and disables pair-dependent operations without a valid pair or during Play. Transform controls explain the need to select a model and drag its colored handles. Part selection bounds now follow the part during animation-loop redraws. Removing a behavior after stopping playback resolves the current object instead of a stale reference.

This round's browser checks: all 13 object-library buttons including text; Move/Rotate/Scale tool selection; Snap on/off; Focus; Front/Top/Perspective; Place on ground; duplicate/delete with Undo/Redo; Union/Subtract/Intersect including empty-intersection feedback and overlapping success; chained Union using an OBJ result; Align X/Y/Z; hinge joint creation, Play/Stop, removal and history; sketch clear/rectangle/circle/extrude/path/follow; behavior add/remove; Python Run (42 + scene color), Stop and restart (restarted), Go-to-code panel; help dialog; local-session sign-in dialog open/close; project export and PNG snapshot file generation; first-object chooser; Settings open/close from part selection. Prior round covers background/media imports, invalid input, backups and scene limits.

61 automated JS tests pass. Exported JSON passed project validation with 18 objects. No browser console errors were observed in the final audit tab. This is not full PictoBlox certification. Hardware AR/VR, cloud accounts, non-English localization, trackers and skeletal deformation remain unsupported/unverified as documented above. Feedback export, external HTTPS links and every dashboard pagination branch were not rerun in this round. Local-session Sign In is explicitly local only.

## Recovery fixes — 24 November 2026

Saved projects now retain bounded Undo/Redo history under a per-project local-storage key. History includes selections/modeling pairs, is tied to the exact saved revision, and ignores stale, malformed or foreign-project entries. At most 40 snapshots per direction are retained, further trimmed to one million serialized characters to limit browser storage use. History is persisted when Save succeeds; old history from before this update cannot be reconstructed, and unsaved edits are not guaranteed across refresh. Privacy/storage read failures fall back to an empty history.

Undo and Redo now have explicit text labels and shortcut tooltips. A temporary Isolate selected / Show all objects viewport toggle makes it possible to inspect the bear without changing other models' saved visibility. Saving no longer replaces a storage-failure message with success; it rolls back the in-memory saved-project list, and Save and leave refuses to leave after failure. Backup writes still remain best effort.

Validation: all 64 JS tests pass. New history tests cover selection/redo serialization, stale and malformed data rejection, foreign project rejection, and bounded retention. Browser: create box, Save, reload, Undo removes box, Redo restores box; Save after Undo, reload, Redo is still available and restores the box. Isolate and Show all verified visually; no console errors observed. Storage failure handling was reviewed in code; actual quota exhaustion was not induced in the user's browser.
