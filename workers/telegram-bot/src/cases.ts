export const CASE_LIBRARY: Record<string, { title: string; niche: string; result: string }> = {
  eurodent: {
    title: "Eurodent",
    niche: "Стоматология",
    result: "1,5 млн охватов · 450 лидов · запись на 6 месяцев вперед",
  },
  biomed: {
    title: "Биомед",
    niche: "Стоматология",
    result: "146 обращений за 3 месяца · +68% действий в картах",
  },
  interdent: {
    title: "Интердент",
    niche: "Стоматология",
    result: "118 обращений · +57% построений маршрута",
  },
  "divina-podology": {
    title: "Divina Podology",
    niche: "Подология",
    result: "Запуск с нуля · первые клиенты за 2 недели",
  },
  kerala: {
    title: "Kerala",
    niche: "Аюрведа и wellness",
    result: "500 000 охват · 300 лидов · CPL 230 ₽",
  },
  "arximed-security": {
    title: "Arximed Security",
    niche: "MedTech",
    result: "Ошибки заказа снижены с 3,5% до 0,4%",
  },
  "dental-pro": {
    title: "Дентал-про",
    niche: "Стоматология",
    result: "+41% обращений · 18% конверсия в запись",
  },
  ibradent: {
    title: "IbraDent",
    niche: "Премиальная стоматология",
    result: "97 лидов · +49% действий в профиле",
  },
  "po-pyatam": {
    title: "По Пятам",
    niche: "Подология",
    result: "100 000+ просмотров в неделю · 10% конверсия в запись",
  },
};

export function buildCaseText(caseId: string) {
  const c = CASE_LIBRARY[caseId];
  if (!c) {
    return [
      "Кейс пока не найден.",
      "",
      "Попробуйте открыть общий список кейсов и выбрать один из доступных вариантов.",
    ].join("\n");
  }

  return [
    `Кейс: ${c.title}`,
    `Ниша: ${c.niche}`,
    `Результат: ${c.result}`,
    "",
    "Если хотите, могу сразу показать мини-диагностику по вашей клинике.",
  ].join("\n");
}