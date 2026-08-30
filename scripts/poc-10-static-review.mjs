#!/usr/bin/env node
import { readFileSync } from "node:fs";

const types = readFileSync("src/game/types.ts", "utf8");
const engine = readFileSync("src/game/engine.ts", "utf8");
const app = readFileSync("src/game/GameApp.tsx", "utf8");

const pushHudStart = engine.indexOf("private pushHud()");
const pushHudEnd = engine.indexOf("private bindControlsTest()", pushHudStart);
const pushHud = pushHudStart >= 0 && pushHudEnd > pushHudStart ? engine.slice(pushHudStart, pushHudEnd) : "";

const victoryStart = engine.indexOf("private victory()");
const victoryEnd = engine.indexOf("private ascendSquad()", victoryStart);
const victory = victoryStart >= 0 && victoryEnd > victoryStart ? engine.slice(victoryStart, victoryEnd) : "";

const report = {
  xp: {
    declaredInHudType: ["level", "xp", "xpNeed"].every((field) => new RegExp(`\\b${field}\\s*:`).test(types)),
    populatedByEngine: ["level", "xp", "xpNeed"].every((field) => new RegExp(`\\b${field}\\s*:`).test(pushHud)),
    renderedByUi: ["hud.level", "hud.xp", "hud.xpNeed"].every((field) => app.includes(field)),
    hasExplicitXpMutation: /\b(?:this\.)?xp\s*(?:\+\+|\+=|=)/.test(engine),
  },
  bossLoop: {
    quotaTriggersBossDelay: engine.includes("this.kills >= this.quota") && engine.includes("this.bossDelay = 1.1"),
    bossSpawns: engine.includes('this.spawnEnemy("boss")') && engine.includes("this.bossSpawned = true"),
    bossAiRuns: engine.includes("runBoss(e as BossState"),
    bossClearOpensPick: engine.includes("this.roomClear()") && engine.includes("this.hooks.onPick(choices)"),
  },
  victory: {
    emitsWon: victory.includes("won: true"),
    uiOffersRunAgain: app.includes("Run again"),
    uiOffersApply: /\bApply\b/i.test(app),
    uiOffersRevert: /\bRevert\b/i.test(app),
  },
};

report.reviewGate = {
  bossSourceComplete: Object.values(report.bossLoop).every(Boolean),
  xpComplete: Object.values(report.xp).every(Boolean),
  postVictoryApplyRevertComplete: report.victory.emitsWon && report.victory.uiOffersApply && report.victory.uiOffersRevert,
};

console.log(JSON.stringify(report, null, 2));

if (!Object.values(report.reviewGate).every(Boolean)) process.exitCode = 1;
