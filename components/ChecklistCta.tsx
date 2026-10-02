import { site } from "@/data/site";

/**
 * Полоса с чек-листами — вход в бот со страниц, где направление заранее
 * неизвестно.
 *
 * Зачем: аудит воронки показал, что с главной, из блога и с «о компании»
 * на Telegram-бота не ведёт ни одной ссылки, и весь трафик из статей
 * упирался в /contacts. Чек-лист — самый дешёвый первый шаг, поэтому
 * предлагается именно он.
 *
 * Кнопок две, а не одна, и это не перестраховка: меню бота не умеет
 * менять направление и без параметра открывает клинический сценарий.
 * Продавцу, попавшему в клиническое меню, сценарий чужой — и человек
 * уходит. Две кнопки называют, кому какой чек-лист.
 */
export function ChecklistCta({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";

  return (
    <section className={`section-pad ${dark ? "" : "bg-muted"}`}>
      <div className="container-wide">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2
            className={`font-display text-2xl font-bold leading-tight sm:text-3xl ${
              dark ? "text-white" : "text-foreground"
            }`}
          >
            Начните с чек-листа — это бесплатно
          </h2>
          <p
            className={`mx-auto mt-4 max-w-xl text-sm leading-6 ${
              dark ? "text-white/80" : "text-muted-foreground"
            }`}
          >
            Бот задаст несколько вопросов и покажет, где в вашей воронке теряются
            деньги. Без созвонов и без обязательств.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={site.links.kitChecklist}
              className={`w-full sm:w-auto ${dark ? "btn-primary" : "btn-primary"}`}
            >
              Чек-лист запуска магазина
            </a>
            <a
              href={site.links.checklist}
              className={
                dark
                  ? "inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
                  : "btn-outline w-full sm:w-auto"
              }
            >
              Чек-лист для клиники
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
