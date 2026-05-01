import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, Calendar, Package, DollarSign, FileText, Tag, Anchor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BilingualText } from '@/types';

interface Category {
  _id: string;
  name: BilingualText;
}

interface RfqPreviewData {
  titleEn: string;
  titleAr?: string;
  descriptionEn: string;
  descriptionAr?: string;
  categoryId: string;
  quantity: number;
  unit?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  deadline?: string;
  destinationPort?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

interface RfqPreviewProps {
  data: RfqPreviewData;
  categories: Category[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function RfqPreview({ data, categories, onBack, onSubmit, isSubmitting }: RfqPreviewProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const selectedCategory = categories.find(c => c._id === data.categoryId);
  const categoryName = selectedCategory 
    ? (selectedCategory.name[language] || selectedCategory.name.en || '') 
    : '';

  const formatBudget = () => {
    if (!data.budgetMin && !data.budgetMax) return null;
    const min = data.budgetMin?.toLocaleString();
    const max = data.budgetMax?.toLocaleString();
    if (min && max) return `${min} - ${max} ${data.currency}`;
    if (min) return `${t('rfq.form.minBudget')}: ${min} ${data.currency}`;
    if (max) return `${t('rfq.form.maxBudget')}: ${max} ${data.currency}`;
    return null;
  };

  const formatDeadline = () => {
    if (!data.deadline) return null;
    return new Date(data.deadline).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{t('rfq.preview.title')}</CardTitle>
            <Badge variant="outline">{t('rfq.preview.draft')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{data.titleEn}</h3>
            {data.titleAr && (
              <p className="text-muted-foreground" dir="rtl">{data.titleAr}</p>
            )}
          </div>

          <Separator />

          {/* Description Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              {t('rfq.description')}
            </div>
            <p className="text-sm leading-relaxed">{data.descriptionEn}</p>
            {data.descriptionAr && (
              <p className="text-sm leading-relaxed text-muted-foreground" dir="rtl">
                {data.descriptionAr}
              </p>
            )}
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('rfq.category')}</p>
                <p className="font-medium">{categoryName || '-'}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('rfq.quantity')}</p>
                <p className="font-medium">
                  {data.quantity} {data.unit && t(`units.${data.unit}`)}
                </p>
              </div>
            </div>

            {/* Budget */}
            {formatBudget() && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('rfq.budget')}</p>
                  <p className="font-medium">{formatBudget()}</p>
                </div>
              </div>
            )}

            {/* Deadline */}
            {formatDeadline() && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('rfq.deadline')}</p>
                  <p className="font-medium">{formatDeadline()}</p>
                </div>
              </div>
            )}

            {/* Destination Port */}
            {data.destinationPort && (
              <div className="flex items-start gap-3">
                <Anchor className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('rfq.destinationPort')}</p>
                  <p className="font-medium">{data.destinationPort}</p>
                </div>
              </div>
            )}
          </div>

          {/* Attachments */}
          {data.attachments && data.attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{t('rfq.attachments')}</p>
                <div className="flex flex-wrap gap-2">
                  {data.attachments.map((file) => (
                    <Badge key={file.id} variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {file.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          {t('rfq.preview.backToEdit')}
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 me-2 border-2 border-current border-t-transparent rounded-full" />
              {t('common.loading')}
            </span>
          ) : (
            <>
              <Send className="h-4 w-4 me-2" />
              {t('rfq.preview.confirm')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
