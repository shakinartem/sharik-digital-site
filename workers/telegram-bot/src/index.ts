import { sendMessage, sendDocument, answerCallbackQuery, parseUpdate, type MessageReplyMarkup } from "./telegram";
import { getUserState, setUserState, type UserState } from "./state";
import {
  buildMainMenuText,
  buildChecklistText,
  buildAuditIntroText,
  buildQuestionIntroText,
  buildCasesMenuText,
  buildContactRequestText,
  buildContactSavedText,
  buildAuditFinishedText,
} from "./texts";
import { mainMenuKeyboard, checklistKeyboard, diagnosticResultKeyboard, contactRequestKeyboard, diagnosticKeyboard } from "./keyboards";
import { buildCaseText, CASE_LIBRARY, KIT_CASE_LIBRARY } from "./cases";
import { CLINIC, KIT, getTrack, questionsFor, resolveAction, resolveTrack, extractCaseId, isTrackKey, type TrackKey } from "./tracks";

type Env = {
  DB: D1Database;
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  WEBHOOK_SECRET: string;
  SITE_URL: string;
  CHECKLIST_URL: string;
  /** Чек-лист для продавцов. Не обязателен: без него бот объяснит, куда смотреть. */
  CHECKLIST_KIT_URL?: string;
  BOT_USERNAME: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ ok: true });
    }

    const webhookPath = `/webhook/${env.WEBHOOK_SECRET}`;
    if (url.pathname === webhookPath && request.method === "POST") {
      return handleWebhook(request, env);
    }

    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Направление, в котором сейчас находится человек.
 *
 * Берём из состояния диалога, а не из памяти воркера: инстанс может
 * пересоздаться между запросами, и человек посреди диагностики
 * продавца получил бы клиническое меню.
 */
function currentTrack(state: UserState | null): TrackKey {
  if (!state) return CLINIC;
  if (state.kind === "diagnostic" || state.kind === "question") return state.track;
  return CLINIC;
}

function casesFor(track: TrackKey) {
  return track === KIT ? KIT_CASE_LIBRARY : CASE_LIBRARY;
}

function checklistUrlFor(env: Env, track: TrackKey): string | null {
  if (track === KIT) return env.CHECKLIST_KIT_URL || null;
  return env.CHECKLIST_URL || null;
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (secret !== env.WEBHOOK_SECRET) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const update = await request.json().catch(() => ({}));
  const parsed = parseUpdate(update);
  if (!parsed.chatId || !parsed.userId) {
    return Response.json({ ok: true });
  }

  await ensureUser(env.DB, parsed.user, parsed.chatId);

  if (parsed.callbackQueryId) {
    await answerCallbackQuery(env.BOT_TOKEN, parsed.callbackQueryId);
  }

  const state = await getUserState(env.DB, parsed.userId);
  const track = currentTrack(state);

  if (parsed.command === "/start") {
    await handleStart(env, parsed, state, parsed.startParam);
    return Response.json({ ok: true });
  }
  if (parsed.command === "/menu") {
    await handleMenu(env, parsed, state);
    return Response.json({ ok: true });
  }
  if (parsed.command === "/cancel") {
    await handleCancel(env, parsed, state);
    return Response.json({ ok: true });
  }
  if (parsed.command === "/checklist") {
    await handleChecklist(env, parsed, track);
    return Response.json({ ok: true });
  }
  if (parsed.command === "/audit") {
    await handleAudit(env, parsed, null, track);
    return Response.json({ ok: true });
  }
  if (parsed.command === "/cases") {
    await handleCases(env, parsed, track);
    return Response.json({ ok: true });
  }
  if (parsed.command === "/question") {
    await handleQuestion(env, parsed, state, track);
    return Response.json({ ok: true });
  }

  if (parsed.callbackData || state?.kind === "contact_request" || parsed.contact) {
    await handleCallbackOrContact(env, parsed, state);
    return Response.json({ ok: true });
  }

  if (parsed.text) {
    if (state?.kind === "diagnostic") {
      await handleDiagnosticText(env, parsed, state);
      return Response.json({ ok: true });
    }
    if (state?.kind === "question") {
      await handleQuestionText(env, parsed, state);
      return Response.json({ ok: true });
    }
    await sendMessage(env.BOT_TOKEN, parsed.chatId, buildMainMenuText(track), mainMenuKeyboard(track));
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}
async function handleStart(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null, startParam: string | null) {
  const chatId = parsed.chatId as number;
  const user = parsed.user as any;
  await setUserState(env.DB, user.id, null);

  // Направление и действие вытаскиваем из метки ссылки. Короткие ссылки
  // без префикса остаются клиническими: они зашиты в тексты сайта и в
  // рекламные кампании.
  const track = resolveTrack(startParam);
  const action = resolveAction(startParam);

  if (action === "checklist") {
    await handleChecklist(env, parsed, track);
    return;
  }
  if (action === "audit" || action === "consultation") {
    await handleAudit(env, parsed, null, track);
    return;
  }
  if (action === "question") {
    await handleQuestion(env, parsed, null, track);
    return;
  }
  if (action === "cases") {
    await handleCases(env, parsed, track);
    return;
  }
  if (action === "case") {
    const caseId = extractCaseId(startParam);
    if (caseId && caseId in casesFor(track)) {
      await sendMessage(env.BOT_TOKEN, chatId, buildCaseText(caseId), mainMenuKeyboard(track));
      return;
    }
    // Кейс чужого направления показывать нельзя: отдаём список своего.
    await handleCases(env, parsed, track);
    return;
  }

  await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(track), mainMenuKeyboard(track));
}

async function handleMenu(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null) {
  const track = currentTrack(state);
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, parsed.chatId as number, buildMainMenuText(track), mainMenuKeyboard(track));
}

async function handleCancel(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null) {
  const track = currentTrack(state);
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, parsed.chatId as number, "Действие отменено. Возвращаю в меню.", mainMenuKeyboard(track));
}

async function handleChecklist(env: Env, parsed: ReturnType<typeof parseUpdate>, track: TrackKey) {
  const chatId = parsed.chatId as number;
  await sendMessage(env.BOT_TOKEN, chatId, buildChecklistText(track));

  const url = checklistUrlFor(env, track);
  if (url) {
    await sendDocument(env.BOT_TOKEN, chatId, url, undefined, checklistKeyboard(track));
    return;
  }
  // Отсутствие файла не повод молчать: человек пришёл за материалом.
  if (track === KIT) {
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      [
        "PDF-чек-лист продавца пока не подключён: не задан CHECKLIST_KIT_URL.",
        "",
        "Пока материалы доступны на сайте:",
        "https://sharik-digital.ru/blog/nastrojka-yandex-kit",
        "https://sharik-digital.ru/blog/kak-podklyuchit-oplatu-v-yandex-kit",
        "https://sharik-digital.ru/blog/kak-podklyuchit-dostavku-v-yandex-kit",
      ].join("\n"),
      checklistKeyboard(track),
    );
    return;
  }
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    "PDF-чек-лист пока не подключён: не задан CHECKLIST_URL.",
    checklistKeyboard(track),
  );
}

async function handleAudit(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null, track: TrackKey) {
  const chatId = parsed.chatId as number;
  const questions = questionsFor(track);

  if (!state || state.kind !== "diagnostic") {
    await setUserState(env.DB, parsed.userId, {
      kind: "diagnostic",
      step: 0,
      answers: {},
      source_route: track,
      track,
    });
    await sendMessage(env.BOT_TOKEN, chatId, buildAuditIntroText(track));
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      `Шаг 1 из ${questions.length}\n\n${questions[0].prompt}`,
      diagnosticKeyboard(0, questions[0].options, track),
    );
    return;
  }

  const step = state.step;
  if (step >= questions.length) {
    await finishDiagnostic(env, parsed, state);
    return;
  }

  await setUserState(env.DB, parsed.userId, { ...state, step: step + 1 });
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    `Шаг ${step + 2} из ${questions.length}\n\n${questions[step + 1].prompt}`,
    diagnosticKeyboard(step + 1, questions[step + 1].options, state.track),
  );
}

async function handleCases(env: Env, parsed: ReturnType<typeof parseUpdate>, track: TrackKey) {
  const chatId = parsed.chatId as number;
  const library = casesFor(track);
  const buttons: { text: string; callback_data: string }[][] = [];

  for (const caseId of Object.keys(library)) {
    buttons.push([{ text: library[caseId].title, callback_data: `case:${caseId}:${track}` }]);
  }
  buttons.push([{ text: "Мини-диагностика", callback_data: track === KIT ? "audit:kit" : "audit" }]);

  await sendMessage(env.BOT_TOKEN, chatId, buildCasesMenuText(), { inline_keyboard: buttons });
}

async function handleQuestion(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null, track: TrackKey) {
  const chatId = parsed.chatId as number;
  await setUserState(env.DB, parsed.userId, { kind: "question", question_kind: "free_text", track });
  await sendMessage(env.BOT_TOKEN, chatId, buildQuestionIntroText(), contactRequestKeyboard());
}
/**
 * Разбор callback_data вида "действие:трек".
 *
 * Хвост с треком необязателен: кнопки, отправленные до перехода на два
 * направления, приходят без него и остаются клиническими.
 */
function parseCallback(data: string): { action: string; track: TrackKey; caseId?: string } {
  const parts = data.split(":");
  if (parts[0] === "case") {
    return { action: "case", caseId: parts[1], track: isTrackKey(parts[2]) ? parts[2] : CLINIC };
  }
  if (parts[0] === "diag") {
    return { action: "diag", track: isTrackKey(parts[3]) ? parts[3] : CLINIC };
  }
  return { action: parts[0], track: isTrackKey(parts[1]) ? parts[1] : CLINIC };
}

async function handleCallbackOrContact(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null) {
  const chatId = parsed.chatId as number;
  const text = parsed.text;
  const contact = parsed.contact;
  const callbackData = parsed.callbackData;
  const userId = parsed.userId;
  const track = currentTrack(state);

  if (callbackData) {
    const cb = parseCallback(callbackData);

    if (cb.action === "diag") {
      await handleDiagnosticCallback(env, parsed, state, callbackData);
      return;
    }
    if (cb.action === "menu") return handleMenu(env, parsed, state);
    if (cb.action === "checklist") return handleChecklist(env, parsed, cb.track);
    if (cb.action === "audit" || cb.action === "consultation") {
      return handleAudit(env, parsed, null, cb.track);
    }
    if (cb.action === "cases") return handleCases(env, parsed, cb.track);
    if (cb.action === "question") return handleQuestion(env, parsed, state, cb.track);
    if (cb.action === "contact_request") {
      await setUserState(env.DB, parsed.userId, { kind: "contact_request" });
      await sendMessage(env.BOT_TOKEN, chatId, buildContactRequestText(), contactRequestKeyboard());
      return;
    }
    if (cb.action === "telegram_contact_allowed") {
      await saveContact(env.DB, userId, "Telegram");
      await sendMessage(env.BOT_TOKEN, chatId, buildContactSavedText());
      await sendAdminContactAfterDiagnostic(env, userId, "Telegram", true, null, track);
      await setUserState(env.DB, userId, null);
      await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(track), mainMenuKeyboard(track));
      return;
    }
    if (cb.action === "case") {
      const caseId = cb.caseId;
      if (caseId && caseId in casesFor(cb.track)) {
        await sendMessage(env.BOT_TOKEN, chatId, buildCaseText(caseId), mainMenuKeyboard(cb.track));
        return;
      }
      await handleCases(env, parsed, cb.track);
      return;
    }
  }

  if (!state) {
    if (text && ["в меню", "/menu", "/cancel"].includes(text.toLowerCase())) {
      return handleMenu(env, parsed, state);
    }
    await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(track), mainMenuKeyboard(track));
    return;
  }

  if (state.kind === "contact_request") {
    const allowed = resolveTelegramContactAllowed(text, contact);
    const contactText = resolveContactText(text, contact);

    if (!contactText) {
      await sendMessage(env.BOT_TOKEN, chatId, buildContactRequestText(), contactRequestKeyboard());
      return;
    }
    if (contact && contact.user_id && contact.user_id !== userId) {
      await sendMessage(env.BOT_TOKEN, chatId, "Пожалуйста, отправьте свой собственный контакт.", contactRequestKeyboard());
      return;
    }

    await saveContact(env.DB, userId, contactText);
    await sendMessage(env.BOT_TOKEN, chatId, buildContactSavedText());
    await sendAdminContactAfterDiagnostic(env, userId, contactText, allowed, null, track);
    await setUserState(env.DB, userId, null);
    await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(track), mainMenuKeyboard(track));
    return;
  }

  if (state.kind === "question") {
    if (!text) {
      await sendMessage(env.BOT_TOKEN, chatId, buildQuestionIntroText(), contactRequestKeyboard());
      return;
    }
    if (["в меню", "/menu", "/cancel"].includes(text.toLowerCase())) {
      return handleMenu(env, parsed, state);
    }
    await saveQuestionLead(env, parsed.user as any, text, state.track);
    await setUserState(env.DB, userId, null);
    await sendMessage(env.BOT_TOKEN, chatId, "Спасибо. Сообщение сохранил и передал команде.", mainMenuKeyboard(state.track));
    return;
  }

  await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(track), mainMenuKeyboard(track));
}
/**
 * Ответ на кнопку шага диагностики.
 *
 * Этой функции в проекте не было: обработчик кнопки ссылался на неё,
 * но она нигде не была объявлена. Любое нажатие на вариант ответа в
 * воркере приводило к ReferenceError, и сценарий диагностики не мог
 * пройти целиком.
 */
async function handleDiagnosticCallback(
  env: Env,
  parsed: ReturnType<typeof parseUpdate>,
  state: UserState | null,
  callbackData: string,
) {
  const chatId = parsed.chatId as number;
  const parts = callbackData.split(":");
  const step = Number(parts[1]);
  const optionIndex = Number(parts[2]);
  const track: TrackKey = isTrackKey(parts[3]) ? parts[3] : currentTrack(state);

  if (!state || state.kind !== "diagnostic") {
    // Состояние потерялось (перезапуск, истёкший диалог): начинаем заново.
    await handleAudit(env, parsed, null, track);
    return;
  }

  const questions = questionsFor(state.track);
  const question = questions[step];

  if (state.step !== step || !question || optionIndex < 0 || optionIndex >= question.options.length) {
    // Нажата кнопка от предыдущего шага: молча возвращаем текущий вопрос,
    // но не засчитываем ответ дважды.
    const current = questions[state.step];
    if (current) {
      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        current.prompt,
        diagnosticKeyboard(current.step, current.options, state.track),
      );
    }
    return;
  }

  const answers = { ...state.answers, [question.key]: question.options[optionIndex] };
  const nextStep = step + 1;

  if (nextStep >= questions.length) {
    await setUserState(env.DB, parsed.userId, null);
    await saveDiagnosticLead(env, parsed.user as any, { ...state, answers });
    await sendMessage(env.BOT_TOKEN, chatId, buildAuditFinishedText(), diagnosticResultKeyboard(state.track));
    return;
  }

  await setUserState(env.DB, parsed.userId, { ...state, step: nextStep, answers });
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    `Шаг ${nextStep + 1} из ${questions.length}\n\n${questions[nextStep].prompt}`,
    diagnosticKeyboard(nextStep, questions[nextStep].options, state.track),
  );
}

async function handleDiagnosticText(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState) {
  const chatId = parsed.chatId as number;
  if (state.kind !== "diagnostic") return;

  const text = parsed.text as string;
  const questions = questionsFor(state.track);
  const question = questions[state.step];
  if (!question) return;

  const optionIndex = question.options.indexOf(text);
  if (optionIndex === -1) {
    await sendMessage(env.BOT_TOKEN, chatId, question.prompt, diagnosticKeyboard(question.step, question.options, state.track));
    return;
  }

  const answers = { ...state.answers, [question.key]: question.options[optionIndex] };
  const nextStep = question.step + 1;

  if (nextStep >= questions.length) {
    await setUserState(env.DB, parsed.userId, null);
    await saveDiagnosticLead(env, parsed.user as any, { ...state, answers });
    await sendMessage(env.BOT_TOKEN, chatId, buildAuditFinishedText(), diagnosticResultKeyboard(state.track));
    return;
  }

  await setUserState(env.DB, parsed.userId, { ...state, step: nextStep, answers });
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    `Шаг ${nextStep + 1} из ${questions.length}\n\n${questions[nextStep].prompt}`,
    diagnosticKeyboard(nextStep, questions[nextStep].options, state.track),
  );
}

async function handleQuestionText(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState) {
  const chatId = parsed.chatId as number;
  const text = parsed.text as string;

  if (["в меню", "/menu", "/cancel"].includes(text.toLowerCase())) {
    return handleMenu(env, parsed, state);
  }

  const track = state.kind === "question" ? state.track : CLINIC;
  await saveQuestionLead(env, parsed.user as any, text, track);
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, chatId, "Спасибо. Сообщение сохранил и передал команде.", mainMenuKeyboard(track));
}

function resolveTelegramContactAllowed(text: string | null, contact: any): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes("пишите сюда") || t.includes("пишите в telegram");
}

function resolveContactText(text: string | null, contact: any): string | null {
  if (contact && contact.phone_number) return contact.phone_number;
  if (!text) return null;
  const t = text.trim();
  return t || null;
}
async function ensureUser(db: D1Database, user: any, chatId: number) {
  if (!user) return;
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO users (telegram_id, username, first_name, last_name, language_code, start_param, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(telegram_id) DO UPDATE SET username = excluded.username, first_name = excluded.first_name, last_name = excluded.last_name, last_seen_at = excluded.last_seen_at`,
  )
    .bind(user.id, user.username || null, user.first_name || null, user.last_name || null, user.language_code || null, null, now, now)
    .run();
}

async function saveContact(db: D1Database, telegramId: number, contact: string | null) {
  const now = new Date().toISOString();
  await db.prepare("UPDATE users SET contact = ?, last_seen_at = ? WHERE telegram_id = ?").bind(contact, now, telegramId).run();
}

async function saveLead(db: D1Database, telegramId: number, kind: string, payload: Record<string, unknown>) {
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO leads (telegram_id, kind, payload_json, created_at) VALUES (?, ?, ?, ?)")
    .bind(telegramId, kind, JSON.stringify(payload), now)
    .run();
}

async function saveDiagnosticLead(env: Env, user: any, state: Extract<UserState, { kind: "diagnostic" }>) {
  if (!user) return;
  const answers = { ...state.answers };
  const track = getTrack(state.track);
  const payload = {
    track: track.key,
    clinic_name: answers.clinic_name || null,
    city: answers.city || null,
    role: null,
    clinic_type: answers.clinic_type || null,
    existing_tools: answers.existing_tools || null,
    main_problem: answers.main_problem || null,
    lead_channels: answers.lead_channels || null,
    response_speed: answers.response_speed || null,
    priority: answers.priority || null,
    audit_focus: answers.priority || null,
    telegram_contact_allowed: false,
    comment: null,
    start_param: track.key,
  };

  await saveLead(env.DB, user.id, "diagnostic", payload as any);
  await sendAdminLead(env, user, payload as any, "diagnostic", track.key);
}

async function saveQuestionLead(env: Env, user: any, text: string, track: TrackKey = CLINIC) {
  if (!user) return;
  const payload = { track, question: text, telegram_contact_allowed: false };
  await saveLead(env.DB, user.id, "question", payload);
  await sendAdminLead(env, user, payload, "question", track);
}

async function finishDiagnostic(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState) {
  const user = parsed.user as any;
  if (!user) return;
  const stateDiagnostic = state as Extract<UserState, { kind: "diagnostic" }>;
  await saveDiagnosticLead(env, user, stateDiagnostic);
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, parsed.chatId as number, buildAuditFinishedText(), diagnosticResultKeyboard(stateDiagnostic.track));
}

async function sendAdminContactAfterDiagnostic(
  env: Env,
  userId: number,
  contact: string,
  telegramContactAllowed: boolean,
  diagnosticPayload: any,
  track: TrackKey = CLINIC,
) {
  const user = await env.DB
    .prepare("SELECT telegram_id, username, first_name, last_name FROM users WHERE telegram_id = ?")
    .bind(userId)
    .first<any>();
  if (!user) return;

  const cfg = getTrack(track);
  const lines = [
    "Контакт после диагностики",
    "",
    `Направление: ${cfg.title}`,
    `Telegram ID: ${user.telegram_id}`,
    `Username: ${user.username ? "@" + user.username : "—"}`,
    `Имя: ${[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}`,
  ];

  if (diagnosticPayload) {
    lines.push("", "Последняя диагностика:");
    for (const key of ["clinic_type", "existing_tools", "main_problem", "lead_channels", "response_speed", "priority"]) {
      lines.push(`- ${cfg.label(key)}: ${diagnosticPayload[key] || "—"}`);
    }
  }

  lines.push(
    "",
    `Контакт: ${contact || "—"}`,
    `Можно писать в Telegram: ${telegramContactAllowed ? "Да" : "Нет"}`,
    "Источник: contact_after_diagnostic",
    `Дата: ${new Date().toISOString()}`,
  );

  await sendAdminMessage(env, lines.join("\n"));
}

async function sendAdminMessage(env: Env, text: string) {
  if (!env.ADMIN_CHAT_ID) {
    console.warn("ADMIN_CHAT_ID is missing; lead was not forwarded.");
    return;
  }
  await sendMessage(env.BOT_TOKEN, env.ADMIN_CHAT_ID, text);
}

/**
 * Текст заявки для админского чата.
 *
 * Раньше env здесь не передавался, хотя в коде читался env.BOT_USERNAME.
 * Это ReferenceError на каждой заявке — бот не мог отправить ни одной.
 * Теперь окружение приходит первым параметром, а подписи полей — по
 * треку, чтобы селлеру не прилетало «Тип клиники».
 */
function formatLeadText(env: Env, user: any, payload: any, kind: string, track: TrackKey = CLINIC): string {
  const cfg = getTrack(track);
  const value = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));

  const lines = [
    "Новая заявка с сайта / Telegram-бота",
    "",
    `Направление: ${cfg.title}`,
    `Telegram ID: ${user.id}`,
    `Username: ${user.username ? "@" + user.username : "—"}`,
    `Имя: ${[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}`,
  ];

  if (track === CLINIC) {
    lines.push(`Клиника: ${value(payload.clinic_name)}`);
    lines.push(`Город: ${value(payload.city)}`);
    lines.push(`Роль: ${value(payload.role)}`);
  }

  lines.push(
    `${cfg.label("clinic_type")}: ${value(payload.clinic_type)}`,
    `${cfg.label("existing_tools")}: ${value(payload.existing_tools)}`,
    `${cfg.label("main_problem")}: ${value(payload.main_problem)}`,
    `${cfg.label("lead_channels")}: ${value(payload.lead_channels)}`,
    `${cfg.label("response_speed")}: ${value(payload.response_speed)}`,
    `${cfg.label("priority")}: ${value(payload.priority)}`,
    `Что хочет разобрать: ${value(payload.audit_focus ?? payload.question)}`,
    `Можно написать в Telegram: ${payload.telegram_contact_allowed ? "Да" : "Нет"}`,
    `Контакт: ${value(payload.contact_phone)}`,
    `Комментарий: ${value(payload.comment ?? payload.question)}`,
    `Источник: @${env.BOT_USERNAME} (${kind})`,
  );

  if (payload.start_param) lines.push(`Start param: ${payload.start_param}`);
  return lines.join("\n");
}
