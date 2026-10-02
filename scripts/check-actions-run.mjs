// Разбор ответа GitHub Actions: какие шаги джобы и с чем вывод.
//
// Запуск: node scripts/check-actions-run.mjs <run-id>
//
// Нужен, чтобы отличить «сборка упала» от «не хватило секрета»:
// в обоих случаях conclusion = failure, а чинить нужно разное.

import fs from "node:fs";

const runId = process.argv[2];
if (!runId) {
  console.error("Укажите id запуска: node scripts/check-actions-run.mjs <run-id>");
  process.exit(2);
}

const CACHE = process.env.ACTIONS_JOBS_CACHE;

async function jobs() {
  // Локальный кэш используется, чтобы не жечь лимит GitHub: ответ
  // сохраняется один раз и разбирается сколько угодно.
  if (CACHE && fs.existsSync(CACHE)) return JSON.parse(fs.readFileSync(CACHE, "utf8"));
  const response = await fetch(
    `https://api.github.com/repos/shakinartem/sharik-digital-site/actions/runs/${runId}/jobs`,
    { headers: { "User-Agent": "sharik-cms" } },
  );
  const data = await response.json();
  if (CACHE) fs.writeFileSync(CACHE, JSON.stringify(data));
  return data;
}

const data = await jobs();

for (const job of data.jobs || []) {
  console.log(`JOB: ${job.name} => ${job.conclusion}`);
  for (const step of job.steps || []) {
    console.log(`   ${step.number}. ${step.name} => ${step.conclusion}`);
  }
}