import { Check, X, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import { Card } from '@/components/ui/card';
import type { PlanFeatures } from '@/types/subscription';

type Row = {
  label: string;
  get: (f: PlanFeatures, commissionLabel: string) => string | boolean;
};

const rows: Row[] = [
  { label: 'Yearly price', get: (_f, _c) => '' }, // special-cased
  { label: 'Commission per transaction', get: (_f, c) => c },
  { label: 'Max product listings', get: (f) => f.maxProducts === -1 ? 'Unlimited' : `${f.maxProducts}` },
  { label: 'Storefront', get: (f) => ({ basic: 'Logo only', advanced: 'Logo + banners', custom: 'Full branding + custom layout' }[f.storefront]) },
  { label: 'Market access', get: (f) => ({ domestic: 'Domestic', domestic_international: 'Domestic + International', global_priority: 'Global with priority' }[f.marketAccess]) },
  { label: 'Search ranking', get: (f) => ({ low: 'Low', medium: 'Medium', high: 'Highest' }[f.searchRanking]) },
  { label: 'Featured placement', get: (f) => ({ none: false, paid_addon: 'Paid add-on', included: 'Included' }[f.featuredPlacement]) },
  { label: 'Verified badge', get: (f) => ({ none: false, paid_addon: 'Paid add-on', included: 'Included' }[f.verifiedBadge]) },
  { label: 'Buyer messaging', get: (f) => ({ limited: 'Limited (no files)', full: 'Full + file sharing', priority: 'Priority inbox' }[f.buyerMessaging]) },
  { label: 'Daily conversation limit', get: (f) => f.dailyConversationLimit === -1 ? 'Unlimited' : `${f.dailyConversationLimit}/day` },
  { label: 'Bulk order tools', get: (f) => ({ none: false, basic: 'Enabled', advanced: 'Advanced automation' }[f.bulkOrderTools]) },
  { label: 'Promotions & discounts', get: (f) => ({ none: false, basic: 'Enabled', advanced: 'Advanced campaigns' }[f.promotions]) },
  { label: 'Analytics', get: (f) => ({ basic: 'Orders only', advanced: 'Sales + conversion', full: 'Traffic, behavior, ROI' }[f.analytics]) },
  { label: 'API access (ERP)', get: (f) => f.apiAccess },
  { label: 'Multi-user accounts', get: (f) => f.multiUserAccounts },
  { label: 'Ads tools', get: (f) => ({ none: false, limited: 'Limited', full: 'Full access' }[f.adsTools]) },
  { label: 'Support', get: (f) => ({ standard: 'Standard 24h', priority: 'Priority 24h', vip: 'VIP + dedicated manager' }[f.support]) },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="h-4 w-4 text-success mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground mx-auto" />;
  if (!value) return <Minus className="h-4 w-4 text-muted-foreground mx-auto" />;
  return <span className="text-sm text-foreground">{value}</span>;
}

const valueKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export function FeatureComparisonTable() {
  const { t } = useTranslation();
  const tt = t as (key: string, options?: Record<string, unknown> | string) => string;
  return (
    <Card className="overflow-x-auto border-primary/10 shadow-md">
      <table className="w-full text-sm">
        <thead className="bg-primary/5">
          <tr>
            <th className="text-start p-4 font-semibold text-foreground">{tt('pricing.feature')}</th>
            {PLAN_ORDER.map((id) => (
              <th key={id} className="p-4 text-center font-semibold text-foreground">
                {tt(`pricing.plans.${id}`, PLANS[id].name)}
                {PLANS[id].badge && (
                  <span className="block text-xs font-normal text-primary mt-1">{tt(`pricing.badges.${PLANS[id].badge}`, PLANS[id].badge)}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              <td className="p-4 text-muted-foreground">{tt(`pricing.comparison.${row.label}`, row.label)}</td>
              {PLAN_ORDER.map((id) => {
                const p = PLANS[id];
                let val: string | boolean = '';
                if (row.label === 'Yearly price') val = `$${p.price.toLocaleString()}`;
                else val = row.get(p.features, p.commissionLabel);
                const localized = typeof val === 'string' ? tt(`pricing.values.${valueKey(val)}`, val) : val;
                return <td key={id} className="p-4 text-center"><Cell value={localized} /></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
