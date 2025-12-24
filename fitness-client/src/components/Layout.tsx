import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Phone,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Dumbbell,
  Wallet,
  ShoppingBag,
  MapPin,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/gyms', label: 'Залы', icon: MapPin, protected: true },
  { to: '/coaches', label: 'Тренеры', icon: UserCheck, protected: true },
  { to: '/programs', label: 'Программы', icon: Dumbbell, protected: true },
  { to: '/subscriptions', label: 'Абонементы', icon: Wallet, protected: true },
  { to: '/products', label: 'Продукты', icon: ShoppingBag, protected: true },
];

const pageTitle: Record<string, string> = {
  '/': 'Главная',
  '/auth': 'Авторизация',
  '/gyms': 'Залы',
  '/coaches': 'Тренеры',
  '/programs': 'Программы',
  '/subscriptions': 'Абонементы',
  '/products': 'Продукты',
  '/bookings': 'Мои бронирования',
};

const NavLinkItem: React.FC<{
  to: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  className?: string;
}> = ({ to, label, icon: Icon, onClick, className = '' }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        brutal-button flex items-center justify-center gap-2 transition-all duration-200
        ${isActive ? 'bg-gray-dark text-white translate-x-[2px] translate-y-[2px] shadow-[3px_3px_0_0_#1A1A1A]' : ''}
        ${className}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
};

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, logout, loading, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const currentTitle = Object.entries(pageTitle).find(
    ([path]) => location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'Раздел';

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-4 sm:px-6 lg:px-8 border-b-4 border-gray-dark sticky top-0 z-30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 md:w-14 md:h-14 brutal-shadow flex items-center justify-center bg-orange-primary transition-transform group-hover:scale-105">
                <img src="/logo.jpg" alt="" className="w-9 h-9 md:w-10 md:h-10 object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-orange-primary uppercase tracking-tight">
                  HHSportFit
                </h1>
                <p className="text-xs font-body font-semibold text-gray-medium uppercase tracking-wide">
                  Фитнес без оправданий
                </p>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-3">
              {!isAuthenticated && (
                <NavLinkItem to="/auth" label="Войти" icon={User} />
              )}
              {isAuthenticated && (
                <>
                  <NavLinkItem to="/bookings" label="Кабинет" icon={User} />
                  {navLinks.filter(l => l.protected).map((link) => (
                    <NavLinkItem
                      key={link.to}
                      to={link.to}
                      label={link.label}
                      icon={link.icon}
                    />
                  ))}
                </>
              )}
              <a
                href="tel:+70000000000"
                className="brutal-button-secondary flex items-center gap-2"
              >
                <Phone size={18} />
                <span className="hidden xl:inline">Контакты</span>
              </a>
              {isAuthenticated && (
                <button
                  className="brutal-button bg-gray-dark text-white flex items-center gap-2"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? <span className="loader" /> : <LogOut size={18} />}
                  <span className="hidden xl:inline">Выход</span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-3 border-4 border-gray-dark bg-white brutal-shadow-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[85%] max-w-sm bg-cream z-50 lg:hidden
          border-l-4 border-gray-dark transform transition-transform duration-300 ease-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b-4 border-gray-dark bg-white">
            <span className="font-display font-bold text-lg uppercase">Меню</span>
            <button
              className="p-2 border-2 border-gray-dark"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-3">
            <NavLinkItem
              to="/"
              label="Главная"
              icon={Home}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            />

            {!isAuthenticated && (
              <NavLinkItem
                to="/auth"
                label="Войти"
                icon={User}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              />
            )}

            {isAuthenticated && (
              <>
                <NavLinkItem
                  to="/bookings"
                  label="Мой кабинет"
                  icon={User}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                />
                <div className="border-t-2 border-gray-200 my-4" />
                {navLinks.filter(l => l.protected).map((link, index) => (
                  <div
                    key={link.to}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <NavLinkItem
                      to={link.to}
                      label={link.label}
                      icon={link.icon}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    />
                  </div>
                ))}
              </>
            )}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t-4 border-gray-dark bg-white space-y-3">
            <a
              href="tel:+70000000000"
              className="brutal-button-secondary w-full flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Контакты
            </a>
            {isAuthenticated && (
              <button
                className="brutal-button bg-gray-dark text-white w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? <span className="loader" /> : <LogOut size={18} />}
                Выйти из аккаунта
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Bar */}
      <div className="bg-orange-primary text-white border-b-4 border-gray-dark px-4 sm:px-6 lg:px-8 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold uppercase text-sm tracking-wider">
              {currentTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <span className="text-xs font-body font-semibold uppercase bg-white text-gray-dark px-3 py-1 border-2 border-gray-dark brutal-shadow-sm">
                {user?.email?.split('@')[0] || 'Клиент'}
              </span>
            ) : (
              <span className="text-xs font-body font-semibold uppercase bg-white/20 text-white px-3 py-1 border-2 border-white/40">
                Гость
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div key={location.pathname} className="page-transition">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-dark text-white py-8 border-t-4 border-gray-dark px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-primary border-2 border-white flex items-center justify-center">
                <img src="/logo.jpg" alt="" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-display font-bold text-lg uppercase">HHSportFit</span>
            </div>
            <p className="text-sm font-body text-gray-400 text-center md:text-right">
              © 2024 HHSportFit. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
