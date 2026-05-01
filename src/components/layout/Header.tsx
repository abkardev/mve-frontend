import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { AISearchBar } from '@/components/AISearchBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Store, FileText, MessageCircle, LayoutDashboard, LogOut, User, Settings,
  Menu, X, CreditCard, Tag, Package, Wallet,
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/vendors', label: t('nav.vendors'), icon: Store },
    { to: '/rfq', label: t('nav.rfq'), icon: FileText },
    { to: '/pricing', label: t('nav.pricing', 'Pricing'), icon: Tag },
  ];

  const authNavLinks = [
    { to: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  ];

  const navButtonClass = "h-10 gap-2 px-3 text-sidebar-foreground/95 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-foreground focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar-background";
  const iconButtonClass = "text-sidebar-foreground/95 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:bg-sidebar-accent focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar-background";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-sidebar-background text-sidebar-foreground shadow-md">
      <div className="container flex min-h-16 items-center justify-between gap-3 py-2">
        <Link to="/" className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary shadow-sm">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-xl font-bold tracking-normal text-sidebar-foreground sm:inline-block">B2B Market</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button variant="ghost" className={navButtonClass}><link.icon className="h-4 w-4 text-primary" />{link.label}</Button>
            </Link>
          ))}
          {isAuthenticated && authNavLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button variant="ghost" className={navButtonClass}><link.icon className="h-4 w-4 text-primary" />{link.label}</Button>
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <AISearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className={`lg:hidden ${iconButtonClass}`} onClick={() => setSearchOpen(!searchOpen)} aria-label={searchOpen ? 'Close search' : 'Open search'} aria-expanded={searchOpen}>
            {searchOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <LanguageToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${iconButtonClass}`} aria-label="Open account menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align={isRTL ? 'start' : 'end'}>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4" />{t('nav.dashboard')}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/orders" className="gap-2"><Package className="h-4 w-4" />My orders</Link></DropdownMenuItem>
                {user?.role === 'vendor' && (
                  <>
                    <DropdownMenuItem asChild><Link to="/seller/orders" className="gap-2"><Package className="h-4 w-4" />Sales</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/seller/wallet" className="gap-2"><Wallet className="h-4 w-4" />Wallet</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/subscription" className="gap-2"><CreditCard className="h-4 w-4" />Subscription</Link></DropdownMenuItem>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild><Link to="/admin/disputes" className="gap-2"><Settings className="h-4 w-4" />Disputes</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/admin/subscriptions" className="gap-2"><CreditCard className="h-4 w-4" />Subscriptions</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />{t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" className={navButtonClass}>{t('nav.login')}</Button></Link>
              <Link to="/register"><Button>{t('nav.register')}</Button></Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className={`md:hidden ${iconButtonClass}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-sidebar-border bg-sidebar-accent/60 p-4 lg:hidden"><AISearchBar /></div>
      )}

      {mobileMenuOpen && (
        <div className="border-t border-sidebar-border bg-sidebar-background md:hidden">
          <nav className="container flex flex-col gap-2 py-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start ${navButtonClass}`}><link.icon className="h-4 w-4 text-primary" />{link.label}</Button>
              </Link>
            ))}
            {isAuthenticated && authNavLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start ${navButtonClass}`}><link.icon className="h-4 w-4 text-primary" />{link.label}</Button>
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className={`w-full justify-start ${navButtonClass}`}>{t('nav.login')}</Button></Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}><Button className="w-full">{t('nav.register')}</Button></Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
