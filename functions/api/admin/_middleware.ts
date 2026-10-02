/**
 * Закрывает /admin и /api/admin/* от индексации и от чужих ботов.
 *
 * Пароль в админке — это первый рубеж, но страница не должна ни
 * попадать в поиск, ни отдавать интерфейс краулерам: иначе содержание
 * /admin всплывает в выдаче вместе со служебными текстами.
 */
export const onRequest = async (context: { request: Request; next: () => Promise<Response> }) => {
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("X-Frame-Options", "DENY");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};