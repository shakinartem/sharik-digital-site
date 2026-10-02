/**
 * Согласие на файлы cookie.
 *
 * Отдельная категория одна — аналитика. Необходимые файлы всегда
 * включены, их нельзя отключить: без них не работает сайт.
 *
 * Выбор хранится в localStorage, а не в cookie, намеренно: он не
 * уходит на сервер при каждом запросе и не попадает в заголовки.
 * Версия ключа входит в имя, поэтому когда правила поменяются,
 * баннер спросит заново, а не молча продолжит старую договорённость.
 *
 * Решение разъезжается по вкладкам через событие в window: если
 * согласие выдали в одной вкладке, вторая подхватывает его сразу
 * и не показывает баннер повторно.
 */
import { useEffect, useState } from "react";

const KEY = "sharik_consent_v1";

export type Consent = {
  /** Аналитика и счётчики: Метрика, вебвизор, кликовая карта. */
  analytics: boolean;
  /** Когда решено. Нужно, чтобы отличать решение от его отсутствия. */
  decidedAt: number;
};

const EVENT = "sharik:consent-change";

function read(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    if (typeof parsed.analytics !== "boolean") return null;
    return { analytics: parsed.analytics, decidedAt: Number(parsed.decidedAt) || 0 };
  } catch {
    // Повреждённое значение считаем отсутствующим: безопаснее спросить
    // заново, чем считать полученное согласие за невыданное или наоборот.
    return null;
  }
}

function write(consent: Consent) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(consent));
  } catch {
    // Приватный режим может запрещать запись. Тогда согласие живёт
    // только в этой вкладке — это ограничение браузера, не сайта.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: consent }));
}

/** Сохранить решение. Единственное место, где оно меняется. */
export function saveConsent(analytics: boolean) {
  write({ analytics, decidedAt: Date.now() });
}

/**
 * Текущее согласие и признак готовности.
 *
 * ready нужно, чтобы не показать баннер мигнущим: пока компонент не
 * смонтирован на клиенте, решение неизвестно, и отрисовывать его
 * опасно — сервер отдал бы «нет», и баннер дёргался бы при гидрации.
 */
export function useConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(read());
    setReady(true);

    const onChange = (event: Event) => {
      setConsent((event as CustomEvent<Consent>).detail);
    };
    window.addEventListener(EVENT, onChange);

    // Согласие могли выдать в другой вкладке: подхватываем при возврате
    // во вкладку, иначе решение принятое час назад покажется снова.
    const onFocus = () => setConsent(read());
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return { consent, ready };
}