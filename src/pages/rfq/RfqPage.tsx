import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizedText } from '@/hooks/useLocalizedText';
import {
  Plus,
  Search,
  MessageCircle,
  Calendar,
  DollarSign,
  Package,
  Clock,
  User,
} from 'lucide-react';

// Mock RFQ data
const mockRfqs = [
  {
    id: '1',
    title: { en: 'Bulk Order: LED Monitors', ar: 'طلب جملة: شاشات LED' },
    description: { en: 'Looking for 27-inch 4K LED monitors for office use. Must support HDMI and DisplayPort.', ar: 'أبحث عن شاشات LED بحجم 27 بوصة ودقة 4K للاستخدام المكتبي. يجب أن تدعم HDMI و DisplayPort.' },
    buyer: { name: 'Ahmed Mohamed', avatar: '' },
    quantity: 500,
    unit: 'units',
    budget: { min: 15000, max: 20000, currency: 'USD' },
    deadline: '2024-02-15',
    status: 'open',
    responses: 12,
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    title: { en: 'Cotton Fabric Supplier Needed', ar: 'مطلوب مورد قماش قطني' },
    description: { en: 'Need premium quality cotton fabric for clothing manufacturing. Various colors required.', ar: 'نحتاج قماش قطني عالي الجودة لتصنيع الملابس. مطلوب ألوان متنوعة.' },
    buyer: { name: 'Sara Ali', avatar: '' },
    quantity: 10000,
    unit: 'meters',
    budget: { min: 5000, max: 8000, currency: 'USD' },
    deadline: '2024-02-20',
    status: 'open',
    responses: 8,
    createdAt: '2024-01-22',
  },
  {
    id: '3',
    title: { en: 'Industrial Packaging Materials', ar: 'مواد تغليف صناعية' },
    description: { en: 'Seeking corrugated cardboard boxes in various sizes for shipping products.', ar: 'أبحث عن صناديق كرتون مموج بأحجام مختلفة لشحن المنتجات.' },
    buyer: { name: 'Omar Hassan', avatar: '' },
    quantity: 2000,
    unit: 'boxes',
    budget: { min: 3000, max: 4500, currency: 'USD' },
    deadline: '2024-02-18',
    status: 'open',
    responses: 5,
    createdAt: '2024-01-25',
  },
  {
    id: '4',
    title: { en: 'Office Furniture Set', ar: 'طقم أثاث مكتبي' },
    description: { en: 'Complete office furniture including desks, chairs, and filing cabinets for new office.', ar: 'أثاث مكتبي كامل يشمل مكاتب وكراسي وخزائن ملفات لمكتب جديد.' },
    buyer: { name: 'Fatima Khalid', avatar: '' },
    quantity: 50,
    unit: 'sets',
    budget: { min: 25000, max: 35000, currency: 'USD' },
    deadline: '2024-03-01',
    status: 'open',
    responses: 3,
    createdAt: '2024-01-28',
  },
];

export default function RfqPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const getLocalizedText = useLocalizedText();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('rfq.title')}</h1>
          <p className="text-muted-foreground">
            Find buyers looking for products or post your requirements
          </p>
        </div>
        {isAuthenticated && user?.role === 'user' && (
          <Link to="/rfq/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('rfq.createRfq')}
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="browse">{t('rfq.browseRfqs')}</TabsTrigger>
          {isAuthenticated && (
            <TabsTrigger value="my">{t('rfq.myRfqs')}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search RFQs..."
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
              </SelectContent>
            </Select>
            <Select defaultValue="open">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">{t('rfq.status.open')}</SelectItem>
                <SelectItem value="in_progress">{t('rfq.status.in_progress')}</SelectItem>
                <SelectItem value="closed">{t('rfq.status.closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* RFQ List */}
          <div className="space-y-4">
            {mockRfqs.map((rfq, index) => (
              <motion.div
                key={rfq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link to={`/rfq/${rfq.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {getLocalizedText(rfq.title)}
                            </h3>
                          </Link>
                          <Badge className={getStatusColor(rfq.status)}>
                            {t(`rfq.status.${rfq.status}`)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {getLocalizedText(rfq.description)}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-4 w-4" />
                            {rfq.buyer.name}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            {rfq.quantity} {rfq.unit}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            ${rfq.budget.min.toLocaleString()} - ${rfq.budget.max.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {rfq.deadline}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                        <div className="text-center px-4 py-2 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">{rfq.responses}</div>
                          <div className="text-xs text-muted-foreground">{t('rfq.responses')}</div>
                        </div>
                        {isAuthenticated && user?.role === 'vendor' && (
                          <Link to={`/rfq/${rfq.id}`}>
                            <Button variant="outline" className="w-full gap-2">
                              <MessageCircle className="h-4 w-4" />
                              {t('rfq.respond')}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {mockRfqs.slice(0, 2).map((rfq, index) => (
            <motion.div
              key={rfq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="mb-4"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{getLocalizedText(rfq.title)}</h3>
                        <Badge className={getStatusColor(rfq.status)}>
                          {t(`rfq.status.${rfq.status}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rfq.responses} responses received
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Created {rfq.createdAt}
                      </div>
                    </div>
                    <Link to={`/rfq/${rfq.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
