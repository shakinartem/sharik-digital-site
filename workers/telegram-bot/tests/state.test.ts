import { describe, expect, it } from "vitest";
import { getUserState, setUserState } from "../src/state";
import { CLINIC, KIT } from "../src/tracks";

/**
 * Тесты на сохранение состояния диалога.
 *
 * Отдельный файл не из любопытства: состояние живёт между сообщениями
 * пользователя, поэтому направление обязано пережить запись в D1 и
 * чтение обратно. На этом уже терялись заявки — состояние
 * contact_request сохранялось без track, и подтверждение уходило
 * продавцу с клиническими словами.
 */

/**
 * Минимальная замена D1: таблица states — это ровно одна строка на
 * пользователя, и всё, что делает state.ts, это INSERT и SELECT.
 */
class FakeD1 {
  rows = new Map<number, { state: string; data_json: string }>();

  prepare(sql: string) {
    const self = this;
    return {
      bind(...args: unknown[]) {
        return {
          async first() {
            return self.rows.get(Number(args[0])) ?? null;
          },
          async run() {
            const id = Number(args[0]);
            if (/^\s*DELETE/i.test(sql)) {
              self.rows.delete(id);
            } else {
              self.rows.set(id, {
                state: String(args[1]),
                data_json: String(args[2]),
              });
            }
            return { success: true };
          },
        };
      },
    };
  }
}

/**
 * Каждому тесту — свой telegram_id. Модуль кэширует состояние в
 * памяти, и общий идентификатор протекал бы между тестами.
 */
function asDb(db: FakeD1) {
  return db as unknown as D1Database;
}

describe("состояние диалога", () => {
  it("сохраняет направление в запросе контакта (регрессия: терялись заявки продавцов)", async () => {
    const db = new FakeD1();

    await setUserState(asDb(db), 1001, { kind: "contact_request", track: KIT });
    const restored = await getUserState(asDb(db), 1001);

    expect(restored).toEqual({ kind: "contact_request", track: KIT });
  });

  it("откатывается к клиническому, если направление не записано", async () => {
    const db = new FakeD1();
    // Так выглядит состояние, записанное старой версией воркера.
    db.rows.set(1002, { state: "contact_request", data_json: "{}" });

    const restored = await getUserState(asDb(db), 1002);

    expect(restored).toEqual({ kind: "contact_request", track: CLINIC });
  });

  it("переживает цикл диагностики без потери ответов и направления", async () => {
    const db = new FakeD1();

    await setUserState(asDb(db), 1003, {
      kind: "diagnostic",
      step: 2,
      answers: { shop: "Wildberries" },
      track: KIT,
    });
    const restored = await getUserState(asDb(db), 1003);

    expect(restored).toMatchObject({ kind: "diagnostic", step: 2, track: KIT });
    expect(restored && restored.kind === "diagnostic" ? restored.answers : null).toEqual({
      shop: "Wildberries",
    });
  });

  it("различает клинический и seller-трек у вопроса", async () => {
    const db = new FakeD1();

    await setUserState(asDb(db), 1004, { kind: "question", question_kind: "free_text", track: KIT });
    const restored = await getUserState(asDb(db), 1004);

    expect(restored).toEqual({ kind: "question", question_kind: "free_text", track: KIT });
  });

  it("читает из памяти то же, что из базы (регрессия: прогретый воркер терял состояние)", async () => {
    const db = new FakeD1();

    // Первая запись кладёт состояние и в D1, и в кэш воркера. Если бы
    // в кэш писалась строка JSON, а не объект, чтение по горячему пути
    // вернуло бы пустое состояние: track сбрасывался, а шаг — на ноль.
    await setUserState(asDb(db), 1006, {
      kind: "diagnostic",
      step: 3,
      answers: { city: "Салават" },
      track: KIT,
    });

    const warm = await getUserState(asDb(db), 1006);
    const cold = await getUserState(asDb(new FakeD1()), 1006);

    expect(warm).toEqual(cold);
    expect(warm).toMatchObject({ kind: "diagnostic", step: 3, track: KIT });
  });

  it("удаляет состояние, когда его сбросили", async () => {
    const db = new FakeD1();

    await setUserState(asDb(db), 1005, { kind: "contact_request", track: KIT });
    await setUserState(asDb(db), 1005, null);

    expect(await getUserState(asDb(db), 1005)).toBeNull();
  });
});
