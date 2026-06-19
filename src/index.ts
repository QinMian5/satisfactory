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
