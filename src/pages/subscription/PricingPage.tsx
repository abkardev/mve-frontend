import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PLANS, PLAN_ORDER, commissionSavings } from '@/lib/plans';
import { PlanCard } from '@/components/subscription/PlanCard';
import { FeatureComparisonTable } from '@/components/subscription/FeatureComparisonTable';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Zap } from 'lucide-react';

export default function PricingPage() {
  const { t } = useTranslation();
  const { planType: currentPlan } = useSubscription();
  const savingsExample = commissionSavings('starter', 'growth', 100000);

  return (
    <div className="container mx-auto py-10 md:py-12 space-y-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto space-y-4 rounded-lg border border-primary/10 bg-card/70 px-5 py-8 shadow-sm"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {t('pricing.title', 'Plans built for growing B2B sellers')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('pricing.subtitle',
            'Lower commission, higher visibility, more powerful tools as you grow. Cancel anytime.')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('pricing.paymentMethods', 'Payment methods: Visa, MasterCard, bank transfer')}
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-4 py-1.5 text-sm font-medium">
          <TrendingUp className="h-4 w-4" />
          {t('pricing.savings', { amount: savingsExample.toLocaleString() })}
        </div>
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {PLAN_ORDER.map((id, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <PlanCard plan={PLANS[id]} currentPlan={currentPlan} />
          </motion.div>
        ))}
      </div>

      {/* Trust strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: t('pricing.trust.secure.title'), desc: t('pricing.trust.secure.desc') },
          { icon: Zap, title: t('pricing.trust.cancel.title'), desc: t('pricing.trust.cancel.desc') },
          { icon: TrendingUp, title: t('pricing.trust.commission.title'), desc: t('pricing.trust.commission.desc') },
        ].map((b, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-start gap-3">
              <b.icon className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t('pricing.compare', 'Compare features')}</h2>
        <FeatureComparisonTable />
      </div>
    </div>
  );
}
