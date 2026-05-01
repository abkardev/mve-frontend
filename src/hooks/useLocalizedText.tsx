import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BilingualText } from '@/types';

// Get localized text from bilingual object
export function useLocalizedText() {
  const { language } = useLanguage();

  return (text: BilingualText | string | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[language] || text.en || '';
  };
}

// Component for bilingual text
interface BilingualTextProps {
  text: BilingualText | string | undefined;
  className?: string;
}

export function LocalizedText({ text, className }: BilingualTextProps) {
  const getLocalizedText = useLocalizedText();
  return <span className={className}>{getLocalizedText(text)}</span>;
}

export default LocalizedText;
