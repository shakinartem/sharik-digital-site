import { Header } from "@/components/Header";
import { SectionTitle, ButtonLink } from "@/components/ui";

const posts = [
  {
    slug: "7-konturov-pacientopotoka",
    title: "7 контуров пациентопотока",
    description: "Методология, которая меняет подход к digital в стоматологии. Как управлять пациентом от первого касания до записи.",
    date: "2025-01-15",
  },
  {
    slug: "karta-poter-stomatologii",
    title: "Карта потерь стоматологии",
    description: "Пошаговое руководство по выявлению и закрытию потерь в маршруте пациента.",
    date: "2025-01-10",
  },
  {
    slug: "indeks-pacientopotoka",
    title: "Индекс пациентопотока",
    description: "Как измерять управляемость маршрута и понимать, готова ли клиника к росту.",
    date: "2025-01-05",
  },
];

export const metadata = {
  title: "Блог — ШАРиК digital",
  description: "Статьи о пациентопотоке, методологии 7К и управлении digital-системами для стоматологий.",
};

export default function BlogPage() {
  return (
    <main>
      <Header />
      <section className="section-pad">
        <div className="container-wide">
          <SectionTitle kicker="Блог" title="Пациентопоток и 7К" />
          <div className="mx-auto mt-8 max-w-3xl space-y-6">
            {posts.map((post) => (
              <article key={post.slug} className="card-base card-lift p-6 sm:p-7">
                <h3 className="font-black text-foreground" style={{ fontSize: "clamp(1.2rem, min(4cqi, 5rem), 1.75rem)", lineHeight: 1.05 }}>
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
                <div className="mt-4 text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString("ru-RU")}</div>
                <div className="mt-4">
                  <ButtonLink href={`/blog/${post.slug}`} variant="outline" className="text-xs">Читать статью</ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}