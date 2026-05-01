import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  MessageCircle,
  Store,
  Package,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Mock stats based on role
  const buyerStats = [
    { label: 'Active RFQs', value: '5', icon: FileText, color: 'text-primary' },
    { label: 'Responses Received', value: '23', icon: MessageCircle, color: 'text-accent' },
    { label: 'Saved Vendors', value: '12', icon: Store, color: 'text-vendor' },
    { label: 'Orders', value: '8', icon: Package, color: 'text-success' },
  ];

  const vendorStats = [
    { label: 'Products Listed', value: '45', icon: Package, color: 'text-primary' },
    { label: 'RFQ Responses', value: '18', icon: FileText, color: 'text-accent' },
    { label: 'Messages', value: '32', icon: MessageCircle, color: 'text-vendor' },
    { label: 'Profile Views', value: '156', icon: TrendingUp, color: 'text-success' },
  ];

  const adminStats = [
    { label: 'Total Users', value: '2,456', icon: Users, color: 'text-primary' },
    { label: 'Active Vendors', value: '324', icon: Store, color: 'text-accent' },
    { label: 'RFQs This Month', value: '89', icon: FileText, color: 'text-vendor' },
    { label: 'Revenue', value: '$45.2K', icon: TrendingUp, color: 'text-success' },
  ];

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'vendor':
        return vendorStats;
      case 'admin':
        return adminStats;
      default:
        return buyerStats;
    }
  };

  const stats = getStatsForRole();
  const dashboardTitle = user?.role === 'vendor' 
    ? t('dashboard.vendor.title') 
    : user?.role === 'admin' 
    ? t('dashboard.admin.title') 
    : t('dashboard.buyer.title');

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">{dashboardTitle}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcome')}, {user?.name || 'User'}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Link to="/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Role-specific content */}
      {user?.role === 'user' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/rfq/create" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Post New RFQ
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/vendors" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Browse Vendors
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/chat" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    View Messages
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent RFQs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t('dashboard.buyer.myRfqs')}</CardTitle>
              <Link to="/rfq">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">RFQ #{i}: LED Monitors</p>
                      <p className="text-sm text-muted-foreground">3 responses • Open</p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === 'vendor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Product
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link to="/rfq" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Browse RFQs
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Inquiries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Inquiries</CardTitle>
              <Link to="/chat">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">Ahmed Mohamed</p>
                      <p className="text-sm text-muted-foreground">Interested in monitors</p>
                    </div>
                    <Button size="sm" variant="outline">Reply</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Verify Vendors
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Reports
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  'New vendor registration: TechPro',
                  'RFQ #45 closed with 5 responses',
                  'User complaint resolved',
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm">{activity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
