import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Shield, Users, Zap } from 'lucide-react';

const valueIcons = [Globe, Shield, Zap, Users];

export default function AboutPage() {
  const { t } = useTranslation();

  const values = valueIcons.map((icon, i) => ({
    icon,
    title: t(`pages.about.values.${i}.title`),
    description: t(`pages.about.values.${i}.description`),
  }));

  const stats = [
    { label: t('pages.about.stats.vendors'), value: '500+' },
    { label: t('pages.about.stats.products'), value: '10K+' },
    { label: t('pages.about.stats.countries'), value: '30+' },
    { label: t('pages.about.stats.rfqs'), value: '2K+' },
  ];

  return (
    <div className="container py-12">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('pages.about.title')}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{t('pages.about.subtitle')}</p>
      </div>

      <div className="mx-auto mb-16 max-w-3xl rounded-2xl bg-primary/5 p-8 text-center">
        <h2 className="mb-3 text-xl font-semibold">{t('pages.about.missionTitle')}</h2>
        <p className="text-muted-foreground leading-relaxed">{t('pages.about.missionText')}</p>
      </div>

      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">{t('pages.about.valuesTitle')}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <Card key={v.title}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 text-center md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
