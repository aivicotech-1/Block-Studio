# Paint Editor verification — 22 November 2026

Open http://127.0.0.1:5500/?editor=paint or choose Paint on the home screen.

## Fixes from the testing pass

- Eraser has its own remembered size (24 pixels initially), a size cursor, and immediate numeric width updates. It removes pixels to transparency; the white paper is the preview background.
- New drawing is visible in the header. It asks before clearing and the previous artwork can be recovered with Undo in the same session. Saved drawings are restored on refresh; an orange rectangle is not inserted by startup code.
- Selecting an object no longer creates an empty Undo step. Shape/brush/eraser color changes no longer recolor the previous selected object. Bucket colors apply when clicking the target.
- Selection tests rendered opacity, allowing objects beneath transparent imported/flood-filled regions to be selected.
- All six thickness presets remain available on narrow screens, with an active indicator. Numeric text size updates immediately.
- PNG export uses a Blob download, verified with a browser download event. Editable JSON downloads also verified.
- Imports reject objects whose geometry does not match their type, preventing render failures. Recovery writes immediately after completed changes.
- Zoomed paper stays reachable by scrolling. Fit resets scrolling. Paint shortcuts yield to the local-session dialog.

## Verification performed

Node: `node --test tests/*.test.cjs` — 30 passed. `node --check paint-studio.js` and `node --check paint-model.js` passed.

Browser checks on the local development server:

| Area | Result |
| --- | --- |
| Line, ellipse, rectangle, rounded rectangle, triangle, four arrows, pentagon, hexagon, star, heart | Drawn individually; rendered together and visually inspected |
| Brush / eraser | Strokes drawn; 24- and 60-pixel erasing visually verified; eraser undo/redo checked |
| Select / move / resize / reshape | Drag movement, corner resize and polygon node drag exercised |
| Duplicate / delete / flip / layer order | Every right-side button exercised; asymmetric arrow flip visually checked |
| Fill / outline / palette | All 17 color/no-color swatches checked, bucket on shape and background checked |
| Custom color / widths / text | Hex input applied, all six presets checked, text insertion and numeric sizing visually checked |
| New drawing / recovery | Confirmation and clearing checked; refresh restores artwork and drawing name |
| JSON / PNG | Editable JSON download and import checked, invalid JSON geometry rejected, PNG image imported, Blob PNG download confirmed |
| Costume / backdrop transfer | Both report success, backdrop entry observed after returning to Block Studio |
| Help / language / settings | Informational dialogs and grid toggle exercised |
| Local session | Existing local-only sign-in dialog opened and dismissed; no external account authentication exists |
| Exit / reopen | Returned to home and reopened through Paint card |
| Layout | Visually checked at 480 × 800, 1280 × 800 and 1920 × 985 |
| Runtime | No captured console errors in the final test tab |

## Limits and remaining manual checks

Camera capture needs a real camera and browser permission and is not marked verified. The permission-dismissed error was visible and handled without crashing. Copy/paste keyboard verification was blocked by the automation browser virtual clipboard; duplication works through its toolbar button. Arrow movement, Delete and Ctrl+Z were exercised. Cross-browser testing (Firefox, Safari, Edge), touch/pen devices and long-duration memory stress have not been performed.

This is an independent browser implementation inspired by the supplied reference. It does not include full Bezier curve editing, grouping, SVG import or online accounts. Reshape handles polygon and stroke points. Drawings support up to 500 objects, 40 undo snapshots, a 960 × 720 canvas and embedded PNG/JPEG/WebP/GIF imports. PNG output preserves transparency. Browser storage can fill; export editable JSON for backups. Undo history is session-only.

Paint uses separate browser storage (`block-studio.paint.v1`) and only adds artwork to costumes/backdrops when explicitly chosen. Testing used localhost separately from the user's 127.0.0.1 origin. The user's saved artwork was retained.

## Reference documentation

The provided screenshot guided layout. Official PictoBlox material informed the tools; no full public developer specification for the exact standalone editor was found:

- https://ai.thestempedia.com/docs/pictoblox/
- https://thestempedia.com/product/pictoblox/release-notes/
- https://ai.thestempedia.com/wp-content/uploads/2023/04/CL9_CH2_Animations-with-Python.pdf

These changes are included in the Paint Editor update.

## Bin and toolbar follow-up

The bin now clears the whole painting after confirmation, works without selecting an object, and is disabled only when the drawing is empty. Delete/Backspace still removes the selected object. Browser verification covered clearing with no selection, Undo restoring all artwork, and Redo clearing it again. The artwork was restored after testing. Right-side actions have equal two-column dimensions and consistent pair separators, including on narrow screens. At 1280 px each action measured 63.6 × 67 px with paired row positions 74, 175, 276 and 377 px.

## Arrow icon follow-up

Redrew layer icons as symmetric up/down pairs with separate boundary bars, centered with flex alignment. Browser checks showed effectively zero SVG center offset inside all four layer buttons. Tested backward, forward, bottom and top ordering on overlapping orange/blue rectangles; verified visible stacking and disabled boundary actions. Test geometry was undone afterward. Eraser overlays remain hidden, and its dedicated 1–100 px slider updates size immediately. Numeric text-size fields normalize to 8–240 on blur.
