# Dedicated notebook workspace update

The notebook now has a dedicated sidebar, cell-type toolbar, selected-cell controls, bottom execution bar and a collapsible output terminal. Open /?editor=notebook directly.

Implemented: insert above/below, delete selected cell, Code/Markdown switch, Run selected, Run All, Run All Above/Below (strictly excluding selected cell), Restart, Restart & Run All, Restart & Clear Output, Stop, terminal clear/show/hide, and notebook-specific File New/Import/Save. Ctrl+S exports .ipynb. Entering notebook mode from another editor resets the shared worker so source-editor variables do not leak into the notebook. Re-selecting the notebook tab keeps notebook variables. Package configuration and stage remain shared project resources; there are not two simultaneous Python kernels.

Scope: layout and handlers are limited to notebook mode. The stage remains beside it as in the reference. Markdown and figure persistence limitations from BROWSER-UPGRADE.md still apply. The terminal displays output and errors; interactive input continues through the existing input prompt.

Verified in browser: direct notebook startup; correct selected tab; insert/delete selected cell; Run Above then Run selected yielding 42; Run Below; Restart & Run All yielding 42; Restart & Clear Output removing both cell outputs and terminal text; type dropdown; terminal show/hide. Small-window layout was inspected and horizontal toolbar overflow corrected. JavaScript syntax checks passed and 21 Node tests passed. Python unittest rerun could not complete in the restricted local environment (asyncio initialization stalled); the earlier 9-test result is historical, not a fresh result for this change.

## Reference alignment correction
The notebook uses a 191px desktop sidebar, a 31.5vw stage column with a 4:3 stage, a separate 90px backdrop column, a top-row cell toolbar and an 82px execution row spanning the notebook including its sidebar. Sprite fields use two rows, with thumbnails below and add buttons at the bottom. Other workspace DOM structure is restored when leaving notebook mode. Checked at 1920x990 and the normal smaller browser window. The stage measured 605x454 with no page overflow and zero sprite-center offset at x=0,y=0. Branding and existing artwork remain Block Studio assets; this is an alignment correction, not a claim of identical proprietary artwork. See notebook-alignment-checks.json.

## Sidebar hover menus
The Python and package launchers now use SVG icons, purple vertical flyouts, red hover tooltips and a red active circle. The Python menu offers new Python helper, Python import, image import, text import and CSV/TSV import. The lower cube offers Install Packages and Add Extension. Project Files has refresh and a three-dot menu for notebook import/export.

Unlabelled reference icons were interpreted as those file actions; only Add a new file was labelled in the supplied screenshots. Python helpers use a notebook-local editing dialog, remain importable, and also receive an embedded module-writing cell so notebook exports retain their source. Imported image/text/table content is embedded into executable cells; running the cell creates the file in the Python filesystem. Data imports are limited to 64 KB; helper source is limited to 50,000 characters. Imported cells are never run automatically. Package compatibility and existing persistence limits still apply.

Verified all five file actions, both lower-menu destinations, keyboard arrow navigation, Escape dismissal and persistence after reload. See sidebar-checks.json. Existing 21 Node tests and JavaScript syntax checks pass. These checks do not imply pixel-identical proprietary icons or exhaustive browser coverage.
