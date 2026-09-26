import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";

export const metadata = {
  title: "7 контуров пациентопотока",
  description: "Методология 7К: контакт, кредит доверия, выбор, действие, коммуникация, камбэк, контроль — как управлять пациентом от первого касания до записи.",
};

export default function SevenKArticle() {
  return (
    <main>
      <SiteHeader solidBg />
      <article className="section-pad">
        <div className="container-wide max-w-3xl">
          <SectionTitle kicker="Блог" title="7 контуров пациентопотока" />
          <div className="mt-8 space-y-6 leading-8 text-muted-foreground">
            <p>
              Методология 7К — это фреймворк, который мы разработали для стоматологий, чтобы увидеть, где пациент теряется в маршруте. 
              Каждый контур оценивается по единому критерию: закрывает ли он потерю пациента.
            </p>
            <h2 className="text-xl font-bold text-foreground">Контур 1: Контакт</h2>
            <p>Проверяем карты, поиск, локальную выдачу, рекламу, присутствие в точках выбора. Потеря — пациент не находит клинику в нужный момент.</p>
            <h2 className="text-xl font-bold text-foreground">Контур 2: Кредит доверия</h2>
            <p>Отзывы, рейтинг, врачи, фото, кейсы, лицензии, репутационные сигналы. Потеря — пациент не доверяет клинике.</p>
            <h2 className="text-xl font-bold text-foreground">Контур 3: Контекст выбора</h2>
            <p>Смыслы, услуги, отличия, цена, страхи. Потеря — пациент не понимает, почему выбрать именно эту клинику.</p>
            <h2 className="text-xl font-bold text-foreground">Контур 4: Конверсия действия</h2>
            <p>Сайт, формы, кнопки, мессенджеры, онлайн-запись. Потеря — пациент не делает следующий шаг.</p>
            <h2 className="text-xl font-bold text-foreground">Контур 5: Коммуникация</h2>
            <p>Скорость ответа, скрипты, администраторы, запись. Потеря — качество обработки обращения теряет пациента.</p>
            <h2 className="text-xl font-bold text-foreground">Контур 6: Камбэк</h2>
            <p>Недозвоны, «подумаю», реактивация, повторные касания. Потеря — клиника не возвращает тех, кто не записался сразу.</p>
            <h2 className="text-xl font-bold text-foreground">Контур 7: Контроль</h2>
            <p>CRM, статусы, аналитика, индекс, отчёты. Потеря — нет цифр и управляемости системой.</p>
            <p className="text-lg font-semibold text-foreground">
              Если хотя бы один контур протекает, пациентопоток теряет силу. Нельзя масштабировать трафик, пока критические потери остаются неуправляемыми.
            </p>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}