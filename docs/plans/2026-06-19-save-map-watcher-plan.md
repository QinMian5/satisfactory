---
abstract: Implementation plan for the Satisfactory save map watcher.
out_of_scope: Windows service packaging, system tray UI, save parsing, third-party API reverse engineering, and multi-directory configuration.
---

# Save Map Watcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows-local TypeScript script that watches Satisfactory `.sav` files and keeps one Satisfactory Calculator interactive map page loaded with the latest save.

**Architecture:** The command-line entrypoint resolves the default Windows save root, scans for the newest `.sav`, uploads it through one Playwright-controlled Chromium page, and watches for later `.sav` changes with a 2 second debounce. Local pure logic lives in small modules so save discovery and debounce behavior can be tested without the third-party website.

**Tech Stack:** Node.js, TypeScript, pnpm, Playwright, Biome, Vitest, pre-commit, commitlint.

---

## File Structure

- Create `package.json`: pnpm command surface, dependencies, and scripts.
- Create `tsconfig.json`: TypeScript compiler configuration for `src` output to `dist`.
- Create `biome.json`: formatting and lint rules matching the reference repository style.
- Create `commitlint.config.cjs`: conventional commit validation.
- Create `.pre-commit-config.yaml`: local pre-commit and commit-msg hooks.
- Create `.gitignore`: excludes generated and dependency directories.
- Create `README.md`: operator setup, run, and manual validation notes.
- Create `src/saves.ts`: default save-root resolution and recursive latest `.sav` selection.
- Create `src/debounce.ts`: small debounced async task runner.
- Create `src/uploader.ts`: Playwright browser/page lifecycle and save upload automation.
- Create `src/index.ts`: startup scan, file watcher, debounce wiring, and shutdown handling.
- Create `test/saves.test.ts`: save discovery and default save-root tests.
- Create `test/debounce.test.ts`: debounce coalescing tests.
- Generate `pnpm-lock.yaml` with `pnpm install`.

## Task 1: Project Metadata And Quality Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `biome.json`
- Create: `commitlint.config.cjs`
- Create: `.pre-commit-config.yaml`
- Create: `.gitignore`
- Create: `README.md`
- Generate: `pnpm-lock.yaml`

- [ ] **Step 1: Initialize new files from templates**

Run:

```powershell
orbital-init-from-template package.json tsconfig.json biome.json commitlint.config.cjs .pre-commit-config.yaml .gitignore README.md
```

Expected: each file is created once. Existing files are not overwritten.

- [ ] **Step 2: Write `package.json`**

Replace `package.json` with:

```json
{
  "name": "satisfactory-save-map-watcher",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "lint": "biome ci .",
    "fix": "biome check --write .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest --run",
    "check": "pnpm run lint && pnpm run typecheck && pnpm run test",
    "hooks:install": "pre-commit install --hook-type pre-commit --hook-type commit-msg"
  },
  "dependencies": {
    "playwright": "^1.57.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.16",
    "@commitlint/cli": "^21.0.2",
    "@commitlint/config-conventional": "^21.0.2",
    "@types/node": "^24.12.3",
    "tsx": "^4.22.4",
    "typescript": "^6.0.3",
    "vitest": "^4.1.8"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

Replace `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 4: Write `biome.json`**

Replace `biome.json` with:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.0/schema.json",
  "files": {
    "ignoreUnknown": true,
    "includes": ["**", "!**/node_modules", "!**/dist"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "preset": "recommended"
    }
  }
}
```

- [ ] **Step 5: Write hook configuration**

Replace `commitlint.config.cjs` with:

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

Replace `.pre-commit-config.yaml` with:

```yaml
# abstract: Local repository hooks for formatting, checks, and commit-message policy.
# out_of_scope: CI provider configuration, product-specific hooks, and remote hook repositories.

repos:
  - repo: local
    hooks:
      - id: root-check
        name: root check
        entry: pnpm run check
        language: system
        pass_filenames: false
        stages: [pre-commit]
      - id: commitlint
        name: commitlint
        entry: pnpm exec commitlint --edit
        language: system
        stages: [commit-msg]
```

- [ ] **Step 6: Write `.gitignore` and `README.md`**

Replace `.gitignore` with:

```gitignore
node_modules/
dist/
coverage/
.env
```

Replace `README.md` with:

```markdown
---
abstract: Operator setup and usage notes for the Satisfactory save map watcher.
out_of_scope: Product requirements, implementation planning, and third-party website internals.
---

# Satisfactory Save Map Watcher

This tool watches the default Windows Satisfactory save directory and uploads the latest `.sav` file to the Satisfactory Calculator interactive map.

## Setup

```powershell
pnpm install
pnpm exec playwright install chromium
```

Install git hooks when `pre-commit` is available on `PATH`:

```powershell
pnpm run hooks:install
```

## Run

Development mode:

```powershell
pnpm run dev
```

Compiled mode:

```powershell
pnpm run build
pnpm run start
```

## Check

```powershell
pnpm run check
```

## Manual Validation

Start the tool, confirm one Chromium page opens on the interactive map, and confirm the newest `.sav` under `%LOCALAPPDATA%\FactoryGame\Saved\SaveGames` is uploaded. Save the game or overwrite a `.sav` file and confirm the same browser page uploads the newest save again after about 2 seconds.
```

- [ ] **Step 7: Install dependencies**

Run:

```powershell
pnpm install
```

Expected: `node_modules` and `pnpm-lock.yaml` are created. The command exits with code 0.

- [ ] **Step 8: Run lint against configuration**

Run:

```powershell
pnpm run lint
```

Expected: the command exits with code 0 and reports no configuration syntax errors.

- [ ] **Step 9: Commit configuration**

Run:

```powershell
git add package.json pnpm-lock.yaml tsconfig.json biome.json commitlint.config.cjs .pre-commit-config.yaml .gitignore README.md
git commit -m "chore: scaffold project tooling"
```

Expected: commit succeeds when git user identity is configured.

## Task 2: Save Discovery Module

**Files:**
- Create: `src/saves.ts`
- Create: `test/saves.test.ts`

- [ ] **Step 1: Initialize files from templates**

Run:

```powershell
orbital-init-from-template src/saves.ts test/saves.test.ts
```

Expected: both files are created from the TypeScript template.

- [ ] **Step 2: Write failing tests**

Replace `test/saves.test.ts` with:

```ts
// abstract: Tests for Satisfactory save root resolution and latest-save discovery.
// out_of_scope: File watching, browser upload automation, and game save parsing.

import { mkdir, mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findLatestSave, getDefaultSaveRoot } from "../src/saves.js";

const tempRoots: string[] = [];

async function createTempRoot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "satisfactory-save-test-"));
  tempRoots.push(root);
  return root;
}

async function writeFileWithMtime(filePath: string, mtime: Date): Promise<void> {
  await writeFile(filePath, "save");
  await utimes(filePath, mtime, mtime);
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("getDefaultSaveRoot", () => {
  it("uses LOCALAPPDATA to build the Satisfactory save root", () => {
    const root = getDefaultSaveRoot({ LOCALAPPDATA: "C:\\Users\\Ada\\AppData\\Local" });

    expect(root).toBe("C:\\Users\\Ada\\AppData\\Local\\FactoryGame\\Saved\\SaveGames");
  });

  it("throws a clear error when LOCALAPPDATA is missing", () => {
    expect(() => getDefaultSaveRoot({})).toThrow("LOCALAPPDATA is not set");
  });
});

describe("findLatestSave", () => {
  it("recursively returns the most recently modified .sav file", async () => {
    const root = await createTempRoot();
    const nested = path.join(root, "account-a");
    await mkdir(nested, { recursive: true });
    const olderSave = path.join(root, "old.sav");
    const latestSave = path.join(nested, "latest.sav");
    await writeFileWithMtime(olderSave, new Date("2026-01-01T00:00:00.000Z"));
    await writeFileWithMtime(latestSave, new Date("2026-01-02T00:00:00.000Z"));

    await expect(findLatestSave(root)).resolves.toBe(latestSave);
  });

  it("ignores non-save files", async () => {
    const root = await createTempRoot();
    const save = path.join(root, "factory.sav");
    const text = path.join(root, "notes.txt");
    await writeFileWithMtime(save, new Date("2026-01-01T00:00:00.000Z"));
    await writeFileWithMtime(text, new Date("2026-01-03T00:00:00.000Z"));

    await expect(findLatestSave(root)).resolves.toBe(save);
  });

  it("returns null when no save files exist", async () => {
    const root = await createTempRoot();
    await writeFile(path.join(root, "notes.txt"), "not a save");

    await expect(findLatestSave(root)).resolves.toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```powershell
pnpm exec vitest --run test/saves.test.ts
```

Expected: FAIL because `../src/saves.js` does not export `findLatestSave` or `getDefaultSaveRoot`.

- [ ] **Step 4: Implement save discovery**

Replace `src/saves.ts` with:

```ts
// abstract: Satisfactory save root resolution and latest-save discovery.
// out_of_scope: File watching, browser upload automation, and save-file parsing.

import { readdir, stat } from "node:fs/promises";
import path from "node:path";

type Environment = {
  LOCALAPPDATA?: string;
};

type SaveCandidate = {
  filePath: string;
  modifiedMs: number;
};

export function getDefaultSaveRoot(env: Environment = process.env): string {
  if (!env.LOCALAPPDATA) {
    throw new Error("LOCALAPPDATA is not set; cannot locate Satisfactory saves.");
  }

  return path.join(env.LOCALAPPDATA, "FactoryGame", "Saved", "SaveGames");
}

export async function findLatestSave(root: string): Promise<string | null> {
  const latest = await findLatestSaveCandidate(root);
  return latest?.filePath ?? null;
}

async function findLatestSaveCandidate(root: string): Promise<SaveCandidate | null> {
  const entries = await readdir(root, { withFileTypes: true });
  let latest: SaveCandidate | null = null;

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      const nestedLatest = await findLatestSaveCandidate(entryPath);
      latest = chooseLatest(latest, nestedLatest);
      continue;
    }

    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".sav") {
      continue;
    }

    const metadata = await stat(entryPath);
    latest = chooseLatest(latest, {
      filePath: entryPath,
      modifiedMs: metadata.mtimeMs,
    });
  }

  return latest;
}

function chooseLatest(
  current: SaveCandidate | null,
  candidate: SaveCandidate | null,
): SaveCandidate | null {
  if (!candidate) {
    return current;
  }

  if (!current || candidate.modifiedMs > current.modifiedMs) {
    return candidate;
  }

  return current;
}
```

- [ ] **Step 5: Run save tests**

Run:

```powershell
pnpm exec vitest --run test/saves.test.ts
```

Expected: PASS for all tests in `test/saves.test.ts`.

- [ ] **Step 6: Run typecheck**

Run:

```powershell
pnpm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit save discovery**

Run:

```powershell
git add src/saves.ts test/saves.test.ts
git commit -m "feat: find latest satisfactory save"
```

Expected: commit succeeds when hooks pass.

## Task 3: Debounced Async Task Runner

**Files:**
- Create: `src/debounce.ts`
- Create: `test/debounce.test.ts`

- [ ] **Step 1: Initialize files from templates**

Run:

```powershell
orbital-init-from-template src/debounce.ts test/debounce.test.ts
```

Expected: both files are created from the TypeScript template.

- [ ] **Step 2: Write failing debounce tests**

Replace `test/debounce.test.ts` with:

```ts
// abstract: Tests for coalescing rapid events into a single async task run.
// out_of_scope: Filesystem watching, save discovery, and browser upload automation.

import { afterEach, describe, expect, it, vi } from "vitest";
import { createDebouncedAsyncTask } from "../src/debounce.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("createDebouncedAsyncTask", () => {
  it("runs once after rapid repeated scheduling", async () => {
    vi.useFakeTimers();
    const task = vi.fn().mockResolvedValue(undefined);
    const schedule = createDebouncedAsyncTask(task, 2_000);

    schedule();
    schedule();
    schedule();

    expect(task).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1_999);
    expect(task).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("runs with the latest task state at execution time", async () => {
    vi.useFakeTimers();
    let latestSave = "first.sav";
    const uploaded: string[] = [];
    const schedule = createDebouncedAsyncTask(async () => {
      uploaded.push(latestSave);
    }, 2_000);

    schedule();
    latestSave = "second.sav";
    schedule();
    await vi.advanceTimersByTimeAsync(2_000);

    expect(uploaded).toEqual(["second.sav"]);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```powershell
pnpm exec vitest --run test/debounce.test.ts
```

Expected: FAIL because `../src/debounce.js` does not export `createDebouncedAsyncTask`.

- [ ] **Step 4: Implement debounce runner**

Replace `src/debounce.ts` with:

```ts
// abstract: Debounced async task scheduling for rapid save-file change events.
// out_of_scope: Filesystem watching, save discovery, and browser upload automation.

export function createDebouncedAsyncTask(task: () => Promise<void>, delayMs: number): () => void {
  let timer: NodeJS.Timeout | undefined;

  return () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      task().catch((error: unknown) => {
        console.error(error);
      });
    }, delayMs);
  };
}
```

- [ ] **Step 5: Run debounce tests**

Run:

```powershell
pnpm exec vitest --run test/debounce.test.ts
```

Expected: PASS for all tests in `test/debounce.test.ts`.

- [ ] **Step 6: Run all tests**

Run:

```powershell
pnpm run test
```

Expected: PASS for `test/saves.test.ts` and `test/debounce.test.ts`.

- [ ] **Step 7: Commit debounce runner**

Run:

```powershell
git add src/debounce.ts test/debounce.test.ts
git commit -m "feat: debounce save uploads"
```

Expected: commit succeeds when hooks pass.

## Task 4: Playwright Map Uploader

**Files:**
- Create: `src/uploader.ts`

- [ ] **Step 1: Initialize file from template**

Run:

```powershell
orbital-init-from-template src/uploader.ts
```

Expected: `src/uploader.ts` is created from the TypeScript template.

- [ ] **Step 2: Write uploader implementation**

Replace `src/uploader.ts` with:

```ts
// abstract: Playwright browser lifecycle and save-file upload automation for the interactive map.
// out_of_scope: Save discovery, filesystem watching, and third-party API reverse engineering.

import { chromium, type Browser, type Page } from "playwright";

const MAP_URL = "https://satisfactory-calculator.com/zh/interactive-map";
const UPLOAD_PROMPT = /点击|拖拽|Click|Drag|upload|save/i;

export class MapUploader {
  private browser: Browser | undefined;
  private page: Page | undefined;

  async upload(savePath: string): Promise<void> {
    const page = await this.getPage();
    await page.goto(MAP_URL, { waitUntil: "domcontentloaded" });

    if (await this.tryFileInputUpload(page, savePath)) {
      console.log(`Uploaded save: ${savePath}`);
      return;
    }

    if (await this.tryFileChooserUpload(page, savePath)) {
      console.log(`Uploaded save: ${savePath}`);
      return;
    }

    throw new Error("Could not find the map save upload control; the page structure may have changed.");
  }

  async close(): Promise<void> {
    await this.browser?.close();
    this.page = undefined;
    this.browser = undefined;
  }

  private async getPage(): Promise<Page> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: false });
    }

    if (!this.page || this.page.isClosed()) {
      this.page = await this.browser.newPage();
    }

    return this.page;
  }

  private async tryFileInputUpload(page: Page, savePath: string): Promise<boolean> {
    const input = page.locator('input[type="file"]').first();

    try {
      await input.setInputFiles(savePath, { timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  private async tryFileChooserUpload(page: Page, savePath: string): Promise<boolean> {
    const uploadTarget = page.getByText(UPLOAD_PROMPT).first();

    try {
      const chooserPromise = page.waitForEvent("filechooser", { timeout: 10_000 });
      await uploadTarget.click({ timeout: 10_000 });
      const chooser = await chooserPromise;
      await chooser.setFiles(savePath);
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
pnpm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit uploader**

Run:

```powershell
git add src/uploader.ts
git commit -m "feat: upload saves to interactive map"
```

Expected: commit succeeds when hooks pass.

## Task 5: Entrypoint And File Watching

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Initialize file from template**

Run:

```powershell
orbital-init-from-template src/index.ts
```

Expected: `src/index.ts` is created from the TypeScript template.

- [ ] **Step 2: Write entrypoint implementation**

Replace `src/index.ts` with:

```ts
// abstract: Command-line entrypoint for watching Satisfactory saves and coordinating map uploads.
// out_of_scope: Save parsing, browser upload internals, and configurable save-directory management.

import { existsSync, watch } from "node:fs";
import { createDebouncedAsyncTask } from "./debounce.js";
import { findLatestSave, getDefaultSaveRoot } from "./saves.js";
import { MapUploader } from "./uploader.js";

const DEBOUNCE_MS = 2_000;

async function main(): Promise<void> {
  const saveRoot = getDefaultSaveRoot();

  if (!existsSync(saveRoot)) {
    throw new Error(`Satisfactory save directory does not exist: ${saveRoot}`);
  }

  const uploader = new MapUploader();

  async function uploadLatestSave(reason: string): Promise<void> {
    const latestSave = await findLatestSave(saveRoot);

    if (!latestSave) {
      console.log(`No .sav files found under ${saveRoot}; waiting for save changes.`);
      return;
    }

    console.log(`Uploading latest save after ${reason}: ${latestSave}`);
    try {
      await uploader.upload(latestSave);
    } catch (error) {
      console.error(`Upload failed after ${reason}.`);
      console.error(error);
    }
  }

  await uploadLatestSave("startup scan");

  const scheduleUpload = createDebouncedAsyncTask(
    () => uploadLatestSave("save change"),
    DEBOUNCE_MS,
  );

  const watcher = watch(saveRoot, { recursive: true }, (_eventType, filename) => {
    if (!filename || filename.toString().toLowerCase().endsWith(".sav")) {
      scheduleUpload();
    }
  });

  console.log(`Watching Satisfactory saves under ${saveRoot}`);

  let shuttingDown = false;
  async function shutdown(): Promise<void> {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    watcher.close();
    await uploader.close();
  }

  process.once("SIGINT", () => {
    shutdown()
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        process.exit(0);
      });
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
pnpm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Run build**

Run:

```powershell
pnpm run build
```

Expected: `dist/index.js`, `dist/saves.js`, `dist/debounce.js`, and `dist/uploader.js` are created.

- [ ] **Step 5: Commit entrypoint**

Run:

```powershell
git add src/index.ts
git commit -m "feat: watch satisfactory saves"
```

Expected: commit succeeds when hooks pass. Generated `dist/` files remain untracked because `.gitignore` excludes them.

## Task 6: Final Verification And Manual Browser Check

**Files:**
- Modify only if checks reveal a defect in files from earlier tasks.

- [ ] **Step 1: Run formatter and lint**

Run:

```powershell
pnpm run fix
pnpm run lint
```

Expected: both commands exit with code 0.

- [ ] **Step 2: Run typecheck and tests**

Run:

```powershell
pnpm run typecheck
pnpm run test
```

Expected: both commands exit with code 0.

- [ ] **Step 3: Run aggregate check**

Run:

```powershell
pnpm run check
```

Expected: lint, typecheck, and tests all pass.

- [ ] **Step 4: Install Playwright Chromium**

Run:

```powershell
pnpm exec playwright install chromium
```

Expected: Chromium browser installation completes or reports that the browser is already installed.

- [ ] **Step 5: Run the watcher manually**

Run:

```powershell
pnpm run dev
```

Expected: the script prints the watched save directory, opens one Chromium page at `https://satisfactory-calculator.com/zh/interactive-map`, and attempts to upload the newest `.sav` when one exists.

- [ ] **Step 6: Validate save-change behavior**

Create or overwrite a `.sav` file under `%LOCALAPPDATA%\FactoryGame\Saved\SaveGames`, or save from inside Satisfactory.

Expected: after about 2 seconds, the existing Chromium page receives another upload attempt for the newest `.sav`.

- [ ] **Step 7: Install hooks**

Run when `pre-commit` is available on `PATH`:

```powershell
pnpm run hooks:install
```

Expected: pre-commit and commit-msg hooks are installed.

- [ ] **Step 8: Commit final verification fixes**

Run only when Step 1 through Step 7 required file edits:

```powershell
git add .
git commit -m "chore: verify save map watcher"
```

Expected: commit succeeds when hooks pass.

## Coverage Gate

- R-001 is covered by Task 2 `getDefaultSaveRoot` and `findLatestSave`.
- R-002 is covered by Task 5 startup scan and Task 6 manual startup validation.
- R-003 is covered by Task 3 debounce and Task 5 recursive file watching.
- R-004 is covered by Task 4 Playwright upload and Task 6 manual browser validation.
- R-005 is covered by Task 4 `MapUploader` page reuse.
- R-006 is covered by Task 1 package scripts and README.
- R-007 is covered by Task 1 quality configuration, Task 2 and Task 3 tests, and Task 6 verification.
