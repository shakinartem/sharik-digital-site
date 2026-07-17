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
    keyboard: [
      [{ text: "Поделиться контактом", request_contact: true }],
      [{ text: "Пишите сюда в Telegram" }],
      [{ text: "В меню" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function diagnosticKeyboard(step: number, options: readonly string[]): MessageReplyMarkup {
  return {
    inline_keyboard: options.map((option, index) => [
      {
        text: option,
        callback_data: `diag:${step}:${index}`,
      },
    ]),
  };
}
