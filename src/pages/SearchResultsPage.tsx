import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AISearchBar } from '@/components/AISearchBar';
import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/types';

interface AISearchHit {
  _id: string;
  name: { en: string; ar?: string };
  vendor?: { _id: string; storeName?: { en: string } };
  price?: { min: number; currency: string };
  image?: string;
  matchReason?: string;
}

export default function SearchResultsPage() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<AISearchHit[]>([]);
  const [interpreted, setInterpreted] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    apiClient.post<ApiResponse<{ interpreted: { intent: string }; results: AISearchHit[] }>>('/search/ai', { query: q })
      .then((res) => {
        setResults(res.data.results || []);
        setInterpreted(res.data.interpreted?.intent || '');
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container py-8 space-y-6">
      <div className="max-w-2xl">
        <AISearchBar />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t('search.resultsFor', 'Results for')} "{q}"</h1>
        {interpreted && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Sparkles className="h-3 w-3 text-primary" /> {interpreted}
          </p>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : results.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">{t('search.noProducts', 'No products matched. Try different keywords.')}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((p) => (
            <Card key={p._id} className="overflow-hidden hover:shadow-md transition-shadow">
              {p.image && <img src={p.image} alt={p.name[i18n.language === 'ar' ? 'ar' : 'en'] || p.name.en} className="w-full h-40 object-cover" />}
              <CardContent className="p-4 space-y-1">
                <p className="font-semibold text-foreground">{p.name[i18n.language === 'ar' ? 'ar' : 'en'] || p.name.en}</p>
                {p.vendor?.storeName?.en && <p className="text-sm text-muted-foreground">{p.vendor.storeName.en}</p>}
                {p.price && <p className="text-sm font-medium">{p.price.currency} {p.price.min}</p>}
                {p.matchReason && <p className="text-xs text-primary mt-1">{p.matchReason}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
