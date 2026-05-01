import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { UploadedFile } from '@/components/FileUpload';

const DRAFT_KEY = 'rfq_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds
const TOAST_DEBOUNCE = 5000; // Show toast at most every 5 seconds

export interface RfqDraftData {
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
  attachments: UploadedFile[];
  savedAt: string;
}

export function useRfqDraft() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastToastTimeRef = useRef<number>(0);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as RfqDraftData;
        setHasDraft(true);
        setLastSaved(new Date(parsed.savedAt));
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  const saveDraft = useCallback((data: Omit<RfqDraftData, 'savedAt'>, showToast = true) => {
    const draftData: RfqDraftData = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    setHasDraft(true);
    setLastSaved(new Date());
    setIsSaving(false);
    
    if (showToast) {
      toast({
        title: t('rfq.draft.saved'),
        description: t('rfq.draft.savedDescription'),
      });
    }
  }, [toast, t]);

  const loadDraft = useCallback((): RfqDraftData | null => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (!draft) return null;
    
    try {
      return JSON.parse(draft) as RfqDraftData;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setLastSaved(null);
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
  }, []);

  const scheduleAutoSave = useCallback((data: Omit<RfqDraftData, 'savedAt'>) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    setIsSaving(true);
    
    const timer = setTimeout(() => {
      saveDraft(data, false); // Silent save
      
      // Show toast with debounce to avoid spam
      const now = Date.now();
      if (now - lastToastTimeRef.current > TOAST_DEBOUNCE) {
        lastToastTimeRef.current = now;
        toast({
          title: t('rfq.draft.autoSaved'),
          description: t('rfq.draft.autoSavedDescription'),
          duration: 2000,
        });
      }
    }, AUTO_SAVE_DELAY);
    
    autoSaveTimerRef.current = timer;
  }, [saveDraft, toast, t]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    hasDraft,
    lastSaved,
    isSaving,
    saveDraft,
    loadDraft,
    clearDraft,
    scheduleAutoSave,
  };
}
