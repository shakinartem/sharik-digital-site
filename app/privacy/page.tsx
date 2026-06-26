import { Header } from "@/components/Header";
import { site } from "@/data/site";

export default function PrivacyPage() {
  return (
    <main>
      <Header />
      <section className="section-pad">
        <div className="container-pad max-w-4xl">
          <div className="card p-8 md:p-12">
            <h1 className="text-4xl font-black tracking-tight">Политика конфиденциальности</h1>
            <p className="mt-6 leading-8 text-muted">
              Эта страница — MVP-шаблон политики конфиденциальности для сайта ШАРиК-digital. Перед публикацией рекомендуется адаптировать текст под юридические данные владельца сайта и фактические способы обработки персональных данных.
            </p>
            <div className="mt-8 space-y-6 text-muted">
              <section>
                <h2 className="text-xl font-bold text-ink">1. Какие данные могут собираться</h2>
                <p className="mt-2 leading-7">При переходе в Telegram-бот могут обрабатываться данные Telegram-профиля: user_id, username, имя, фамилия, язык интерфейса, дата входа, источник перехода, ответы диагностики и добровольно указанные контакты.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold text-ink">2. Для чего используются данные</h2>
                <p className="mt-2 leading-7">Данные используются для выдачи чек-листа, проведения мини-диагностики, обработки заявок, связи с пользователем и улучшения digital-сервиса.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold text-ink">3. Контакты</h2>
                <p className="mt-2 leading-7">По вопросам обработки данных можно связаться: {site.phone}, Telegram-бот {site.botUsername}.</p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
