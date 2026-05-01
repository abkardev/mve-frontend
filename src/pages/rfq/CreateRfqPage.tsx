import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { RfqPreview } from '@/components/rfq/RfqPreview';
import { FormStepIndicator, FormStep } from '@/components/rfq/FormStepIndicator';
import { useRfqDraft, RfqDraftData } from '@/hooks/useRfqDraft';
import type { BilingualText } from '@/types';

interface Category {
  _id: string;
  name: BilingualText;
  slug?: string;
}

const createRfqSchema = z.object({
  titleEn: z.string().min(5, 'Title must be at least 5 characters').max(200),
  titleAr: z.string().optional(),
  descriptionEn: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  descriptionAr: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().optional(),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  currency: z.string().default('USD'),
  deadline: z.string().optional(),
  destinationPort: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).default([]),
}).refine((data) => {
  // Only validate if both values are provided
  if (data.budgetMin !== undefined && data.budgetMax !== undefined && 
      data.budgetMin > 0 && data.budgetMax > 0) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax'],
});

type CreateRfqFormData = z.infer<typeof createRfqSchema>;

const UNITS = ['pieces', 'kg', 'tons', 'meters', 'liters', 'boxes', 'pallets', 'containers'];
const CURRENCIES = ['USD', 'EUR', 'SAR', 'AED', 'EGP'];

export default function CreateRfqPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('title');
  const draftChecked = useRef(false);
  
  const { hasDraft, loadDraft, saveDraft, clearDraft, scheduleAutoSave, lastSaved, isSaving } = useRfqDraft();

  const form = useForm<CreateRfqFormData>({
    resolver: zodResolver(createRfqSchema),
    mode: 'onChange', // Enable inline validation as user types
    defaultValues: {
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
      categoryId: '',
      quantity: 1,
      unit: 'pieces',
      budgetMin: undefined,
      budgetMax: undefined,
      currency: 'USD',
      deadline: '',
      destinationPort: '',
      attachments: [],
    },
  });

  // Check for existing draft on mount
  useEffect(() => {
    if (!draftChecked.current && hasDraft) {
      draftChecked.current = true;
      setShowDraftDialog(true);
    }
  }, [hasDraft]);

  // Auto-save on form changes
  const formValues = form.watch();
  useEffect(() => {
    if (draftChecked.current) {
      scheduleAutoSave(formValues as Omit<RfqDraftData, 'savedAt'>);
    }
  }, [formValues, scheduleAutoSave]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<{ data: Category[] } | Category[]>('/category');
        const categoryData = Array.isArray(response) ? response : response.data;
        setCategories(categoryData || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: t('common.error'),
          description: t('rfq.form.categoriesError'),
          variant: 'destructive',
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [t, toast]);

  // Calculate form steps completion with error tracking
  const getFormSteps = (): FormStep[] => {
    const values = form.getValues();
    const errors = form.formState.errors;
    
    return [
      { 
        id: 'title', 
        labelKey: 'rfq.form.steps.title', 
        isComplete: !!values.titleEn && values.titleEn.length >= 5,
        isActive: activeSection === 'title',
        hasError: !!errors.titleEn || !!errors.titleAr
      },
      { 
        id: 'description', 
        labelKey: 'rfq.form.steps.description', 
        isComplete: !!values.descriptionEn && values.descriptionEn.length >= 20,
        isActive: activeSection === 'description',
        hasError: !!errors.descriptionEn || !!errors.descriptionAr
      },
      { 
        id: 'category', 
        labelKey: 'rfq.form.steps.category', 
        isComplete: !!values.categoryId,
        isActive: activeSection === 'category',
        hasError: !!errors.categoryId
      },
      { 
        id: 'quantity', 
        labelKey: 'rfq.form.steps.quantity', 
        isComplete: values.quantity >= 1,
        isActive: activeSection === 'quantity',
        hasError: !!errors.quantity || !!errors.unit
      },
      { 
        id: 'budget', 
        labelKey: 'rfq.form.steps.budget', 
        isComplete: !!(values.budgetMin || values.budgetMax),
        isActive: activeSection === 'budget',
        hasError: !!errors.budgetMin || !!errors.budgetMax
      },
      { 
        id: 'deadline', 
        labelKey: 'rfq.form.steps.deadline', 
        isComplete: !!values.deadline,
        isActive: activeSection === 'deadline',
        hasError: !!errors.deadline
      },
      { 
        id: 'shipping', 
        labelKey: 'rfq.form.steps.shipping', 
        isComplete: !!values.destinationPort,
        isActive: activeSection === 'shipping',
        hasError: !!errors.destinationPort
      },
      { 
        id: 'attachments', 
        labelKey: 'rfq.form.steps.attachments', 
        isComplete: (values.attachments?.length || 0) > 0,
        isActive: activeSection === 'attachments',
        hasError: !!errors.attachments
      },
    ];
  };

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      form.reset({
        titleEn: draft.titleEn || '',
        titleAr: draft.titleAr || '',
        descriptionEn: draft.descriptionEn || '',
        descriptionAr: draft.descriptionAr || '',
        categoryId: draft.categoryId || '',
        quantity: draft.quantity || 1,
        unit: draft.unit || 'pieces',
        budgetMin: draft.budgetMin,
        budgetMax: draft.budgetMax,
        currency: draft.currency || 'USD',
        deadline: draft.deadline || '',
        destinationPort: draft.destinationPort || '',
        attachments: draft.attachments || [],
      });
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
    draftChecked.current = true;
  };

  const handleSaveDraft = () => {
    saveDraft(form.getValues() as Omit<RfqDraftData, 'savedAt'>);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getLocalizedCategoryName = (category: Category): string => {
    return category.name[language] || category.name.en || '';
  };

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    const data = form.getValues();
    setIsSubmitting(true);
    try {
      const payload = {
        title: {
          en: data.titleEn,
          ar: data.titleAr || data.titleEn,
        },
        description: {
          en: data.descriptionEn,
          ar: data.descriptionAr || data.descriptionEn,
        },
        categoryId: data.categoryId,
        quantity: data.quantity,
        unit: data.unit,
        budget: data.budgetMin || data.budgetMax ? {
          min: data.budgetMin,
          max: data.budgetMax,
          currency: data.currency,
        } : undefined,
        deadline: data.deadline || undefined,
        destinationPort: data.destinationPort || undefined,
        attachments: data.attachments?.map(f => f.url) || [],
      };

      await apiClient.post('/announcement', payload);
      
      // Clear draft after successful submission
      clearDraft();

      toast({
        title: t('rfq.createSuccess'),
        description: t('rfq.createSuccessDesc'),
      });

      navigate('/rfq');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('rfq.createError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show preview mode
  if (showPreview) {
    return (
      <div className="container max-w-3xl py-8">
        <Button
          variant="ghost"
          onClick={() => setShowPreview(false)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          {t('common.back')}
        </Button>

        <RfqPreview
          data={{
            titleEn: form.getValues('titleEn'),
            titleAr: form.getValues('titleAr'),
            descriptionEn: form.getValues('descriptionEn'),
            descriptionAr: form.getValues('descriptionAr'),
            categoryId: form.getValues('categoryId'),
            quantity: form.getValues('quantity'),
            unit: form.getValues('unit'),
            budgetMin: form.getValues('budgetMin'),
            budgetMax: form.getValues('budgetMax'),
            currency: form.getValues('currency'),
            deadline: form.getValues('deadline'),
            destinationPort: form.getValues('destinationPort'),
            attachments: (form.getValues('attachments') || []) as UploadedFile[],
          }}
          categories={categories}
          onBack={() => setShowPreview(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      {/* Draft Dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('rfq.draft.found')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('rfq.draft.foundDescription')}
              {lastSaved && (
                <span className="block mt-2 text-xs">
                  {t('rfq.draft.lastSaved')}: {lastSaved.toLocaleString()}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              {t('rfq.draft.discard')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadDraft}>
              {t('rfq.draft.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="ghost"
        onClick={() => navigate('/rfq')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 me-2" />
        {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('rfq.createTitle')}</CardTitle>
              <CardDescription>{t('rfq.createDescription')}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Auto-save status indicator */}
              {isSaving && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t('rfq.draft.saving')}
                </span>
              )}
              {!isSaving && lastSaved && (
                <span className="text-xs text-muted-foreground">
                  {t('rfq.draft.lastSaved')}: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="gap-2"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                {t('rfq.draft.saveDraft')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <FormStepIndicator 
            steps={getFormSteps()} 
            onStepClick={scrollToSection}
          />

          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* Title Fields */}
              <div id="section-title" className="space-y-4 scroll-mt-4" onFocus={() => setActiveSection('title')}>
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.titleEn')} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('rfq.form.titlePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="titleAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.titleAr')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('rfq.form.titleArPlaceholder')}
                          dir="rtl"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('rfq.form.optionalArabic')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Fields */}
              <div id="section-description" className="space-y-4 scroll-mt-4" onFocus={() => setActiveSection('description')}>
                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.descriptionEn')} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('rfq.form.descriptionPlaceholder')}
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.descriptionAr')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('rfq.form.descriptionArPlaceholder')}
                          className="min-h-[120px]"
                          dir="rtl"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('rfq.form.optionalArabic')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category Selection */}
              <div id="section-category" className="scroll-mt-4" onFocus={() => setActiveSection('category')}>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.category')} *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isLoadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingCategories 
                                ? t('common.loading') 
                                : t('rfq.form.selectCategory')
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {getLocalizedCategoryName(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantity and Unit */}
              <div id="section-quantity" className="grid grid-cols-2 gap-4 scroll-mt-4" onFocus={() => setActiveSection('quantity')}>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.quantity')} *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.unit')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('rfq.form.selectUnit')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {t(`units.${unit}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget */}
              <div id="section-budget" className="space-y-4 scroll-mt-4" onFocus={() => setActiveSection('budget')}>
                <FormLabel>{t('rfq.form.budget')}</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="budgetMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder={t('rfq.form.minBudget')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder={t('rfq.form.maxBudget')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormDescription>{t('rfq.form.budgetDescription')}</FormDescription>
              </div>

              {/* Deadline */}
              <div id="section-deadline" className="scroll-mt-4" onFocus={() => setActiveSection('deadline')}>
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.deadline')}</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('rfq.form.deadlineDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Destination Port */}
              <div id="section-shipping" className="scroll-mt-4" onFocus={() => setActiveSection('shipping')}>
                <FormField
                  control={form.control}
                  name="destinationPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.destinationPort')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('rfq.form.destinationPortPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('rfq.form.destinationPortDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Attachments */}
              <div id="section-attachments" className="scroll-mt-4" onFocus={() => setActiveSection('attachments')}>
                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rfq.form.attachments')}</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={(field.value || []) as UploadedFile[]}
                          onChange={field.onChange}
                          maxFiles={5}
                          maxSizeMB={10}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>{t('rfq.form.attachmentsDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/rfq')}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 me-2" />
                  {t('rfq.preview.showPreview')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
