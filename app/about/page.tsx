import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";
import { agencyApproach, agencyStats } from "@/data/agency";
import { site } from "@/data/site";

export const metadata = {
  title: "О нас",
  description:
    "ШАРиК digital — digital-компания с двумя специализированными направлениями: продавцам маркетплейсов и клиникам. Основатель — Шакин Артём.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      <SiteHeader ctaLabel="Обсудить задачу" ctaHref="/contacts" />

      <section className="section-pad pt-12 sm:pt-16">
        <div className="container-wide">
          <SectionTitle
            as="h1"
            kicker="О нас"
            title="Не универсальное агентство, а две специализации"
            text="Мы не пытаемся одинаково работать со всеми. Воронка пациента клиники и воронка покупателя маркетплейса устроены по-разному — значит, и подходы должны быть разными."
          />

          <div className="card-base mx-auto mt-12 grid max-w-4xl gap-8 p-7 sm:p-10 lg:grid-cols-[auto,1fr] lg:items-center">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl ring-1 ring-border sm:h-40 sm:w-40">
              <Image
                src="/team/shakin-720.webp"
                alt={`${site.directorName} — ${site.directorRole.toLowerCase()} ШАРиК digital`}
                fill
                sizes="160px"
                priority
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{site.directorRole}</p>
              <h2 className="mt-1 font-display text-3xl font-bold leading-tight text-foreground">
                {site.directorName}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                {site.directorSummary}
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agencyStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-4xl font-bold text-primary">{stat.value}</p>
                <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-6 text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-muted">
        <div className="container-wide">
          <SectionTitle kicker="Процесс" title="Как устроена работа" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {agencyApproach.map((step) => (
              <li key={step.step} className="h-full">
                <div className="h-full rounded-card-sm border border-border bg-white p-5">
                  <p className="font-display text-sm font-bold text-primary">{step.step}</p>
                  <h3 className="mt-2 text-base font-black text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              Посмотрите, как это выглядит на реальных проектах
            </h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/cases" className="btn-primary w-full sm:w-auto">
                Смотреть кейсы
              </Link>
              <Link href="/contacts" className="btn-outline w-full sm:w-auto">
                Связаться
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
