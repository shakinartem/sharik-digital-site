/**
 * Направления работы бота.
 *
 * Бот обслуживает два продукта: пациентопоток клиник и собственный
 * канал продаж селлеров. Аудитории не пересекаются, и вопросы у них
 * разные, поэтому один сценарий на всех не работает: селлеру нельзя
 * предлагать «какая у вас клиника».
 *
 * Логика намеренно повторяет бот/ (Python): питоновская версия
 * остаётся резервной, и расхождение между ними сделало бы сценарий
 * непредсказуемым при переключении.
 */

export type TrackKey = "clinic" | "kit";

export const CLINIC: TrackKey = "clinic";
export const KIT: TrackKey = "kit";

export type DiagnosticQuestion = {
  key: string;
  prompt: string;
  options: readonly string[];
  step: number;
};

function q(step: number, key: string, prompt: string, options: readonly string[]): DiagnosticQuestion {
  return { step, key, prompt, options };
}

const CLINIC_QUESTIONS: readonly DiagnosticQuestion[] = [
  q(0, "clinic_type", "Какая у вас клиника?", ["Стоматология", "Медицинский центр", "Косметология", "Подология", "Другое"]),
  q(1, "existing_tools", "Что уже используется?", [
    "Сайт", "Соцсети", "Карты", "Реклама", "CRM", "Telegram / WhatsApp-заявки", "Бот", "Пока ничего системного",
  ]),
  q(2, "main_problem", "Что сейчас беспокоит больше всего?", [
    "Мало заявок", "Карты плохо работают", "Сайт не приводит пациентов", "Соцсети не дают обращений",
    "Заявки теряются", "Нет CRM / автоматизации", "Не понимаю, что работает", "Нужно всё под ключ",
  ]),
  q(3, "lead_channels", "Куда сейчас попадают заявки?", [
    "Телефон", "WhatsApp", "Telegram", "CRM", "Форма на сайте", "В разные места", "Не отслеживаем системно",
  ]),
  q(4, "response_speed", "Как быстро обычно отвечают пациенту?", [
    "До 5 минут", "5-30 минут", "В течение часа", "Несколько часов", "На следующий день", "Не знаю",
  ]),
  q(5, "priority", "Что хотите улучшить в первую очередь?", [
    "Больше пациентов", "Усилить карты", "Упаковать соцсети", "Сделать сайт / лендинг",
    "Настроить заявки в Telegram", "Подключить CRM", "Автоматизировать обработку", "Получить понятный план",
  ]),
];

const KIT_QUESTIONS: readonly DiagnosticQuestion[] = [
  q(0, "clinic_type", "Что продаёте?", [
    "Одежда и обувь", "Косметика и парфюмерия", "Товары для дома", "Электроника и гаджеты",
    "Детские товары", "Спорт и туризм", "Красота и здоровье", "Другое",
  ]),
  q(1, "existing_tools", "Где уже продаёте и что настроено?", [
    "Только Wildberries", "Только Ozon", "Обе площадки", "Свой магазин на Яндекс KIT",
    "Свой сайт", "Инфопродукты", "Только закупка и перепродажа", "Пока ничего",
  ]),
  q(2, "main_problem", "Что сейчас мешает больше всего?", [
    "Нет своего канала продаж", "Всё завязано на площадку", "Не понимаю, окупается ли реклама",
    "Мало повторных покупок", "Нет нормальной аналитики", "Товары теряются в выдаче",
    "Нужен быстрый запуск", "Хочу разобраться в цифрах",
  ]),
  q(3, "lead_channels", "Куда сейчас попадают заказы и вопросы?", [
    "Карточки Wildberries", "Карточки Ozon", "Свой магазин", "Telegram", "WhatsApp", "Почта",
    "В разные места", "Не отслеживаю системно",
  ]),
  q(4, "response_speed", "Как быстро обычно отвечаете покупателю?", [
    "До 5 минут", "5-30 минут", "В течение часа", "Несколько часов", "На следующий день", "Не знаю",
  ]),
  q(5, "priority", "Что хотите получить в первую очередь?", [
    "Оценку потенциала канала", "План запуска магазина", "Понять экономику и окупаемость",
    "Перенести товары с площадки", "Настроить аналитику", "Собрать SEO для каталога",
    "Определить, нужен ли KIT вообще", "Получить понятный план действий",
  ]),
];
/** Подписи полей в заявке: одни и те же ключи, но называть по-разному. */
const LABELS: Record<TrackKey, Record<string, string>> = {
  clinic: {
    clinic_type: "Тип клиники",
    existing_tools: "Что уже есть",
    main_problem: "Главная проблема",
    lead_channels: "Куда приходят заявки",
    response_speed: "Скорость ответа",
    priority: "Приоритет",
  },
  kit: {
    clinic_type: "Категория товаров",
    existing_tools: "Где продаёте сейчас",
    main_problem: "Что мешает",
    lead_channels: "Куда попадают заказы",
    response_speed: "Скорость ответа",
    priority: "Что хочет получить",
  },
};

export type Track = {
  key: TrackKey;
  questions: readonly DiagnosticQuestion[];
  label: (questionKey: string) => string;
  /** Направление в человеческом виде для заявки. */
  title: string;
};

export const TRACKS: Record<TrackKey, Track> = {
  clinic: {
    key: CLINIC,
    questions: CLINIC_QUESTIONS,
    label: (k) => LABELS.clinic[k] ?? k,
    title: "Клиники",
  },
  kit: {
    key: KIT,
    questions: KIT_QUESTIONS,
    label: (k) => LABELS.kit[k] ?? k,
    title: "Продавцы",
  },
};

export function isTrackKey(value: unknown): value is TrackKey {
  return value === CLINIC || value === KIT;
}

export function getTrack(key: unknown): Track {
  return isTrackKey(key) ? TRACKS[key] : TRACKS[CLINIC];
}

export function questionsFor(key: unknown): readonly DiagnosticQuestion[] {
  return getTrack(key).questions;
}

// --- Маршрутизация deep links -------------------------------------------
//
// Короткие ссылки без префикса — клинические: они зашиты в тексты
// сайта и в рекламные кампании, переименовывать их нельзя.

const TRACKED: Record<string, TrackKey> = {
  checklist: CLINIC,
  audit: CLINIC,
  consultation: CLINIC,
  question: CLINIC,
  cases: CLINIC,
  // Отзывы клиентов: deep-ссылка с сайта ведёт прямо в список.
  reviews: CLINIC,
  kit_checklist: KIT,
  kit_audit: KIT,
  kit_consultation: KIT,
  kit_question: KIT,
  kit_cases: KIT,
  kit_reviews: KIT,
};

/** Старые ссылки с лендинга: префикс seller_ бот раньше не знал. */
const SELLER_ALIASES: Record<string, string> = {
  potential: "kit_audit",
  launch: "kit_consultation",
};

const LEGACY_SELLER_PREFIX = "seller_";

export function resolveTrack(param: string | null | undefined): TrackKey {
  if (!param) return CLINIC;
  const normalized = param.trim().toLowerCase();
  if (normalized in TRACKED) return TRACKED[normalized];
  if (normalized.startsWith(LEGACY_SELLER_PREFIX) || normalized.startsWith("kit_")) return KIT;
  return CLINIC;
}

export function extractCaseId(param: string | null | undefined): string | undefined {
  if (!param) return undefined;
  let normalized = param.trim().toLowerCase();
  if (normalized.startsWith(LEGACY_SELLER_PREFIX)) {
    normalized = normalized.slice(LEGACY_SELLER_PREFIX.length);
  }
  for (const prefix of ["kit_case_", "case_"]) {
    if (normalized.startsWith(prefix)) {
      const id = normalized.slice(prefix.length).trim();
      if (id) return id;
    }
  }
  return undefined;
}

export function resolveAction(param: string | null | undefined): string {
  if (!param) return "menu";
  let normalized = param.trim().toLowerCase();
  if (normalized.startsWith(LEGACY_SELLER_PREFIX)) {
    const rest = normalized.slice(LEGACY_SELLER_PREFIX.length);
    normalized = SELLER_ALIASES[rest] ?? `kit_${rest}`;
  }
  if (normalized.startsWith("case_") || normalized.startsWith("kit_case_")) return "case";
  if (normalized in TRACKED) return normalized.startsWith("kit_") ? normalized.slice(4) : normalized;
  return "menu";
}

