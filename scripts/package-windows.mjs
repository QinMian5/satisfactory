#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getExpectedPackageDirectory, getForgePackageDirectory } from "./package-paths.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "out");

async function main() {
  const packageJson = await readPackageJson();
  await run("pnpm", ["exec", "electron-forge", "package", "--platform=win32", "--arch=x64"]);
  await normalizePackageDirectory(packageJson);
}

async function normalizePackageDirectory(packageJson) {
  const source = getForgePackageDirectory(packageJson, ROOT);
  const target = getExpectedPackageDirectory(packageJson, ROOT);
  assertInsideOut(source);
  assertInsideOut(target);

  await fs.rm(target, { recursive: true, force: true });
  await fs.rename(source, target);
  console.log(`Packaged app directory: ${target}`);
}

function assertInsideOut(candidate) {
  const relative = path.relative(OUT_DIR, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify package directory outside ${OUT_DIR}: ${candidate}`);
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawnCommand(command, args, {
      cwd: ROOT,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} failed with code ${code} signal ${signal ?? "none"}.`));
    });
  });
}

function spawnCommand(command, args, options) {
  if (process.platform !== "win32") {
    return spawn(command, args, options);
  }
  return spawn("cmd.exe", ["/d", "/s", "/c", commandLine(command, args)], options);
}

function commandLine(command, args) {
  return [command, ...args].map(quoteCommandArg).join(" ");
}

function quoteCommandArg(value) {
  if (/^[a-zA-Z0-9._/:=+-]+$/.test(value)) {
    return value;
  }
  return `"${value.replaceAll('"', '\\"')}"`;
}

async function readPackageJson() {
  return JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
