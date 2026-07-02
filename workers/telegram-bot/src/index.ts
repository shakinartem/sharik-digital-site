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
import { buildCaseText, CASE_LIBRARY } from "./cases";

type Env = {
  DB: D1Database;
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  WEBHOOK_SECRET: string;
  SITE_URL: string;
  CHECKLIST_URL: string;
  BOT_USERNAME: string;
};

type DiagnosticQuestion = {
  key: string;
  prompt: string;
  options: readonly string[];
  step: number;
};

const QUESTIONS: DiagnosticQuestion[] = [
  {
    key: "clinic_type",
    prompt: "Какая у вас клиника?",
    options: ["Стоматология", "Медицинский центр", "Косметология", "Подология", "Другое"],
    step: 0,
  },
  {
    key: "existing_tools",
    prompt: "Что уже используется?",
    options: [
      "Сайт",
      "Соцсети",
      "Карты",
      "Реклама",
      "CRM",
      "Telegram / WhatsApp-заявки",
      "Бот",
      "Пока ничего системного",
    ],
    step: 1,
  },
  {
    key: "main_problem",
    prompt: "Что сейчас беспокоит больше всего?",
    options: [
      "Мало заявок",
      "Карты плохо работают",
      "Сайт не приводит пациентов",
      "Соцсети не дают обращений",
      "Заявки теряются",
      "Нет CRM / автоматизации",
      "Не понимаю, что работает",
      "Нужно всё под ключ",
    ],
    step: 2,
  },
  {
    key: "lead_channels",
    prompt: "Куда сейчас попадают заявки?",
    options: ["Телефон", "WhatsApp", "Telegram", "CRM", "Форма на сайте", "В разные места", "Не отслеживаем системно"],
    step: 3,
  },
  {
    key: "response_speed",
    prompt: "Как быстро обычно отвечают пациенту?",
    options: ["До 5 минут", "5-30 минут", "В течение часа", "Несколько часов", "На следующий день", "Не знаю"],
    step: 4,
  },
  {
    key: "priority",
    prompt: "Что хотите улучшить в первую очередь?",
    options: [
      "Больше пациентов",
      "Усилить карты",
      "Упаковать соцсети",
      "Сделать сайт / лендинг",
      "Настроить заявки в Telegram",
      "Подключить CRM",
      "Автоматизировать обработку",
      "Получить понятный план",
    ],
    step: 5,
  },
];

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
    await handleChecklist(env, parsed);
    return Response.json({ ok: true });
  }

  if (parsed.command === "/audit") {
    await handleAudit(env, parsed, state);
    return Response.json({ ok: true });
  }

  if (parsed.command === "/cases") {
    await handleCases(env, parsed);
    return Response.json({ ok: true });
  }

  if (parsed.command === "/question") {
    await handleQuestion(env, parsed, state);
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

    await sendMessage(env.BOT_TOKEN, parsed.chatId, buildMainMenuText(), mainMenuKeyboard());
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}

async function handleStart(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null, startParam: string | null) {
  const chatId = parsed.chatId as number;
  const user = parsed.user as any;
  await setUserState(env.DB, user.id, null);

  const route = resolveRoute(startParam);
  if (route === "checklist") {
    await handleChecklist(env, parsed);
    return;
  }
  if (route === "audit" || route === "consultation") {
    await handleAudit(env, parsed, null, route);
    return;
  }
  if (route === "question") {
    await handleQuestion(env, parsed, null);
    return;
  }
  if (route === "cases") {
    await handleCases(env, parsed);
    return;
  }
  if (route === "case") {
    const caseId = extractCaseId(startParam);
    await sendMessage(env.BOT_TOKEN, chatId, buildCaseText(caseId), mainMenuKeyboard());
    return;
  }

  await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(), mainMenuKeyboard());
}

async function handleMenu(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null) {
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, parsed.chatId as number, buildMainMenuText(), mainMenuKeyboard());
}

async function handleCancel(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null) {
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, parsed.chatId as number, "Действие отменено. Возвращаю в меню.", mainMenuKeyboard());
}

async function handleChecklist(env: Env, parsed: ReturnType<typeof parseUpdate>) {
  const chatId = parsed.chatId as number;
  await sendMessage(env.BOT_TOKEN, chatId, buildChecklistText());
  await sendDocument(env.BOT_TOKEN, chatId, env.CHECKLIST_URL, undefined, checklistKeyboard());
}

async function handleAudit(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null, sourceRoute = "audit") {
  const chatId = parsed.chatId as number;

  if (!state || state.kind !== "diagnostic") {
    await setUserState(env.DB, parsed.userId, {
      kind: "diagnostic",
      step: 0,
      answers: {},
      source_route: sourceRoute,
    });
    await sendMessage(env.BOT_TOKEN, chatId, buildAuditIntroText());
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      `Шаг 1 из ${QUESTIONS.length}\n\n${QUESTIONS[0].prompt}`,
      diagnosticKeyboard(0),
    );
    return;
  }

  const step = state.step;
  if (step >= QUESTIONS.length) {
    await finishDiagnostic(env, parsed, state);
    return;
  }

  await setUserState(env.DB, parsed.userId, {
    ...state,
    step: step + 1,
  });
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    `Шаг ${step + 2} из ${QUESTIONS.length}\n\n${QUESTIONS[step + 1].prompt}`,
    diagnosticKeyboard(step + 1),
  );
}

async function handleCases(env: Env, parsed: ReturnType<typeof parseUpdate>) {
  const chatId = parsed.chatId as number;
  const buttons = Object.keys(CASE_LIBRARY).map((caseId) => [
    { text: CASE_LIBRARY[caseId].title, callback_data: `case_${caseId}` },
  ]);
  buttons.push([{ text: "Мини-диагностика", callback_data: "audit" }]);
  await sendMessage(env.BOT_TOKEN, chatId, buildCasesMenuText(), { inline_keyboard: buttons });
}

async function handleQuestion(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null) {
  const chatId = parsed.chatId as number;
  await setUserState(env.DB, parsed.userId, { kind: "question", question_kind: "free_text" });
  await sendMessage(env.BOT_TOKEN, chatId, buildQuestionIntroText(), contactRequestKeyboard());
}

async function handleCallbackOrContact(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState | null) {
  const chatId = parsed.chatId as number;
  const text = parsed.text;
  const contact = parsed.contact;
  const callbackData = parsed.callbackData;
  const userId = parsed.userId;

  if (callbackData) {
    if (callbackData === "menu") {
      await handleMenu(env, parsed, state);
      return;
    }
    if (callbackData === "checklist") {
      await handleChecklist(env, parsed);
      return;
    }
    if (callbackData === "audit") {
      await handleAudit(env, parsed, null, "audit");
      return;
    }
    if (callbackData === "cases") {
      await handleCases(env, parsed);
      return;
    }
    if (callbackData === "question") {
      await handleQuestion(env, parsed, state);
      return;
    }
    if (callbackData === "contact_request") {
      await setUserState(env.DB, parsed.userId, { kind: "contact_request" });
      await sendMessage(env.BOT_TOKEN, chatId, buildContactRequestText(), contactRequestKeyboard());
      return;
    }
    if (callbackData === "telegram_contact_allowed") {
      await saveContact(env.DB, userId, "Telegram");
      await sendMessage(env.BOT_TOKEN, chatId, buildContactSavedText());
      await sendAdminContactAfterDiagnostic(env, userId, "Telegram", true);
      await setUserState(env.DB, userId, null);
      await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(), mainMenuKeyboard());
      return;
    }
    if (callbackData.startsWith("case_")) {
      const caseId = callbackData.slice(5);
      await sendMessage(env.BOT_TOKEN, chatId, buildCaseText(caseId), mainMenuKeyboard());
      return;
    }
  }

  if (!state) {
    if (text && ["в меню", "/menu", "/cancel"].includes(text.toLowerCase())) {
      await handleMenu(env, parsed, state);
      return;
    }
    await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(), mainMenuKeyboard());
    return;
  }

  if (state.kind === "contact_request") {
    const telegramContactAllowed = resolveTelegramContactAllowed(text, contact);
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
    await sendAdminContactAfterDiagnostic(env, userId, contactText, telegramContactAllowed);
    await setUserState(env.DB, userId, null);
    await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(), mainMenuKeyboard());
    return;
  }

  if (state.kind === "question") {
    if (!text) {
      await sendMessage(env.BOT_TOKEN, chatId, buildQuestionIntroText(), contactRequestKeyboard());
      return;
    }

    if (["в меню", "/menu", "/cancel"].includes(text.toLowerCase())) {
      await handleMenu(env, parsed, state);
      return;
    }

    await saveQuestionLead(env, parsed.user as any, text);
    await setUserState(env.DB, userId, null);
    await sendMessage(env.BOT_TOKEN, chatId, "Спасибо. Сообщение сохранил и передал команде.", mainMenuKeyboard());
    return;
  }

  await sendMessage(env.BOT_TOKEN, chatId, buildMainMenuText(), mainMenuKeyboard());
}

async function handleDiagnosticText(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState) {
  const chatId = parsed.chatId as number;
  if (state.kind !== "diagnostic") return;

  const text = parsed.text as string;
  const question = QUESTIONS[state.step];
  if (!question) return;

  const optionIndex = question.options.indexOf(text);
  if (optionIndex === -1) {
    await sendMessage(env.BOT_TOKEN, chatId, question.prompt, diagnosticKeyboard(question.step));
    return;
  }

  const answers = { ...state.answers, [question.key]: question.options[optionIndex] };
  const nextStep = question.step + 1;

  if (nextStep >= QUESTIONS.length) {
    await setUserState(env.DB, parsed.userId, null);
    await saveDiagnosticLead(env, parsed.user as any, { ...state, answers });
    await sendMessage(env.BOT_TOKEN, chatId, buildAuditFinishedText(), diagnosticResultKeyboard());
    return;
  }

  await setUserState(env.DB, parsed.userId, {
    kind: "diagnostic",
    step: nextStep,
    answers,
    source_route: state.source_route,
  });
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    `Шаг ${nextStep + 1} из ${QUESTIONS.length}\n\n${QUESTIONS[nextStep].prompt}`,
    diagnosticKeyboard(nextStep),
  );
}

async function handleQuestionText(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState) {
  const chatId = parsed.chatId as number;
  const text = parsed.text as string;

  if (["в меню", "/menu", "/cancel"].includes(text.toLowerCase())) {
    await handleMenu(env, parsed, state);
    return;
  }

  await saveQuestionLead(env, parsed.user as any, text);
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, chatId, "Спасибо. Сообщение сохранил и передал команде.", mainMenuKeyboard());
}

function resolveRoute(startParam: string | null): string | null {
  if (!startParam) return null;
  if (["checklist", "audit", "consultation", "question", "cases"].includes(startParam)) return startParam;
  if (startParam.startsWith("case_")) return "case";
  return null;
}

function extractCaseId(startParam: string | null): string | null {
  if (!startParam || !startParam.startsWith("case_")) return null;
  return startParam.slice(5);
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
  if (!t) return null;
  return t;
}

async function ensureUser(db: D1Database, user: any, chatId: number) {
  if (!user) return;
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO users (telegram_id, username, first_name, last_name, language_code, start_param, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(telegram_id) DO UPDATE SET username = excluded.username, first_name = excluded.first_name, last_name = excluded.last_name, language_code = excluded.language_code, last_seen_at = excluded.last_seen_at`
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
  await db.prepare("INSERT INTO leads (telegram_id, kind, payload_json, created_at) VALUES (?, ?, ?, ?)").bind(telegramId, kind, JSON.stringify(payload), now).run();
}

async function getLatestLead(db: D1Database, telegramId: number) {
  const result = await db.prepare("SELECT payload_json FROM leads WHERE telegram_id = ? ORDER BY id DESC LIMIT 1").bind(telegramId).first<{ payload_json: string }>();
  if (!result) return null;
  return JSON.parse(result.payload_json);
}

async function saveDiagnosticLead(env: Env, user: any, state: Extract<UserState, { kind: "diagnostic" }>) {
  const answers = { ...state.answers };
  const payload = {
    clinic_name: answers.clinic_type || null,
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
    source_route: state.source_route,
  };

  await saveLead(env.DB, user.id, "diagnostic", payload as any);
  await sendAdminLead(env, user, payload as any, "diagnostic");
}

async function saveQuestionLead(env: Env, user: any, text: string) {
  const payload = {
    question: text,
    telegram_contact_allowed: false,
  };
  await saveLead(env.DB, user.id, "question", payload);
  await sendAdminLead(env, user, payload, "question");
}

async function saveContactLead(env: Env, user: any, contact: string, telegramContactAllowed: boolean, diagnosticPayload: any) {
  const payload = {
    ...diagnosticPayload,
    contact_phone: contact,
    telegram_contact_allowed: telegramContactAllowed,
  };
  await saveLead(env.DB, user.id, "contact_after_diagnostic", payload);
  await sendAdminContactAfterDiagnostic(env, user.id, contact, telegramContactAllowed, diagnosticPayload);
}

async function finishDiagnostic(env: Env, parsed: ReturnType<typeof parseUpdate>, state: UserState) {
  const user = parsed.user as any;
  const stateDiagnostic = state as Extract<UserState, { kind: "diagnostic" }>;
  await saveDiagnosticLead(env, user, stateDiagnostic);
  await setUserState(env.DB, parsed.userId, null);
  await sendMessage(env.BOT_TOKEN, parsed.chatId as number, buildAuditFinishedText(), diagnosticResultKeyboard());
}

async function sendAdminLead(env: Env, user: any, payload: any, kind: string) {
  await sendAdminMessage(env, formatLeadText(user, payload, kind));
}

async function sendAdminContactAfterDiagnostic(env: Env, userId: number, contact: string, telegramContactAllowed: boolean, diagnosticPayload: any) {
  const user = await env.DB.prepare("SELECT telegram_id, username, first_name, last_name FROM users WHERE telegram_id = ?").bind(userId).first<any>();
  if (!user) return;

  const lines = [
    "🦷 Контакт после пред-аудита",
    "",
    `Telegram ID: ${user.telegram_id}`,
    `Username: ${user.username ? "@" + user.username : "—"}`,
    `Имя: ${[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}`,
  ];

  if (diagnosticPayload) {
    lines.push(
      "",
      "Последняя диагностика:",
      `Тип клиники: ${diagnosticPayload.clinic_type || "—"}`,
      `Что уже есть: ${diagnosticPayload.existing_tools || "—"}`,
      `Главная проблема: ${diagnosticPayload.main_problem || "—"}`,
      `Куда приходят заявки: ${diagnosticPayload.lead_channels || "—"}`,
      `Скорость ответа: ${diagnosticPayload.response_speed || "—"}`,
      `Приоритет: ${diagnosticPayload.priority || "—"}`,
    );
  }

  lines.push(
    "",
    `Контакт: ${contact || "—"}`,
    `Можно писать в Telegram: ${telegramContactAllowed ? "Да" : "Нет"}`,
    `Источник: contact_after_diagnostic`,
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

function formatLeadText(user: any, payload: any, kind: string): string {
  const lines = [
    "Новая заявка с сайта / Telegram-бота",
    "",
    `Telegram ID: ${user.id}`,
    `Username: ${user.username ? "@" + user.username : "—"}`,
    `Имя: ${[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}`,
    `Клиника: ${payload.clinic_name || "—"}`,
    `Город: ${payload.city || "—"}`,
    `Роль: ${payload.role || "—"}`,
    `Тип клиники: ${payload.clinic_type || "—"}`,
    `Что уже есть: ${payload.existing_tools || "—"}`,
    `Главная проблема: ${payload.main_problem || "—"}`,
    `Куда приходят заявки: ${payload.lead_channels || "—"}`,
    `Скорость ответа: ${payload.response_speed || "—"}`,
    `Приоритет: ${payload.priority || "—"}`,
    `Что хочет разобрать: ${payload.audit_focus || payload.question || "—"}`,
    `Можно написать в Telegram: ${payload.telegram_contact_allowed ? "Да" : "Нет"}`,
    `Контакт: ${payload.contact_phone || "—"}`,
    `Комментарий: ${payload.comment || payload.question || "—"}`,
    `Источник: @${env.BOT_USERNAME} (${kind})`,
  ];

  if (payload.start_param) lines.push(`Start param: ${payload.start_param}`);
  return lines.join("\n");
}