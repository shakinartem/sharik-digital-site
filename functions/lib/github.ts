/**
 * Общий клиент GitHub REST API для админки.
 *
 * Зачем он здесь: publish и upload оба ходят в api.github.com и оба
 * сообщали об отказе одинаково — «GitHub отклонил: <начало тела>».
 * В теле ответа GitHub, однако, уже сказано, что именно не так:
 * «Bad credentials», «Resource not accessible by personal access token»,
 * «API rate limit exceeded». Это три разные поломки с разным лечением,
 * и по обрезанному тексту их не различить. Сообщение в publish.ts при
 * этом не показывало причину вовсе, а угадывало её — и угадывало неверно:
 * HTTP 403 у GitHub означает не только «нет прав», но и «исчерпан лимит»,
 * из-за чего подсказка «проверьте токен» уводила не туда.
 *
 * Модуль читает поле message сам и добавляет то, чего в теле нет:
 * состояние лимита и время его сброса. Исходящие адреса Cloudflare
 * общие, поэтому исчерпанный лимит — обычное дело, а не авария, и по
 * нему видно, что повторять попытку до сброса бесполезно.
 */

export interface GithubEnv {
  GITHUB_TOKEN?: string;
}

/**
 * Отказ GitHub вместе с кодом ответа.
 *
 * Код нужен вызывающему коду, чтобы выбрать поведение: чтение
 * публичного репозитория умеет обойтись без токена (см. githubReadJson),
 * а запись — нет.
 */
export interface GithubError extends Error {
  status: number;
}

/** Тело ответа при ошибке — в нём GitHub объясняет причину. */
interface GithubErrorBody {
  message?: string;
}

export interface GithubRequest {
  method?: string;
  /** Объект тела запроса; сериализуется здесь. */
  body?: unknown;
  /**
   * `null` — запрос намеренно без токена (анонимное чтение).
   * Не задан — берётся GITHUB_TOKEN из окружения.
   */
  token?: string | null;
}

/**
 * Заголовки запроса.
 *
 * User-Agent обязателен: без него GitHub отвечает 403, и такой ответ
 * неотличим от отказа по правам — поэтому подставляется всегда, а не
 * только когда передан токен. Версия API фиксируется явно, иначе смена
 * поведения на стороне GitHub придёт молча.
 */
function headers(token: string | undefined, hasBody: boolean): Record<string, string> {
  const out: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "sharik-digital-cms",
  };
  if (token) out.Authorization = `Bearer ${token}`;
  if (hasBody) out["Content-Type"] = "application/json; charset=utf-8";
  return out;
}

/** Отказ с кодом ответа. */
function fail(status: number, message: string): GithubError {
  const error = new Error(message) as GithubError;
  error.status = status;
  return error;
}

/** Время сброса лимита в формате ru-RU по Москве: его читают без перевода. */
function clockAt(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}
/**
 * Текст отказа: причина из тела ответа плюс подсказка по коду.
 *
 * Причину из body не подменяем собственной догадкой: GitHub различает
 * недействительный токен, недостаток прав и исчерпанный лимит, и лечится
 * это по-разному — обновлением токена, расширением прав или ожиданием.
 */
async function describe(response: Response): Promise<GithubError> {
  const raw = await response.text().catch(() => "");
  let reason = "";
  try {
    reason = String((JSON.parse(raw) as GithubErrorBody).message || "").trim();
  } catch {
    // Тело оказалось не JSON (прокси, WAF): причины не будет, останется код.
  }

  const limited = response.headers.get("x-ratelimit-remaining") === "0";
  const reset = Number(response.headers.get("x-ratelimit-reset") || 0);

  let hint: string;
  if (limited) {
    hint =
      "исчерпан лимит запросов к GitHub" +
      (reset ? `, сброс в ${clockAt(reset)} МСК` : "") +
      ". Без токена лимит считается на адрес (60 в час), а адреса Cloudflare " +
      "общие — повторять попытку сейчас бесполезно, нужен рабочий токен.";
  } else if (response.status === 401) {
    hint =
      "токен недействителен: истёк срок, его отозвали или при копировании " +
      "остались лишние символы.";
  } else if (response.status === 403) {
    hint =
      "у токена нет прав на это действие. Fine-grained: выбрать этот " +
      "репозиторий и дать Contents: Read and write; classic: scope public_repo.";
  } else if (response.status === 404) {
    hint =
      "репозиторий или ветка не найдены. Для закрытого репозитория GitHub " +
      "отвечает 404, скрывая сам факт закрытости.";
  } else {
    hint = "причина в ответе не распознана.";
  }

  return fail(
    response.status,
    `GitHub: HTTP ${response.status}` + (reason ? ` — ${reason}` : "") + `. ${hint}`,
  );
}

/** Запрос к GitHub с разбором отказа. Бросает GithubError с кодом. */
export async function githubFetch(
  env: GithubEnv,
  url: string,
  request: GithubRequest = {},
): Promise<Response> {
  const token = request.token === undefined ? env.GITHUB_TOKEN : request.token;

  const response = await fetch(url, {
    method: request.method || "GET",
    headers: headers(token || undefined, request.body !== undefined),
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
  }).catch(() => null);

  if (!response) throw fail(0, "Нет связи с GitHub — проверьте сетевой доступ Pages");
  if (response.ok) return response;
  throw await describe(response);
}

/** Ответ сразу разобран в объект. */
async function githubJson<T>(
  env: GithubEnv,
  url: string,
  request?: GithubRequest,
): Promise<T> {
  const response = await githubFetch(env, url, request);
  return (await response.json()) as T;
}

/**
 * Чтение с GitHub: сначала с токеном, при 401/403 — анонимно.
 *
 * Зачем анонимный обход: репозиторий публичный, поэтому прочитать его
 * HEAD и дерево можно вообще без токена. Сначала пробуем с токеном —
 * так битый токен виден сразу и по делу; если бы мы сразу читали
 * анонимно, поломка обнаружилась бы позже, на записи, и выглядела бы
 * как «ничего не понятно». Запись обойти нечем: она всегда с токеном.
 */
export async function githubReadJson<T>(env: GithubEnv, url: string): Promise<T> {
  try {
    return await githubJson<T>(env, url);
  } catch (error) {
    const status = (error as GithubError).status;
    if (status !== 401 && status !== 403) throw error;
    return await githubJson<T>(env, url, { token: null });
  }
}