import { describe, it, expect } from "vitest";
import {
  REVIEWS,
  getReview,
  buildReviewText,
  buildReviewsMenuText,
  reviewsForNiche,
  reviewNiches,
} from "../src/reviews";

/**
 * Отзывы в боте.
 *
 * Проверяем то, что может тихо сломаться: пустой фильтр не должен
 * показывать «ничего не найдено», неизвестный id — не приводить к
 * пустому сообщению, а части текста — не превышать лимит Telegram.
 */
describe("отзывы", () => {
  it("все отзывы на месте и у всех есть автор", () => {
    expect(Object.keys(REVIEWS).length).toBe(9);
    for (const [id, r] of Object.entries(REVIEWS)) {
      expect(r.author, id).toBeTruthy();
      expect(r.role, id).toBeTruthy();
      expect(r.result, id).toBeTruthy();
      expect(r.text.length, id).toBeGreaterThan(0);
    }
  });

  it("части текста не превышают лимит Telegram", () => {
    for (const [id, r] of Object.entries(REVIEWS)) {
      for (const part of r.text) {
        expect(part.length, id).toBeLessThanOrEqual(700);
      }
    }
  });

  it("ниша без отзывов честно сообщает об этом", () => {
    const text = buildReviewsMenuText("Психиатрия");
    expect(text).toContain("отзывов пока нет");
    expect(text).toContain("не выдумываем");
  });

  it("существующая ниша показывает количество", () => {
    const text = buildReviewsMenuText("Стоматология");
    expect(text).toContain("Стоматология");
    expect(text).not.toContain("отзывов пока нет");
  });

  it("фильтр по нише возвращает только её отзывы", () => {
    const all = reviewsForNiche();
    const dental = reviewsForNiche("Стоматология");
    expect(all.length).toBe(9);
    expect(dental.length).toBeGreaterThan(0);
    expect(dental.length).toBeLessThan(all.length);
    for (const [, r] of dental) expect(r.niche).toBe("Стоматология");
  });

  it("список ниш не содержит пустых значений", () => {
    const niches = reviewNiches();
    expect(niches.length).toBeGreaterThan(0);
    for (const n of niches) expect(n).toBeTruthy();
  });

  it("неизвестный id не даёт пустого сообщения", () => {
    const parts = buildReviewText("no-such-review");
    expect(parts[0]).toContain("не найден");
    expect(parts.join(" ")).toContain("sharik-digital.ru/reviews");
  });

  it("текст отзыва заканчивается подписью и результатом", () => {
    const id = Object.keys(REVIEWS)[0];
    const parts = buildReviewText(id);
    const last = parts[parts.length - 1];
    expect(last).toContain(REVIEWS[id].result);
  });

  it("getReview находит существующий отзыв", () => {
    expect(getReview("dental-pro")).toBeDefined();
    expect(getReview("nope")).toBeUndefined();
  });
});
