import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocalizedText } from '@/hooks/useLocalizedText';
import {
  Store,
  ShieldCheck,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Calendar,
  Package,
  Star,
} from 'lucide-react';

// Mock vendor data
const mockVendor = {
  id: '1',
  storeName: { en: 'TechPro Electronics', ar: 'تيك برو للإلكترونيات' },
  storeDescription: { 
    en: 'TechPro Electronics is a leading supplier of high-quality electronics and gadgets. We specialize in laptops, monitors, and computer accessories. With over 8 years of experience in the industry, we pride ourselves on providing excellent products and customer service.', 
    ar: 'تيك برو للإلكترونيات هي مورد رائد للإلكترونيات والأجهزة عالية الجودة. نحن متخصصون في أجهزة الكمبيوتر المحمولة والشاشات وإكسسوارات الكمبيوتر. مع أكثر من 8 سنوات من الخبرة في الصناعة، نفخر بتقديم منتجات وخدمة عملاء ممتازة.' 
  },
  slug: 'techpro-electronics',
  storeImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
  storeBanner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
  isVerified: true,
  responseRate: 98,
  responseTime: '< 24 hours',
  yearsInBusiness: 8,
  mainProducts: ['Laptops', 'Monitors', 'Keyboards', 'Mice', 'Cables'],
  address: { country: 'UAE', city: 'Dubai', street: 'Sheikh Zayed Road' },
  contact: { phone: '+971 4 123 4567', email: 'info@techpro.com', whatsapp: '+971501234567' },
  productCount: 150,
};

const mockProducts = [
  {
    id: '1',
    name: { en: 'Business Laptop Pro', ar: 'لابتوب الأعمال برو' },
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop',
    price: { min: 800, max: 1200, currency: 'USD' },
    moq: 10,
  },
  {
    id: '2',
    name: { en: '27" 4K Monitor', ar: 'شاشة 27 بوصة 4K' },
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop',
    price: { min: 350, max: 450, currency: 'USD' },
    moq: 20,
  },
  {
    id: '3',
    name: { en: 'Mechanical Keyboard', ar: 'لوحة مفاتيح ميكانيكية' },
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=200&fit=crop',
    price: { min: 80, max: 120, currency: 'USD' },
    moq: 50,
  },
  {
    id: '4',
    name: { en: 'Wireless Mouse', ar: 'فأرة لاسلكية' },
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop',
    price: { min: 25, max: 40, currency: 'USD' },
    moq: 100,
  },
];

export default function VendorStorePage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const getLocalizedText = useLocalizedText();
  const [activeTab, setActiveTab] = useState('products');

  const vendor = mockVendor; // In real app, fetch by slug

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-muted">
        <img
          src={vendor.storeBanner}
          alt="Store Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Store Info */}
      <div className="container relative -mt-16 md:-mt-20">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={vendor.storeImage} />
                  <AvatarFallback className="text-2xl">
                    {getLocalizedText(vendor.storeName).charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {getLocalizedText(vendor.storeName)}
                      </h1>
                      {vendor.isVerified && (
                        <Badge className="bg-accent">
                          <ShieldCheck className="h-3 w-3 me-1" />
                          {t('vendor.verified')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      {vendor.address.street}, {vendor.address.city}, {vendor.address.country}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{vendor.productCount} {t('vendor.products')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{vendor.responseRate}% {t('vendor.responseRate')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{vendor.yearsInBusiness} {t('vendor.yearsInBusiness')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/chat/new?vendor=${vendor.id}`}>
                      <Button className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {t('vendor.contactVendor')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="products">{t('vendor.products')}</TabsTrigger>
            <TabsTrigger value="about">{t('vendor.about')}</TabsTrigger>
            <TabsTrigger value="contact">{t('vendor.contact')}</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={getLocalizedText(product.name)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
                        {getLocalizedText(product.name)}
                      </h3>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-primary">
                          ${product.price.min} - ${product.price.max}
                        </span>
                        <span className="text-muted-foreground">
                          MOQ: {product.moq}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('vendor.about')}</h2>
                <p className="text-muted-foreground mb-6">
                  {getLocalizedText(vendor.storeDescription)}
                </p>
                <div>
                  <h3 className="font-medium mb-2">{t('vendor.mainProducts')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.mainProducts.map((product) => (
                      <Badge key={product} variant="outline">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('vendor.contact')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{vendor.contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{vendor.contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-medium">{vendor.contact.whatsapp}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
