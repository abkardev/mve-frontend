import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalizedText } from '@/hooks/useLocalizedText';
import {
  Search,
  Store,
  ShieldCheck,
  MapPin,
  MessageCircle,
  Grid,
  List,
} from 'lucide-react';

// Mock vendors data
const mockVendors = [
  {
    id: '1',
    storeName: { en: 'TechPro Electronics', ar: 'تيك برو للإلكترونيات' },
    storeDescription: { en: 'Leading supplier of electronics and gadgets', ar: 'مورد رائد للإلكترونيات والأجهزة' },
    slug: 'techpro-electronics',
    storeImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
    isVerified: true,
    responseRate: 98,
    yearsInBusiness: 8,
    mainProducts: ['Laptops', 'Monitors', 'Accessories'],
    address: { country: 'UAE', city: 'Dubai' },
    productCount: 150,
  },
  {
    id: '2',
    storeName: { en: 'Global Textiles', ar: 'النسيج العالمي' },
    storeDescription: { en: 'Quality fabrics and textiles for all needs', ar: 'أقمشة ونسيج عالي الجودة لجميع الاحتياجات' },
    slug: 'global-textiles',
    storeImage: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=200&fit=crop',
    isVerified: true,
    responseRate: 95,
    yearsInBusiness: 12,
    mainProducts: ['Cotton', 'Silk', 'Polyester'],
    address: { country: 'Egypt', city: 'Cairo' },
    productCount: 89,
  },
  {
    id: '3',
    storeName: { en: 'Industrial Solutions', ar: 'الحلول الصناعية' },
    storeDescription: { en: 'Industrial machinery and equipment', ar: 'الآلات والمعدات الصناعية' },
    slug: 'industrial-solutions',
    storeImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop',
    isVerified: false,
    responseRate: 88,
    yearsInBusiness: 5,
    mainProducts: ['Machinery', 'Tools', 'Equipment'],
    address: { country: 'Saudi Arabia', city: 'Riyadh' },
    productCount: 45,
  },
  {
    id: '4',
    storeName: { en: 'Fresh Foods Co', ar: 'شركة الأطعمة الطازجة' },
    storeDescription: { en: 'Premium food products and ingredients', ar: 'منتجات غذائية ومكونات ممتازة' },
    slug: 'fresh-foods',
    storeImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop',
    isVerified: true,
    responseRate: 92,
    yearsInBusiness: 15,
    mainProducts: ['Fruits', 'Vegetables', 'Dairy'],
    address: { country: 'Jordan', city: 'Amman' },
    productCount: 200,
  },
  {
    id: '5',
    storeName: { en: 'ChemTech Industries', ar: 'كيمتك للصناعات' },
    storeDescription: { en: 'Chemical products and raw materials', ar: 'منتجات كيميائية ومواد خام' },
    slug: 'chemtech',
    storeImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&h=200&fit=crop',
    isVerified: true,
    responseRate: 90,
    yearsInBusiness: 10,
    mainProducts: ['Chemicals', 'Solvents', 'Compounds'],
    address: { country: 'Kuwait', city: 'Kuwait City' },
    productCount: 78,
  },
  {
    id: '6',
    storeName: { en: 'BuildRight Materials', ar: 'مواد البناء الصحيح' },
    storeDescription: { en: 'Construction materials and supplies', ar: 'مواد ولوازم البناء' },
    slug: 'buildright',
    storeImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
    isVerified: false,
    responseRate: 85,
    yearsInBusiness: 7,
    mainProducts: ['Cement', 'Steel', 'Tiles'],
    address: { country: 'Bahrain', city: 'Manama' },
    productCount: 120,
  },
];

export default function VendorsPage() {
  const { t } = useTranslation();
  const getLocalizedText = useLocalizedText();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('nav.vendors')}</h1>
        <p className="text-muted-foreground">
          Discover verified suppliers and manufacturers
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vendors..."
            className="ps-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="textiles">Textiles</SelectItem>
            <SelectItem value="machinery">Machinery</SelectItem>
            <SelectItem value="food">Food & Beverage</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="uae">UAE</SelectItem>
            <SelectItem value="saudi">Saudi Arabia</SelectItem>
            <SelectItem value="egypt">Egypt</SelectItem>
            <SelectItem value="jordan">Jordan</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vendors Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'flex flex-col gap-4'
      }>
        {mockVendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/vendors/${vendor.slug}`}>
              <Card className={`group overflow-hidden transition-all hover:shadow-lg ${
                viewMode === 'list' ? 'flex flex-row' : ''
              }`}>
                <div className={`overflow-hidden ${
                  viewMode === 'list' ? 'w-48 shrink-0' : 'aspect-video'
                }`}>
                  <img
                    src={vendor.storeImage}
                    alt={getLocalizedText(vendor.storeName)}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {getLocalizedText(vendor.storeName)}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {vendor.address.city}, {vendor.address.country}
                      </div>
                    </div>
                    {vendor.isVerified && (
                      <Badge variant="secondary" className="shrink-0">
                        <ShieldCheck className="h-3 w-3 me-1" />
                        {t('vendor.verified')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {getLocalizedText(vendor.storeDescription)}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {vendor.mainProducts.slice(0, 3).map((product) => (
                      <Badge key={product} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        {vendor.productCount}
                      </span>
                      <span>{vendor.responseRate}% response</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {t('vendor.contact')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
