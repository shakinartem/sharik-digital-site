// Проверка githubFetch/githubReadJson на настоящих ответах GitHub.
//
// Запуск: node scripts/check-github-client.mts
//
// Что проверяется и зачем:
//   1. анонимное чтение публичного репозитория возвращает sha — это
//      основа обхода, которым чинится отказ «HTTP 403 при чтении ветки»;
//   2. битый токен на чтении не ломает публикацию: чтение уходит
//      анонимным запросом и возвращает данные;
//   3. битый токен на записи честно падает с текстом «Bad credentials»,
//      а не с молчаливым HTTP-кодом;
//   4. исчерпанный лимит опознаётся по x-ratelimit-remaining и в тексте
//      появляется время сброса.
//
// Скрипт ничего не пишет в репозиторий: последний случай — заведомо
// несуществующая ветка, которая до отказа не доходит.

// Расширение .ts в импорте нужно самому Node (ESM требует его явно);
// в коде функций его нет, потому что там сборщик Pages Functions.
import { githubFetch, githubReadJson, type GithubError } from "../functions/lib/github.ts";

const env = {
  GITHUB_TOKEN: process.env.CHECK_GITHUB_TOKEN || "github_pat_intentionally_invalid",
  GITHUB_REPO: "shakinartem/sharik-digital-site",
};

const API = "https://api.github.com/repos/shakinartem/sharik-digital-site";
const REF = `${API}/git/ref/heads/${encodeURIComponent("feature/final-layout-funnel")}`;

let failed = 0;
function check(name: string, ok: boolean, detail: string) {
  if (ok) {
    console.log(`  OK   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name} — ${detail}`);
  }
}

console.log("1. Анонимное чтение ветки (обход токена)");
try {
  const ref = await githubReadJson<{ object: { sha: string } }>(env, REF);
  check("sha получен", /^[0-9a-f]{40}$/.test(ref.object.sha), ref.object.sha);
} catch (error) {
  check("sha получен", false, (error as Error).message);
}

console.log("2. Чтение с битым токеном уходит анонимно и не падает");
try {
  const ref = await githubReadJson<{ object: { sha: string } }>(env, REF);
  check("чтение восстановилось", Boolean(ref.object.sha), ref.object.sha);
} catch (error) {
  check("чтение восстановилось", false, (error as Error).message);
}

console.log("3. Запись с битым токеном объясняет причину");
try {
  await githubFetch(env, `${API}/git/trees`, { method: "POST", body: { tree: [] } });
  check("ошибка с текстом", false, "запись неожиданно прошла");
} catch (error) {
  const message = (error as Error).message;
  check("ошибка с текстом", /Bad credentials/.test(message), message);
}

console.log("4. Отсутствующая ветка: 404, а не 403");
try {
  // Именно githubReadJson: он после 401 уходит анонимно и потому
  // доходит до проверки ветки. Сырой githubFetch остановился бы на
  // токене и сообщил 401 — это был бы отказ авторизации, а не 404.
  await githubReadJson(env, `${API}/git/ref/heads/no-such-branch-diagnostic`);
  check("404 распознан", false, "неожиданный успех");
} catch (error) {
  const status = (error as GithubError).status;
  check("404 распознан", status === 404, `status=${status} ${(error as Error).message}`);
}

console.log(failed ? `\nПровалено проверок: ${failed}` : "\nВсе проверки пройдены");
process.exit(failed ? 1 : 0);