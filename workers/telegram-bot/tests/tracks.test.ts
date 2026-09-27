import { describe, expect, it } from "vitest";
import { CLINIC, KIT, extractCaseId, questionsFor, resolveAction, resolveTrack } from "../src/tracks";

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
