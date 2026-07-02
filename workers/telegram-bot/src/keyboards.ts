import type { MessageReplyMarkup } from "./telegram";

export function mainMenuKeyboard(): MessageReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: "Забрать чек-лист", callback_data: "checklist" }],
      [{ text: "Пройти мини-диагностику", callback_data: "audit" }],
      [{ text: "Кейсы", callback_data: "cases" }],
      [{ text: "Задать вопрос", callback_data: "question" }],
      [{ text: "Открыть сайт", url: "https://sharik-digital.ru" }],
    ],
  };
}

export function checklistKeyboard(): MessageReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: "Пройти мини-диагностику", callback_data: "audit" }],
      [{ text: "Оставить заявку", callback_data: "question" }],
      [{ text: "Открыть сайт", url: "https://sharik-digital.ru" }],
    ],
  };
}

export function diagnosticResultKeyboard(): MessageReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: "Оставить контакт", callback_data: "contact_request" }],
      [{ text: "В меню", callback_data: "menu" }],
    ],
  };
}

export function contactRequestKeyboard(): MessageReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: "Поделиться контактом", callback_data: "contact_request" }],
      [{ text: "Пишите сюда в Telegram", callback_data: "telegram_contact_allowed" }],
      [{ text: "В меню", callback_data: "menu" }],
    ],
  };
}

export function diagnosticKeyboard(step: number): MessageReplyMarkup {
  // This will be built dynamically based on questions
  return null;
}