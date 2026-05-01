import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VendorsPage from "@/pages/vendors/VendorsPage";
import VendorStorePage from "@/pages/vendors/VendorStorePage";
import RfqPage from "@/pages/rfq/RfqPage";
import CreateRfqPage from "@/pages/rfq/CreateRfqPage";
import ChatPage from "@/pages/chat/ChatPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import NotFound from "@/pages/NotFound";
import HelpCenterPage from "@/pages/HelpCenterPage";
import ContactPage from "@/pages/ContactPage";
import AboutPage from "@/pages/AboutPage";
import CategoriesPage from "@/pages/CategoriesPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import BuyerOrdersPage from "@/pages/escrow/BuyerOrdersPage";
import OrderDetailPage from "@/pages/escrow/OrderDetailPage";
import SellerOrdersPage from "@/pages/escrow/SellerOrdersPage";
import SellerWalletPage from "@/pages/escrow/SellerWalletPage";
import AdminDisputesPage from "@/pages/escrow/AdminDisputesPage";
import ShipmentTrackingPage from "@/pages/escrow/ShipmentTrackingPage";
import PricingPage from "@/pages/subscription/PricingPage";
import MySubscriptionPage from "@/pages/subscription/MySubscriptionPage";
import CheckoutSuccessPage from "@/pages/subscription/CheckoutSuccessPage";
import AdminSubscriptionsPage from "@/pages/admin/AdminSubscriptionsPage";
import SearchResultsPage from "@/pages/SearchResultsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/vendors/:slug" element={<VendorStorePage />} />
                <Route path="/rfq" element={<RfqPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

                <Route path="/rfq/create" element={<ProtectedRoute><CreateRfqPage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute allowedRoles={['vendor']}><MySubscriptionPage /></ProtectedRoute>} />

                {/* Escrow & Payment routes */}
                <Route path="/orders" element={<ProtectedRoute><BuyerOrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId/tracking" element={<ProtectedRoute><ShipmentTrackingPage /></ProtectedRoute>} />
                <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['vendor']}><SellerOrdersPage /></ProtectedRoute>} />
                <Route path="/seller/wallet" element={<ProtectedRoute allowedRoles={['vendor']}><SellerWalletPage /></ProtectedRoute>} />
                <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['admin']}><AdminDisputesPage /></ProtectedRoute>} />
                <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptionsPage /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
