import { useTranslation } from 'react-i18next';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormStep {
  id: string;
  labelKey: string;
  isComplete: boolean;
  isActive: boolean;
  hasError?: boolean;
}

interface FormStepIndicatorProps {
  steps: FormStep[];
  onStepClick?: (stepId: string) => void;
}

export function FormStepIndicator({ steps, onStepClick }: FormStepIndicatorProps) {
  const { t } = useTranslation();
  const completedCount = steps.filter(s => s.isComplete).length;
  const errorCount = steps.filter(s => s.hasError).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-4 mb-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300 ease-out",
              errorCount > 0 ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {completedCount}/{steps.length} {t('rfq.form.sectionsComplete')}
          {errorCount > 0 && (
            <span className="text-destructive ms-2">
              ({errorCount} {t('rfq.form.errors')})
            </span>
          )}
        </span>
      </div>

      {/* Step indicators */}
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick?.(step.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              step.hasError
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : step.isComplete 
                  ? "bg-primary/10 border-primary/30 text-primary" 
                  : step.isActive
                    ? "bg-accent border-accent-foreground/20 text-accent-foreground"
                    : "bg-muted/50 border-border text-muted-foreground"
            )}
          >
            {step.hasError ? (
              <AlertCircle className="h-3 w-3" />
            ) : step.isComplete ? (
              <Check className="h-3 w-3" />
            ) : null}
            {t(step.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
