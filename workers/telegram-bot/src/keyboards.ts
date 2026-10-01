import type { MessageReplyMarkup } from "./telegram";
import { CLINIC, KIT, type TrackKey } from "./tracks";

/**
 * Действие кнопки. Направление едет вторым сегментом через двоеточие:
 * "audit:kit" — диагностика продавца, "audit" — клиники.
 *
 * Без суффикса остаётся клиника: так работают кнопки, отправленные
 * ботом до перехода на два направления.
 */
function action(name: string, track: TrackKey): string {
  return track === CLINIC ? name : `${name}:${track}`;
}

export function mainMenuKeyboard(track: TrackKey = CLINIC): MessageReplyMarkup {
  if (track === KIT) {
    return {
      inline_keyboard: [
        [{ text: "Оценить потенциал канала", callback_data: action("audit", KIT) }],
        [{ text: "Забрать чек-лист запуска", callback_data: action("checklist", KIT) }],
        [{ text: "Кейсы", callback_data: action("cases", KIT) }],
        [{ text: "Задать вопрос", callback_data: action("question", KIT) }],
        [{ text: "Открыть сайт", url: "https://sharik-digital.ru/sellers" }],
      ],
    };
  }

  return {
    inline_keyboard: [
      [{ text: "Забрать чек-лист", callback_data: action("checklist", CLINIC) }],
      [{ text: "Пройти мини-диагностику", callback_data: action("audit", CLINIC) }],
      [{ text: "Кейсы", callback_data: action("cases", CLINIC) }],
      [{ text: "Отзывы клиентов", callback_data: action("reviews", CLINIC) }],
      [{ text: "Задать вопрос", callback_data: action("question", CLINIC) }],
      [{ text: "Открыть сайт", url: "https://sharik-digital.ru" }],
    ],
  };
}

export function checklistKeyboard(track: TrackKey = CLINIC): MessageReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: "Пройти мини-диагностику", callback_data: action("audit", track) }],
      [{ text: "Оставить заявку", callback_data: action("question", track) }],
      [{ text: "Открыть сайт", url: track === KIT ? "https://sharik-digital.ru/sellers" : "https://sharik-digital.ru" }],
    ],
  };
}

export function diagnosticResultKeyboard(track: TrackKey = CLINIC): MessageReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: "Оставить контакт", callback_data: "contact_request" }],
      [{ text: "В меню", callback_data: action("menu", track) }],
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

export function diagnosticKeyboard(step: number, options: readonly string[], track: TrackKey = CLINIC): MessageReplyMarkup {
  return {
    inline_keyboard: options.map((option, index) => [
      {
        text: option,
        callback_data: `diag:${step}:${index}:${track}`,
      },
    ]),
  };
}

/**
 * Список отзывов: по одному отзыву на кнопку.
 *
 * Кнопок девять, поэтому Telegram сам уплотняет их в несколько
 * столбцов. Длинные подписи обрезаются — берём фамилию и роль
 * покороче, чтобы имя клиента читалось целиком.
 */
export function reviewsKeyboard(
  entries: readonly [string, { author: string; niche: string }][],
  track: TrackKey = CLINIC,
): MessageReplyMarkup {
  const rows: { text: string; callback_data: string }[][] = entries.map(([id, r]) => [
    { text: r.author, callback_data: `rev:${id}:${track}` },
  ]);

  rows.push([
    { text: "Фильтр по нише", callback_data: action("review_niches", track) },
    { text: "Все отзывы", callback_data: action("reviews", track) },
  ]);
  rows.push([{ text: "Мини-диагностика", callback_data: action("audit", track) }]);

  return { inline_keyboard: rows };
}

/** Кнопки ниш: только те, по которым отзывы действительно есть. */
export function reviewNicheKeyboard(
  niches: readonly string[],
  track: TrackKey = CLINIC,
): MessageReplyMarkup {
  const rows: { text: string; callback_data: string }[][] = niches.map((niche) => [
    { text: niche, callback_data: `revniche:${encodeURIComponent(niche)}:${track}` },
  ]);
  rows.push([{ text: "← Все отзывы", callback_data: action("reviews", track) }]);
  return { inline_keyboard: rows };
}

/** Кнопка под конкретным отзывом. */
export function reviewKeyboard(track: TrackKey = CLINIC): MessageReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: "Другие отзывы", callback_data: action("reviews", track) },
        { text: "Кейсы", callback_data: action("cases", track) },
      ],
      [{ text: "Пройти мини-диагностику", callback_data: action("audit", track) }],
      [{ text: "Все отзывы на сайте", url: "https://sharik-digital.ru/reviews" }],
    ],
  };
}

