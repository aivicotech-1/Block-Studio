# Layout and wording review

The shared layout polish corrects medium-window editor compression, toolbar/content overlap, filename clipping, helper-file horizontal scrolling, long-code word wrapping, sprite-field collisions, button spacing, duplicate accessible names, modal label wrapping, and misleading package-panel guidance. Desktop notebook proportions are retained. At 1050px and below, the stage moves below the editing workspace. Blocks use a wider script region with the stage below at these sizes. Compact source-editor tabs and execution controls have separate rows.

Browser checks: Notebook, Blocks, Python source editor, Costumes and Sounds at measured 838px width, plus notebook and package dialog at measured 1280px width. No horizontal page overflow in these checks; toolbar bottom equals content top. Insert/delete notebook cells and fullscreen stage/Escape return were also checked. Screenshots delivered as layout-polish-desktop.jpg and layout-polish-compact.jpg. See layout-checks.json.

21 existing Node tests pass and the changed JavaScript files pass syntax checks. This review does not establish exhaustive device/browser coverage or complete testing of every modal. CSS rules for narrower phones are included, but a measured phone-width run was not obtained in the available browser session. No new Python execution behavior was added.

## Header overlap regression fix
Removed fixed notebook header height and viewport-positioned stage controls. The header can grow to contain wrapped icons, while stage controls are real children of the toolbar in notebook mode and return to the stage panel in other modes. Header children and toolbar controls were geometrically contained with separate rows at measured widths 838, 1100 and 1200px. Workspace switching restored the controls to their original parent. See header-checks.json.
