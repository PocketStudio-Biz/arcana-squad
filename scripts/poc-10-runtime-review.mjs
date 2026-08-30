#!/usr/bin/env node
import { chromium } from "playwright";

const url = process.env.POC10_URL || "http://127.0.0.1:8080";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err?.message || err)));

try {
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  if (!response?.ok()) throw new Error(`App returned HTTP ${response?.status() ?? 0}`);

  await page.getByRole("button", { name: "Enter the temple" }).click();
  const walk = page.getByRole("button", { name: /^Walk as / }).first();
  await walk.waitFor({ state: "visible", timeout: 15000 });
  await walk.click();

  await page.waitForFunction(() => Boolean(window.__controlsTest), null, { timeout: 20000 });
  const before = await page.evaluate(() => ({
    room: window.__controlsTest?.getRoom(),
    score: window.__controlsTest?.getScore(),
    picking: window.__controlsTest?.isPicking(),
    over: window.__controlsTest?.isOver(),
  }));

  await page.evaluate(() => window.__controlsTest?.forceBoss?.());
  await page.evaluate(() => window.__controlsTest?.advance?.(0.25));

  let reachedPick = false;
  let ended = false;
  for (let i = 0; i < 120; i++) {
    const state = await page.evaluate(() => {
      window.__controlsTest?.autoMove?.();
      window.__controlsTest?.advance?.(1);
      return {
        room: window.__controlsTest?.getRoom(),
        score: window.__controlsTest?.getScore(),
        picking: window.__controlsTest?.isPicking(),
        over: window.__controlsTest?.isOver(),
        hp: window.__controlsTest?.getHp(),
        lives: window.__controlsTest?.getLives(),
      };
    });
    reachedPick = Boolean(state.picking);
    ended = Boolean(state.over);
    if (reachedPick || ended) break;
  }

  const after = await page.evaluate(() => ({
    room: window.__controlsTest?.getRoom(),
    score: window.__controlsTest?.getScore(),
    picking: window.__controlsTest?.isPicking(),
    over: window.__controlsTest?.isOver(),
    hp: window.__controlsTest?.getHp(),
    lives: window.__controlsTest?.getLives(),
  }));
  const blessingVisible = await page.getByText("ROOM CLEARED — CHOOSE A BLESSING").isVisible().catch(() => false);

  const report = {
    url,
    before,
    after,
    bossCombatReachedRewardPick: reachedPick && blessingVisible && !ended,
    blessingVisible,
    consoleErrors,
  };
  console.log(JSON.stringify(report, null, 2));

  if (!report.bossCombatReachedRewardPick || consoleErrors.length > 0) process.exitCode = 1;
} finally {
  await browser.close();
}
