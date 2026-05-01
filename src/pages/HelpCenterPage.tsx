import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, MessageSquare, ShieldCheck, Truck, CreditCard, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const faqCategoryKeys = [
  { icon: Users, key: 'gettingStarted', faqCount: 3 },
  { icon: MessageSquare, key: 'rfq', faqCount: 3 },
  { icon: ShieldCheck, key: 'trust', faqCount: 2 },
  { icon: Truck, key: 'shipping', faqCount: 2 },
  { icon: CreditCard, key: 'payments', faqCount: 2 },
];

export default function HelpCenterPage() {
  const { t } = useTranslation();

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('pages.help.title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t('pages.help.subtitle')}</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {faqCategoryKeys.map((category) => (
          <Card key={category.key}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <category.icon className="h-5 w-5 text-primary" />
                {t(`pages.help.faq.${category.key}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {Array.from({ length: category.faqCount }).map((_, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-sm">
                      {t(`pages.help.faq.${category.key}.q${i + 1}`)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t(`pages.help.faq.${category.key}.a${i + 1}`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-md text-center">
        <p className="mb-4 text-muted-foreground">{t('pages.help.stillNeedHelp')}</p>
        <Button asChild>
          <Link to="/contact">{t('footer.contact')}</Link>
        </Button>
      </div>
    </div>
  );
}
