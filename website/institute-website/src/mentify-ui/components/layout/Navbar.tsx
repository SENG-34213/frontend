import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Globe,
  LogIn,
  Menu,
  Moon,
  PhoneCall,
  ShoppingBag,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { Language } from '../../types';
import { SITE_CONFIG } from '../../lib/config/site';
import { getTranslation } from '../../lib/translations';
import { Button } from '../ui/Button';

export interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmissions: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  currentLang,
  onLanguageChange,
  cartCount,
  onOpenCart,
  onOpenAdmissions,
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = (key: string) => getTranslation(currentLang, key);

  const navLinks = [
    { id: 'home', label: t('nav.home'), path: 'home' },
    { id: 'courses', label: t('nav.courses'), path: 'courses' },
    { id: 'features', label: t('nav.features'), path: 'features' },
    { id: 'marketplace', label: t('nav.marketplace'), path: 'marketplace' },
  ];

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'si', label: 'Sinhala', nativeName: 'සිංහල' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo: ONLY the official TiT Jaffna logo image without text near it */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full group py-1"
            title="TiT Jaffna - Home"
            aria-label="TiT Jaffna Home"
          >
            <img
              src="/TiTJaffna-logo.jpeg"
              alt="TiT Jaffna Publication"
              className="h-12 w-12 sm:h-13 sm:w-13 rounded-full object-contain bg-white shadow-xs ring-1 ring-slate-200/90 dark:ring-slate-700 group-hover:scale-105 transition-transform duration-200"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="uppercase">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        currentLang === lang.code
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Portal Login */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavClick('portals')}
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              {t('nav.portals')}
            </Button>

            {/* Admissions / Apply CTA */}
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAdmissions}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              className="text-xs shadow-sm shadow-indigo-500/20"
            >
              {t('nav.apply')}
            </Button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {/* Theme Toggle Mobile */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-3 gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`py-1.5 text-center text-xs font-semibold rounded-lg border cursor-pointer ${
                  currentLang === lang.code
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3.5 py-2.5 text-left text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => handleNavClick('portals')}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full justify-center"
            >
              {t('nav.portals')}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmissions();
              }}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full justify-center"
            >
              {t('nav.apply')}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
