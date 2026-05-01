import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Store,
  FileText,
  MessageCircle,
  ShieldCheck,
  Globe2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

// Mock data for demo
const featuredVendors = [
  {
    id: '1',
    name: 'TechPro Electronics',
    nameAr: 'تيك برو للإلكترونيات',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
    category: 'Electronics',
    verified: true,
    productCount: 150,
  },
  {
    id: '2',
    name: 'Global Textiles',
    nameAr: 'النسيج العالمي',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=200&fit=crop',
    category: 'Textiles',
    verified: true,
    productCount: 89,
  },
  {
    id: '3',
    name: 'Industrial Solutions',
    nameAr: 'الحلول الصناعية',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop',
    category: 'Machinery',
    verified: false,
    productCount: 45,
  },
  {
    id: '4',
    name: 'Fresh Foods Co',
    nameAr: 'شركة الأطعمة الطازجة',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop',
    category: 'Food & Beverage',
    verified: true,
    productCount: 200,
  },
];

const categories = [
  { name: 'Electronics', nameAr: 'إلكترونيات', icon: '💻', count: 2500 },
  { name: 'Textiles', nameAr: 'نسيج', icon: '🧵', count: 1800 },
  { name: 'Machinery', nameAr: 'آلات', icon: '⚙️', count: 1200 },
  { name: 'Food & Beverage', nameAr: 'أغذية ومشروبات', icon: '🍎', count: 3000 },
  { name: 'Chemicals', nameAr: 'كيماويات', icon: '🧪', count: 800 },
  { name: 'Construction', nameAr: 'بناء', icon: '🏗️', count: 950 },
];

const latestRfqs = [
  {
    id: '1',
    title: 'Bulk Order: LED Monitors',
    titleAr: 'طلب جملة: شاشات LED',
    quantity: '500 units',
    budget: '$15,000 - $20,000',
    deadline: '2024-02-15',
    status: 'open',
  },
  {
    id: '2',
    title: 'Cotton Fabric Supplier Needed',
    titleAr: 'مطلوب مورد قماش قطني',
    quantity: '10,000 meters',
    budget: '$5,000 - $8,000',
    deadline: '2024-02-20',
    status: 'open',
  },
  {
    id: '3',
    title: 'Industrial Packaging Materials',
    titleAr: 'مواد تغليف صناعية',
    quantity: '2,000 boxes',
    budget: '$3,000 - $4,500',
    deadline: '2024-02-18',
    status: 'open',
  },
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-32">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('home.hero.title')}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              {t('home.hero.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('home.hero.searchPlaceholder')}
                  className="h-14 ps-12 text-lg"
                />
              </div>
              <Button size="lg" className="h-14 px-8 text-lg">
                {t('common.search')}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Vendors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 end-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Verified Vendors</h3>
                <p className="text-sm text-muted-foreground">
                  All suppliers are verified for quality
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Globe2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Global Network</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with suppliers worldwide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Trade</h3>
                <p className="text-sm text-muted-foreground">
                  Safe and transparent transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('home.categories')}</h2>
            <Link to="/categories">
              <Button variant="ghost" className="gap-2">
                {t('home.viewAll')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/categories/${category.name.toLowerCase()}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <span className="text-4xl mb-3">{category.icon}</span>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {isArabic ? category.nameAr : category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.count.toLocaleString()} products
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('home.featuredVendors')}</h2>
            <Link to="/vendors">
              <Button variant="ghost" className="gap-2">
                {t('home.viewAll')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/vendors/${vendor.id}`}>
                  <Card className="group overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {isArabic ? vendor.nameAr : vendor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {vendor.category}
                          </p>
                        </div>
                        {vendor.verified && (
                          <Badge variant="secondary" className="shrink-0">
                            <ShieldCheck className="h-3 w-3 me-1" />
                            {t('vendor.verified')}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Store className="h-4 w-4" />
                        {vendor.productCount} products
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest RFQs */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('home.latestRfqs')}</h2>
            <Link to="/rfq">
              <Button variant="ghost" className="gap-2">
                {t('home.viewAll')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {latestRfqs.map((rfq, index) => (
              <motion.div
                key={rfq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/rfq/${rfq.id}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <h3 className="font-semibold">
                          {isArabic ? rfq.titleAr : rfq.title}
                        </h3>
                        <Badge variant="default" className="shrink-0 bg-success">
                          {t(`rfq.status.${rfq.status}`)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('rfq.quantity')}:</span>
                          <span>{rfq.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('rfq.budget')}:</span>
                          <span>{rfq.budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('rfq.deadline')}:</span>
                          <span>{rfq.deadline}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {t('rfq.respond')}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already trading on our platform. 
            Start buying or selling today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                <Store className="h-5 w-5" />
                {t('auth.sellProducts')}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 hover:bg-primary-foreground/10">
                <FileText className="h-5 w-5" />
                {t('auth.buyProducts')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
