"use client";

import { useState } from "react";

/**
 * Проверка окружения из админки.
 *
 * Зачем она: /api/health закрыт паролем, а браузер не умеет слать
 * `Authorization: Bearer` при обычном открытии ссылки. Поэтому «открыть
 * /api/health в браузере» невозможно в принципе — там всегда будет
 * «Требуется авторизация». Здесь пароль уже есть в sessionStorage,
 * и проверка сводится к нажатию кнопки.
 *
 * Показывает ровно то, о чём нельзя догадаться по флагу «секрет задан»:
 * принимает ли GitHub этот токен и есть ли у него права. Именно от
 * этого зависела публикация — отказ «HTTP 403» мог означать и отозванный
 * токен, и недостаток прав, и исчерпанный лимит запросов.
 */

type GithubCheck =
  | { checked: false; reason: string }
  | {
      checked: true;
      ok: boolean;
      status?: number;
      reason?: string;
      scopes?: string[] | string;
      rateLimitRemaining?: number | null;
    };

type Health = {
  bindings?: Record<string, boolean>;
  secrets?: Record<string, boolean>;
  vars?: Record<string, string | null>;
  github?: GithubCheck;
  error?: string;
};

export default function EnvCheck({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/health", {
        headers: { Authorization: "Bearer " + token },
      });
      const body = (await response.json().catch(() => null)) as Health | null;
      if (!response.ok) throw new Error(body?.error || "Ответ без описания (HTTP " + response.status + ")");
      setData(body);
    } catch (e) {
      setError((e as Error).message);
      setData(null);
    } finally {
      setBusy(false);
    }
  }

  const github = data?.github;

  // Отдельная строка про токен важнее прочих: остальные секреты на
  // публикацию не влияют, а нерабочий GITHUB_TOKEN — единственная
  // причина, ради которой сюда и приходят.
  const githubLine = !github
    ? "раздел недоступен — функция на сервере старше этой страницы"
    : !github.checked
      ? github.reason
      : github.ok
        ? "токен принят GitHub" +
          (github.rateLimitRemaining != null ? `, осталось запросов: ${github.rateLimitRemaining}` : "")
        : `токен не работает: ${github.reason || "причина неизвестна"}`;

  const chip = "rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium";

  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className={chip} type="button">
        {open ? "Скрыть проверку окружения" : "Проверить окружение"}
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-neutral-200 p-4 text-sm">
          <button onClick={run} disabled={busy} className={chip} type="button">
            {busy ? "Проверяем…" : "Обновить"}
          </button>

          {error && (
            <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-900">
              {error}
            </p>
          )}

          {data && (
            <div className="mt-3 space-y-2">
              <p
                className={
                  "rounded-lg border px-3 py-2 " +
                  (github && github.checked && github.ok
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-amber-300 bg-amber-50 text-amber-900")
                }
              >
                GitHub: {githubLine}
              </p>

              <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {Object.entries(data.bindings || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-neutral-100 py-1">
                    <dt className="text-neutral-600">{key}</dt>
                    <dd className={value ? "text-emerald-700" : "text-amber-700"}>
                      {value ? "настроено" : "нет"}
                    </dd>
                  </div>
                ))}
                {Object.entries(data.secrets || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-neutral-100 py-1">
                    <dt className="text-neutral-600">{key}</dt>
                    <dd className={value ? "text-emerald-700" : "text-amber-700"}>
                      {value ? "задан" : "не задан"}
                    </dd>
                  </div>
                ))}
                {Object.entries(data.vars || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-neutral-100 py-1">
                    <dt className="text-neutral-600">{key}</dt>
                    <dd className="truncate font-mono text-xs">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {!data && !error && (
            <p className="mt-3 text-neutral-500">Нажмите «Обновить», чтобы проверить.</p>
          )}
        </div>
      )}
    </div>
  );
}