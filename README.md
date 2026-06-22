---
abstract: User and developer setup notes for the Electron Satisfactory save map uploader.
out_of_scope: Product requirements, implementation planning, third-party website internals, and Store submission.
---

# Satisfactory Save Map Uploader

Satisfactory Save Map Uploader is an unofficial community desktop app for Windows. After you grant permission, it watches the default local Satisfactory save directory and uploads the latest `.sav` file to the Satisfactory Calculator interactive map embedded on the right side of the main app window.

This project is not affiliated with, endorsed by, or sponsored by Coffee Stain Studios, Coffee Stain Publishing, or Satisfactory Calculator. It depends on the third-party website `https://satisfactory-calculator.com/zh/interactive-map`; website changes or outages can break upload automation.

## For Users

Install the Windows build from the generated installer, or extract the portable zip and run the app without installing. The V1 app opens a first-run permission gate before showing the uploader dashboard. After permission is granted, the dashboard shows the current save and the main watch/upload controls.

On first launch, the app does not scan saves, open the map page, or upload anything until you choose **Allow uploads**. That choice allows the app to provide selected `.sav` files to the third-party Satisfactory Calculator map page for processing, but the watcher stays stopped until you click **Start automatic upload**. Choosing **Not now, exit** closes the app without saving permission or starting the watcher.

Available actions:

- Start automatic upload
- Pause watching
- Upload latest save
- Disable uploads

Pause watching is temporary and preserves permission. Disable uploads stops future automatic uploads, records a local revoked state that takes priority on restart, and returns to the permission gate until uploads are allowed again. This cannot take back a save file that was already provided to the third-party page.

Unsigned GitHub beta installers and portable zips can trigger Windows SmartScreen warnings.

## For Developers

```powershell
pnpm install
pnpm run dev
```

In packaged production runs, the map window allows resources only from
`satisfactory-calculator.com`, `static.satisfactory-calculator.com`, and the
site dependency CDN `cdn.jsdelivr.net`. Other third-party resource hosts are blocked.

In development startup, map-window resource requests are recorded to
`dev-map-resource-requests.ndjson` under Electron `userData`. The default
development mode uses the same allow-list blocking policy and logs sanitized
request metadata plus each allow/block decision. To collect audit-only request
data without blocking, set `SATISFACTORY_MAP_RESOURCE_FILTER=audit` before
starting the app. For visual validation, `SATISFACTORY_MAP_SHOW_ON_CREATE=1`
shows and focuses the map view when it is first created.

## Commands

```powershell
pnpm run check
pnpm run build
pnpm run package
pnpm run verify:package
pnpm run smoke:package
pnpm run integration:package
pnpm run make
pnpm run make:installer
pnpm run make:portable
pnpm run verify:make
pnpm run verify:installer
pnpm run verify:portable
```

- `pnpm run dev` and `pnpm run start` launch the Electron development app.
- `pnpm run build` typechecks without opening a GUI.
- `pnpm run package` creates an unpacked Windows x64 Electron package under `out/SatisfactorySaveMapUploader-Portable-<version>-x64/`.
- `pnpm run verify:package` audits the unpacked package, ASAR, fuses, source maps, Authenticode status, and forbidden artifacts.
- `pnpm run smoke:package` starts the real unpacked executable with `--smoke-test` and does not read saves or load third-party URLs.
- `pnpm run integration:package` starts the real unpacked executable with `--integration-test-upload`, uses a local synthetic `.sav`, serves a loopback fixture page, verifies real Electron/CDP file selection, does not read real game saves, and does not access the real Satisfactory Calculator website.
- `pnpm run make` creates both Windows x64 release artifacts under `out/make/`.
- `pnpm run make:installer` creates only the guided installer.
- `pnpm run make:portable` creates only the portable zip.
- `pnpm run verify:make` checks both release artifacts and writes SHA-256 checksum files.
- `pnpm run verify:installer` checks only the guided installer.
- `pnpm run verify:portable` checks only the portable zip.
- `pnpm run make:appx` creates the Store-oriented AppX package when the Microsoft Store path is being validated.
- `pnpm run verify:appx` checks the AppX artifact and writes its SHA-256 checksum file.

Install git hooks when `pre-commit` is available on `PATH`:

```powershell
pnpm run hooks:install
```

## Manual Validation

Build/package success is not product acceptance. Real website upload behavior and clean Windows package behavior require the checklist in [docs/manual-acceptance.md](docs/manual-acceptance.md).
