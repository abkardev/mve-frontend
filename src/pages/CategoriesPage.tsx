import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  Cpu, Shirt, Wrench, Pill, Apple, Car, Building2, Droplets,
  Lightbulb, Package, Gem, Leaf, Layers,
} from 'lucide-react';
import { useLocalizedText } from '@/hooks/useLocalizedText';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  electronics: Cpu,
  textiles: Shirt,
  machinery: Wrench,
  health: Pill,
  food: Apple,
  automotive: Car,
  construction: Building2,
  chemicals: Droplets,
  energy: Lightbulb,
  packaging: Package,
  jewelry: Gem,
  environment: Leaf,
};

interface Category {
  _id: string;
  name: { en: string; ar: string };
  slug: string;
  productCount?: number;
}

export default function CategoriesPage() {
  const { t } = useTranslation();
  const getLocalizedText = useLocalizedText();

  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient.get<Category[]>('/category'),
  });

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('pages.categories.title')}</h1>
        <p className="mt-3 text-muted-foreground">{t('pages.categories.subtitle')}</p>
      </div>

      {isLoading && (
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col items-center p-6">
                <Skeleton className="mb-3 h-14 w-14 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <p className="text-center text-destructive">{t('common.error')}</p>
      )}

      {categories && (
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.slug] || Layers;
            return (
              <Link key={cat._id} to={`/vendors?category=${cat.slug}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold">{getLocalizedText(cat.name)}</h3>
                    {cat.productCount !== undefined && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cat.productCount.toLocaleString()} {t('pages.categories.products')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
