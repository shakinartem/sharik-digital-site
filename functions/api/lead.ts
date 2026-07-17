interface LeadPayload {
  name?: string;
  clinic?: string;
  city?: string;
  improvement?: string;
  contact?: string;
  comment?: string;
  source?: string;
  page?: string;
  userAgent?: string;
  website?: string;
}

interface ApiResponse {
  ok: boolean;
  error?: string;
}

const MAX_FIELD_LENGTH = 1000;

function truncate(value: string | undefined, max: number): string {
  if (!value) return "";
  return value.slice(0, max);
}

function sanitize(value: string | undefined): string {
  if (!value) return "—";
  const trimmed = truncate(value, MAX_FIELD_LENGTH).trim();
  return trimmed || "—";
}

function buildTelegramMessage(payload: LeadPayload): string {
  const lines = [
    `🦷 Новая заявка с сайта ШАРиК-digital`,
    ``,
    `Источник: ${sanitize(payload.source)}`,
    `Страница: ${sanitize(payload.page)}`,
    ``,
    `Имя: ${sanitize(payload.name)}`,
    `Клиника: ${sanitize(payload.clinic)}`,
    `Город: ${sanitize(payload.city)}`,
    `Удобный канал: ${sanitize(payload.contact)}`,
    ``,
    `Что хочет улучшить:`,
    `${sanitize(payload.improvement)}`,
    ``,
    `Комментарий:`,
    `${sanitize(payload.comment)}`,
    ``,
    `Дата: ${new Date().toISOString()}`,
    `User-Agent: ${sanitize(payload.userAgent)}`,
  ];

  return lines.join("\n");
}

async function sendToTelegram(botToken: string, chatId: string, text: string): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const body = {
    chat_id: parseInt(chatId, 10),
    text,
    disable_web_page_preview: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "unknown error");
    console.error(`Telegram API error (${response.status}): ${errorBody}`);
    return false;
  }

  return true;
}

function isValidPayload(payload: LeadPayload): boolean {
  const { name, clinic, city, improvement, comment } = payload;
  return !!(name || clinic || city || improvement || comment);
}

export const onRequest = async (context: { request: Request; env: { BOT_TOKEN?: string; ADMIN_CHAT_ID?: string } }) => {
  const { request, env } = context;

  // Only accept POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" } as ApiResponse), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check server configuration
  const botToken = env.BOT_TOKEN;
  const adminChatId = env.ADMIN_CHAT_ID;

  if (!botToken || !adminChatId) {
    return new Response(JSON.stringify({ ok: false, error: "Server is not configured" } as ApiResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body
  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body" } as ApiResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Honeypot check — if website is filled, silently accept but don't send
  if (payload.website && payload.website.trim().length > 0) {
    return new Response(JSON.stringify({ ok: true } as ApiResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate payload is not empty
  if (!isValidPayload(payload)) {
    return new Response(JSON.stringify({ ok: false, error: "Lead data is empty" } as ApiResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build and send message
  const text = buildTelegramMessage(payload);
  const sent = await sendToTelegram(botToken, adminChatId, text);

  if (!sent) {
    return new Response(JSON.stringify({ ok: false, error: "Failed to send message to Telegram" } as ApiResponse), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true } as ApiResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};