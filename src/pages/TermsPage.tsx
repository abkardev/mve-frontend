import { useTranslation } from 'react-i18next';

const sectionCount = 9;

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">{t('pages.terms.title')}</h1>
        <p className="mb-10 text-sm text-muted-foreground">{t('pages.terms.lastUpdated')}</p>

        <div className="space-y-8">
          {Array.from({ length: sectionCount }).map((_, i) => (
            <section key={i}>
              <h2 className="mb-2 text-lg font-semibold">{t(`pages.terms.sections.${i}.title`)}</h2>
              <p className="text-muted-foreground leading-relaxed">{t(`pages.terms.sections.${i}.content`)}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
