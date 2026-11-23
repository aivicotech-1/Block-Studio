# Paint regression report — 23 November 2026

## Result

Core browser regression completed on the local development build. Four issues corrected in this pass; 34 automated JavaScript tests pass (11 cover the paint model/history). Hardware camera capture, native clipboard behavior and additional browser engines remain manual release checks. This is not a claim that all possible bugs are eliminated.

## Fixes

1. Undo/redo now restores the drawing name together with its objects after New drawing or project import. Previously the geometry was restored under the wrong name.
2. Cancelling a zero-sized shape preserves the redo branch instead of silently dropping it. History cloning, the 40-step bound and branch invalidation have regression tests.
3. Escape dismisses the costume plus menu when the Paint canvas has focus. Previously Paint's keyboard capture prevented the menu listener from receiving Escape.
4. Paint in the Costumes tab now creates a new blank costume. Previously it opened the existing costume for editing. Verified a new list entry and the name Painted costume.

## Browser coverage

| Area | Evidence / outcome |
| --- | --- |
| All 13 shape tools | Drawn in a grid; line, ellipse, rectangles, triangle, four arrows, pentagon, hexagon, star and heart visually inspected |
| Brush and eraser | Blue brush stroke drawn and split by a 100 px eraser; no eraser selection box; undo/redo exercised |
| Move / resize / reshape | Rectangle moved, lower-right resize used, polygon node dragged; resulting geometry inspected |
| Object actions | Duplicate, flip X/Y, backward/forward, back/front clicked on selected geometry; Delete and Ctrl+Z exercised |
| Palette and thickness | Standard swatches and six preset widths exercised; numeric width/eraser range checked; custom valid and invalid hex input checked |
| Text | Text inserted, resized to 56 px, outline color and width changed; visible output inspected |
| Fill and selection | Background flood fill applied; text beneath transparent fill pixels remained selectable |
| Clear canvas | Cancel retained artwork; confirm disabled empty bin; Undo restored artwork; Redo cleared it again |
| Project history | Valid JSON import changed name; Undo restored QA document 23 Nov. New drawing name/geometry covered by the new model tests |
| Save / export | Browser download events confirmed for editable JSON and PNG |
| Invalid import | Type/geometry mismatch rejected with Object geometry does not match its type; drawing retained |
| Browser recovery | Refresh restored the named document and rendered artwork |
| Plus menu | Choose, Paint, upload, outside dismissal and Escape exercised; Paint activates brush |
| Costume library | All 11 filters checked, counts 84/9/5/4/4/4/4/4/10/36/4. No-match search checked. Robot inserted and rendered on canvas |
| Upload | PNG fixture selected through the browser file chooser and inserted; Undo removed fixture |
| Transfer | Use as costume and Use as backdrop reported success in the isolated test project |
| Header | Help, language information, drawing details, grid toggle and local-session dialog opened/dismissed |
| Zoom | In/out and Fit exercised |
| Navigation | Return to home/Blocks, Costumes tab and direct Paint entry checked |
| Layout | Visually inspected at 480 × 800, 1024 × 768, 1280 × 720/800 and 1920 × 985. Controls and eraser slider remain accessible |
| Runtime | No captured console errors in final test tab |

## Manual checks before public release

- Camera: real device permission, preview, capture and cancellation. No permission was granted during automated tests.
- Native Ctrl+C / Ctrl+V: automation's virtual clipboard did not conclusively exercise the application's internal paste handler. Toolbar duplication works. Clipboard behavior is not marked passed.
- Firefox / Safari / Edge, real touch and stylus input, long-duration memory use and storage-quota behavior.
- SVG import, grouping and full Bezier editing are not implemented. Reshape edits polygon/stroke nodes; informational language/account actions do not provide translation or online accounts.

## Reproduction

Run the local server from this folder, then open http://127.0.0.1:5500/?editor=paint. Run `node --test tests/*.test.cjs` for the JavaScript suite. Syntax-check paint-model.js, paint-studio.js and costume-library.js with `node --check`.

Testing used localhost separately from the user's 127.0.0.1 storage. QA artwork and test costumes are in the localhost project; the user's saved drawing was not cleared. The server was restarted and remains running. Source and ZIP updated; this report accompanies the Paint Editor commit.
