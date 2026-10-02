import { describe, expect, it } from "vitest";
import { CLINIC, KIT, extractCaseId, questionsFor, resolveAction, resolveTrack } from "../src/tracks";
import {
  buildAuditFinishedText,
  buildAuditIntroText,
  buildCasesMenuText,
  buildChecklistText,
  buildContactRequestText,
  buildContactSavedText,
  buildMainMenuText,
  buildQuestionIntroText,
} from "../src/texts";

describe("маршрутизация deep links", () => {
  it("короткие ссылки остаются в клиническом направлении", () => {
    // Ссылки зашиты в тексты сайта и рекламные кампании.
    for (const param of ["checklist", "audit", "consultation", "question", "cases"]) {
      expect(resolveTrack(param)).toBe(CLINIC);
    }
  });

  it("ссылки с префиксом kit_ ведут к продавцам", () => {
    expect(resolveTrack("kit_checklist")).toBe(KIT);
    expect(resolveTrack("kit_audit")).toBe(KIT);
    expect(resolveTrack("kit_question")).toBe(KIT);
    expect(resolveTrack("kit_cases")).toBe(KIT);
  });

  it("старая приставка seller_ тоже работает", () => {
    // Лендинг использовал seller_audit, а бот такого не знал и просто
    // открывал меню. Поддержка нужна, чтобы старые ссылки заработали.
    expect(resolveTrack("seller_audit")).toBe(KIT);
    expect(resolveAction("seller_audit")).toBe("audit");
    expect(resolveAction("seller_potential")).toBe("audit");
    expect(resolveAction("seller_launch")).toBe("consultation");
  });

  it("действие снимает префикс направления", () => {
    expect(resolveAction("kit_audit")).toBe("audit");
    expect(resolveAction("audit")).toBe("audit");
    expect(resolveAction("kit_case_arximed-security")).toBe("case");
    expect(resolveAction("case_eurodent")).toBe("case");
  });

  it("неизвестная метка не ломает переход", () => {
    expect(resolveAction(null)).toBe("menu");
    expect(resolveAction("")).toBe("menu");
    expect(resolveAction("абракадабра")).toBe("menu");
    expect(resolveTrack(null)).toBe(CLINIC);
  });

  it("идентификатор кейса достаётся из обеих приставок", () => {
    expect(extractCaseId("case_eurodent")).toBe("eurodent");
    expect(extractCaseId("kit_case_arximed-security")).toBe("arximed-security");
    expect(extractCaseId("seller_case_arximed-security")).toBe("arximed-security");
    expect(extractCaseId("audit")).toBeUndefined();
  });
});

describe("вопросы диагностики", () => {
  it("у каждого направления свой набор вопросов", () => {
    expect(questionsFor(CLINIC)).toHaveLength(6);
    expect(questionsFor(KIT)).toHaveLength(6);
    expect(questionsFor(CLINIC)[0].prompt).toBe("Какая у вас клиника?");
    expect(questionsFor(KIT)[0].prompt).toBe("Что продаёте?");
  });

  it("наборы не пересекаются", () => {
    const clinic = questionsFor(CLINIC).map((q) => q.prompt);
    const kit = questionsFor(KIT).map((q) => q.prompt);
    for (const prompt of kit) expect(clinic).not.toContain(prompt);
  });

  it("неизвестное направление не ломает вопросы", () => {
    expect(questionsFor("что-то")).toHaveLength(6);
  });
});

/**
 * Тексты не должны содержать чужие термины.
 *
 * Раньше buildContactSavedText был один на оба направления, и
 * продавцу уходило «где клиника может терять пациентов». Тесты
 * фиксируют разделение, чтобы регрессия не вернулась.
 */
const ALL_TEXTS = [
  buildMainMenuText,
  buildChecklistText,
  buildAuditIntroText,
  buildQuestionIntroText,
  buildCasesMenuText,
  buildContactRequestText,
  buildContactSavedText,
  buildAuditFinishedText,
] as const;

describe("тексты бота разделены по направлениям", () => {
  it("в текстах для продавцов нет слов про клинику", () => {
    for (const build of ALL_TEXTS) {
      const text = build(KIT);
      expect(text).not.toMatch(/клиник/i);
      expect(text).not.toMatch(/пациент/i);
      expect(text).not.toMatch(/стоматолог/i);
    }
  });

  it("в текстах для клиник нет слов про продавцов", () => {
    for (const build of ALL_TEXTS) {
      const text = build(CLINIC);
      expect(text).not.toMatch(/продавц/i);
      expect(text).not.toMatch(/маркетплейс/i);
    }
  });

  it("сообщение после контакта называет разбор по направлению", () => {
    // Именно этот текст раньше был общим: продавец получал
    // обещание разбора клиники. Проверяем ключевое слово
    // направления, а не всю фразу: формулировка может меняться.
    expect(buildContactSavedText(KIT)).toMatch(/канал(а)? продаж/i);
    expect(buildContactSavedText(KIT)).not.toMatch(/клиник/i);
    expect(buildContactSavedText(CLINIC)).toMatch(/клиник/i);
    expect(buildContactSavedText(CLINIC)).not.toMatch(/продавц/i);
  });

  it("меню не обещает кейсов, которых нет", () => {
    // У направления продавцов всего один кейс — текст обязан
    // сказать об этом прямо, а не обещать «несколько».
    expect(buildCasesMenuText(KIT)).toMatch(/один кейс/i);
    expect(buildCasesMenuText(KIT)).not.toMatch(/несколько кейсов/i);
  });

  it("во всех текстах только русские кавычки", () => {
    for (const build of ALL_TEXTS) {
      for (const track of [CLINIC, KIT]) {
        const text = build(track);
        expect(text).not.toMatch(/[“”„«»]/);
        expect(text).not.toMatch(/["']/);
      }
    }
  });

  it("списки размечены маркером, а не тире", () => {
    // Тире в начале строки в Telegram читается как минус.
    for (const build of ALL_TEXTS) {
      for (const track of [CLINIC, KIT]) {
        expect(build(track)).not.toMatch(/^—/m);
      }
    }
  });
});
