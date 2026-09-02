#!/usr/bin/env node
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = mkdtempSync(join(tmpdir(), "arcana-squad-tests-"));

function collectTests(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectTests(path));
    else if (entry.isFile() && entry.name.endsWith(".test.mjs")) files.push(path);
  }
  return files;
}

const tests = collectTests(join(root, "scripts")).sort();
if (!tests.length) {
  console.error("No test files found under scripts/.");
  process.exit(1);
}

try {
  const result = spawnSync(process.execPath, ["--test", ...tests], {
    cwd: scratch,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
