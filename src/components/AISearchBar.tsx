import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types';

interface AISearchHit {
  _id: string;
  name: { en: string; ar?: string };
  vendor?: { _id: string; storeName?: { en: string } };
  price?: { min: number; currency: string };
  image?: string;
  matchReason?: string;
}

interface AISearchResponse {
  interpreted: { intent: string; filters: Record<string, unknown> };
  results: AISearchHit[];
}

interface AISearchBarProps {
  className?: string;
  compact?: boolean;
}

export function AISearchBar({ className, compact }: AISearchBarProps) {
  const { i18n } = useTranslation();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AISearchResponse | null>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim() || q.trim().length < 3) { setData(null); setLoading(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.post<ApiResponse<AISearchResponse>>('/search/ai', { query: q.trim() });
        setData(res.data);
        setOpen(true);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  const submit = () => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Sparkles className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => data && setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={compact ? 'Ask AI to find products…' : 'Try: "high-quality leather bags from Turkey under $50"'}
          className="h-10 border-input bg-card ps-10 pe-10 text-foreground shadow-sm focus-visible:ring-primary"
        />
        {loading ? (
          <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : q ? (
          <button
            type="button"
            onClick={() => { setQ(''); setData(null); setOpen(false); }}
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Clear"
          ><X className="h-4 w-4" /></button>
        ) : null}
      </div>

      {open && data && (
        <Card className="absolute mt-2 w-full max-h-96 overflow-y-auto shadow-lg z-50">
          {data.interpreted?.intent && (
            <div className="px-4 py-2 border-b bg-muted/40 text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> AI understood: {data.interpreted.intent}
            </div>
          )}
          {data.results.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No matches. Press Enter to search the full catalog.
            </div>
          ) : (
            <ul className="divide-y">
              {data.results.slice(0, 8).map((hit) => (
                <li key={hit._id}>
                  <button
                    type="button"
                    onClick={() => { navigate(`/products/${hit._id}`); setOpen(false); }}
                    className="w-full text-start p-3 hover:bg-muted/50 flex items-start gap-3"
                  >
                    {hit.image && <img src={hit.image} alt="" className="h-12 w-12 rounded object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{hit.name[i18n.language === 'ar' ? 'ar' : 'en'] || hit.name.en}</p>
                      {hit.vendor?.storeName?.en && (
                        <p className="text-xs text-muted-foreground truncate">by {hit.vendor.storeName.en}</p>
                      )}
                      {hit.matchReason && (
                        <p className="text-xs text-primary mt-0.5 truncate">{hit.matchReason}</p>
                      )}
                    </div>
                    {hit.price && (
                      <p className="text-sm font-semibold text-foreground">
                        {hit.price.currency} {hit.price.min}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t p-2">
            <Button variant="ghost" className="w-full justify-start" onClick={submit}>
              <Search className="mr-2 h-4 w-4" /> See all results for "{q}"
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AISearchBar;
