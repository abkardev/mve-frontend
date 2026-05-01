import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: t('pages.contact.messageSent'), description: t('pages.contact.messageSentDesc') });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  const contactInfo = [
    { icon: Mail, label: t('pages.contact.email'), value: 'support@b2bmarket.com' },
    { icon: Phone, label: t('pages.contact.phone'), value: '+966 11 000 0000' },
    { icon: MapPin, label: t('pages.contact.address'), value: t('pages.contact.addressValue') },
  ];

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('pages.contact.title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t('pages.contact.subtitle')}</p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        <div className="space-y-6">
          {contactInfo.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('pages.contact.formTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('pages.contact.nameLabel')}</Label>
                  <Input id="name" required placeholder={t('pages.contact.namePlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('pages.contact.emailLabel')}</Label>
                  <Input id="email" type="email" required placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{t('pages.contact.subjectLabel')}</Label>
                <Input id="subject" required placeholder={t('pages.contact.subjectPlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('pages.contact.messageLabel')}</Label>
                <Textarea id="message" required rows={5} placeholder={t('pages.contact.messagePlaceholder')} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? t('pages.contact.sending') : t('pages.contact.sendMessage')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
