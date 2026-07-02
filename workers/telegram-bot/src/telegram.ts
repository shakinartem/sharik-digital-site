export type MessageReplyMarkup = {
  inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
} | null;

export async function sendMessage(
  token: string,
  chatId: number | string,
  text: string,
  replyMarkup?: MessageReplyMarkup,
) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body: any = { chat_id: chatId, text, disable_web_page_preview: true };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    console.error("sendMessage failed", response.status, data);
    return null;
  }
  return data.result;
}

export async function sendDocument(
  token: string,
  chatId: number | string,
  documentUrl: string,
  caption?: string,
  replyMarkup?: MessageReplyMarkup,
) {
  const url = `https://api.telegram.org/bot${token}/sendDocument`;
  const body: any = { chat_id: chatId, document: documentUrl, disable_web_page_preview: true };
  if (caption) body.caption = caption;
  if (replyMarkup) body.reply_markup = replyMarkup;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    console.error("sendDocument failed", response.status, data);
    return null;
  }
  return data.result;
}

export async function answerCallbackQuery(
  token: string,
  callbackQueryId: string,
  text?: string,
) {
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  const body: any = { callback_query_id: callbackQueryId };
  if (text) body.text = text;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    console.error("answerCallbackQuery failed", response.status, data);
    return null;
  }
  return true;
}

export function parseUpdate(update: any) {
  const message = update?.message;
  const callbackQuery = update?.callback_query;
  const contact = message?.contact;
  const text = message?.text;

  return {
    messageId: message?.message_id ?? null,
    chatId: message?.chat?.id ?? callbackQuery?.message?.chat?.id ?? null,
    text: text ?? null,
    command: typeof text === "string" && text.startsWith("/") ? text.split(" ")[0].split("@")[0] : null,
    startParam:
      typeof text === "string" && text.startsWith("/start")
        ? text.split(" ")[1] || null
        : null,
    contact,
    callbackQueryId: callbackQuery?.id || null,
    callbackData: callbackQuery?.data || null,
    userId: message?.from?.id ?? callbackQuery?.from?.id ?? null,
    user: message?.from || callbackQuery?.from || null,
    replyToMessage: message?.reply_to_message || null,
    updateId: update?.update_id || null,
  };
}

</file_content>
<task_progress>
- [x] Create Cloudflare Worker structure and configs
- [x] Implement D1 schema and migrations
- [x] Implement Telegram API helpers
- [ ] Implement bot logic: /start, menu, checklist, cases, question, diagnostic, contact flow, cancel/menu
- [ ] Create docs/cloudflare-worker-bot.md with deploy and rollback
- [ ] Commit and push
</task_progress>
</write_to_file>