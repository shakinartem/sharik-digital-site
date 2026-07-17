import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/ui";

export const metadata = {
  title: "Карта потерь стоматологии — ШАРиК digital",
  description: "Пошаговое руководство по выявлению и закрытию потерь в маршруте пациента для стоматологических клиник.",
};

export default function LossMapArticle() {
  return (
    <main>
      <Header />
      <article className="section-pad">
        <div className="container-pad max-w-3xl">
          <SectionTitle kicker="Блог" title="Карта потерь стоматологии" />
          <div className="mt-8 space-y-6 text-[color:var(--muted)] leading-8">
            <p>
              Карта потерь — это поэтапный разбор маршрута пациента по 7 контурам. 
              Мы выявляем конкретную потерю, ищем доказательства, оцениваем критичность и формируем приоритеты.
            </p>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">Потери в контакте</h2>
            <p>Клиника не видна в поиске, карты, рекламе или точках выбора. Пациент не может найти клинику в нужный момент.</p>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">Потери в доверии</h2>
            <p>Недостаточно отзывов, фото, кейсов, лицензий. Пациент не доверяет клинике и не записывается.</p>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">Потери в выборе</h2>
            <p>Неочевидны преимущества, услуги, цены. Пациент не понимает, почему выбрать именно эту клинику.</p>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">Потери в действии</h2>
            <p>Сайт не ведёт к записи, формы сложные, мессенджеры не работают. Путь обрывается.</p>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">Потери в коммуникации</h2>
            <p>Медленный ответ, нет скриптов, администратор не конвертирует. Пациент уходит.</p>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">Потери в камбэке</h2>
            <p>Не возвращают тех, кто отказался. Утечка без последующего контакта.</p>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">Потери в контроле</h2>
            <p>Нет цифр, статусов, аналитики. Нельзя понять, где слабое место.</p>
          </div>
        </div>
      </article>
    </main>
  );
}