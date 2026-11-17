# Browser upgrade validation — 2026-11-17

- Automated: 21 Node tests and 9 Python tests passed.
- Syntax: 10 top-level JavaScript files passed node --check.
- Browser: 28 recorded feature checks passed; see feature-checks.json.
- Tested package versions: NumPy 2.4.6, emoji 2.16.0, Matplotlib 3.10.8.
- Notebook reset also visibly confirmed kernel-reset status.

This is targeted upgrade validation, not exhaustive coverage of every button. Camera/microphone permissions, real hardware, perceptual audio, and full proprietary PictoBlox parity remain unverified or unimplemented. The older QA-REPORT.md describes the earlier audit. See BROWSER-UPGRADE.md for precise scope.
