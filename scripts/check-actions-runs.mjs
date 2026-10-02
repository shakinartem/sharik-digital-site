// Сводка по последним запускам Actions: sha, статус и итог.
//
// Запуск: node scripts/check-actions-runs.mjs [сколько]
//
// Нужна, чтобы отличить «сломался мой коммит» от «workflow был сломан
// и до меня»: если соседние запуски тоже failed, дело в окружении
// (чаще всего — отсутствующие секреты), а не в изменениях.

import fs from "node:fs";

const limit = Number(process.argv[2] || 12);
const CACHE = process.env.ACTIONS_RUNS_CACHE;

async function runs() {
  if (CACHE && fs.existsSync(CACHE)) return JSON.parse(fs.readFileSync(CACHE, "utf8"));
  const response = await fetch(
    "https://api.github.com/repos/shakinartem/sharik-digital-site/actions/runs" +
      "?branch=feature/final-layout-funnel&per_page=" + limit,
    { headers: { "User-Agent": "sharik-cms" } },
  );
  const data = await response.json();
  if (CACHE) fs.writeFileSync(CACHE, JSON.stringify(data));
  return data;
}

const data = await runs();

for (const run of data.workflow_runs || []) {
  console.log(
    [
      run.head_sha.slice(0, 7),
      (run.status || "").padEnd(9),
      (run.conclusion || "-").padEnd(8),
      run.created_at,
      run.display_title.slice(0, 48),
    ].join("  "),
  );
}