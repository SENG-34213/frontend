"use client";

import React, { useState, useEffect } from 'react';
import { CartItem, CourseItem, Language, MaterialItem } from './types';
import { MOCK_COURSES, MOCK_MATERIALS } from './data/mockData';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { CheckoutModal } from './components/marketplace/CheckoutModal';
import { QuickApplyModal } from './components/admissions/QuickApplyModal';
import { ExamResultsLookupModal } from './components/portal/ExamResultsLookupModal';
import { TutorApplicationModal } from './components/tutors/TutorApplicationModal';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MaterialDetailPage } from './pages/MaterialDetailPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { TeachersPage } from './pages/TeachersPage';
import { PortalsPage } from './pages/PortalsPage';
import { ContactLegalPage } from './pages/ContactLegalPage';

export default function App({ initialLang = 'en' }: { initialLang?: Language }) {
  // Navigation & Page State
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);

  // Localization State
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);

  // Commerce & Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Theme State (Light by default, togglable to Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tit_theme') || localStorage.getItem('mentify_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tit_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Admission Enquiry Modal State
  const [isQuickApplyOpen, setIsQuickApplyOpen] = useState(false);
  const [quickApplyCourse, setQuickApplyCourse] = useState<CourseItem | null>(null);

  // TiT Jaffna Exam Results & Tutor Application Modals
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isTutorApplyOpen, setIsTutorApplyOpen] = useState(false);

  // Synchronize hash with currentPath
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('course-')) {
        const id = hash.replace('course-', '');
        const found = MOCK_COURSES.find((c) => c.id === id);
        if (found) {
          setSelectedCourse(found);
          setCurrentPath('course-detail');
        }
      } else if (hash.startsWith('material-')) {
        const id = hash.replace('material-', '');
        const found = MOCK_MATERIALS.find((m) => m.id === id);
        if (found) {
          setSelectedMaterial(found);
          setCurrentPath('material-detail');
        }
      } else {
        setCurrentPath(hash);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse(course);
    window.location.hash = `course-${course.id}`;
    setCurrentPath('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMaterial = (material: MaterialItem) => {
    setSelectedMaterial(material);
    window.location.hash = `material-${material.id}`;
    setCurrentPath('material-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyCourse = (course: CourseItem) => {
    setQuickApplyCourse(course);
    setIsQuickApplyOpen(true);
  };

  const handleAddToCart = (material: MaterialItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.material.id === material.id);
      if (existing) {
        return prev;
      }
      return [...prev, { material, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.material.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mentify-app min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Global Sticky Application Header */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigateTo}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmissions={() => {
          setQuickApplyCourse(null);
          setIsQuickApplyOpen(true);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Page Content Router */}
      <main className="flex-1">
        {(![
          'courses',
          'course-detail',
          'marketplace',
          'material-detail',
          'features',
          'about',
          'teachers',
          'portals',
          'admissions',
          'contact',
          'faq',
          'privacy',
          'terms',
        ].includes(currentPath) ||
          currentPath === 'home' ||
          (currentPath === 'course-detail' && !selectedCourse) ||
          (currentPath === 'material-detail' && !selectedMaterial)) && (
          <HomePage
            currentLang={currentLang}
            onNavigate={navigateTo}
            courses={MOCK_COURSES}
            materials={MOCK_MATERIALS}
            onSelectCourse={handleSelectCourse}
            onSelectMaterial={handleSelectMaterial}
            onApplyCourse={handleApplyCourse}
            onAddToCart={handleAddToCart}
            onOpenAdmissions={() => {
              setQuickApplyCourse(null);
              setIsQuickApplyOpen(true);
            }}
            onOpenResults={() => setIsResultsOpen(true)}
            onOpenTutorApply={() => setIsTutorApplyOpen(true)}
          />
        )}

        {currentPath === 'courses' && (
          <CoursesPage
            currentLang={currentLang}
            courses={MOCK_COURSES}
            onSelectCourse={handleSelectCourse}
            onApplyCourse={handleApplyCourse}
          />
        )}

        {currentPath === 'course-detail' && selectedCourse && (
          <CourseDetailPage
            currentLang={currentLang}
            course={selectedCourse}
            onBack={() => navigateTo('courses')}
            onApply={handleApplyCourse}
          />
        )}

        {currentPath === 'marketplace' && (
          <MarketplacePage
            currentLang={currentLang}
            onSelectMaterial={handleSelectMaterial}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentPath === 'material-detail' && selectedMaterial && (
          <MaterialDetailPage
            currentLang={currentLang}
            material={selectedMaterial}
            relatedMaterials={MOCK_MATERIALS.filter(
              (m) => m.id !== selectedMaterial.id && m.subject === selectedMaterial.subject
            )}
            onBack={() => navigateTo('marketplace')}
            onAddToCart={handleAddToCart}
            onSelectRelated={handleSelectMaterial}
          />
        )}

        {currentPath === 'features' && (
          <FeaturesPage
            onNavigate={navigateTo}
            onOpenAdmissions={() => {
              setQuickApplyCourse(null);
              setIsQuickApplyOpen(true);
            }}
          />
        )}

        {currentPath === 'about' && (
          <AboutPage
            onNavigate={navigateTo}
            onOpenAdmissions={() => {
              setQuickApplyCourse(null);
              setIsQuickApplyOpen(true);
            }}
          />
        )}

        {currentPath === 'teachers' && (
          <TeachersPage currentLang={currentLang} onNavigate={navigateTo} />
        )}

        {currentPath === 'portals' && <PortalsPage currentLang={currentLang} />}

        {currentPath === 'admissions' && (
          <AdmissionsPage currentLang={currentLang} onNavigate={navigateTo} />
        )}

        {currentPath === 'contact' && (
          <ContactLegalPage currentLang={currentLang} initialTab="contact" />
        )}

        {currentPath === 'faq' && (
          <ContactLegalPage currentLang={currentLang} initialTab="faq" />
        )}

        {currentPath === 'privacy' && (
          <ContactLegalPage currentLang={currentLang} initialTab="privacy" />
        )}

        {currentPath === 'terms' && (
          <ContactLegalPage currentLang={currentLang} initialTab="terms" />
        )}
      </main>

      {/* Global Application Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenResults={() => setIsResultsOpen(true)}
        onOpenTutorApply={() => setIsTutorApplyOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Secure Checkout Preparation Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onSuccess={() => {
          setCart([]);
        }}
      />

      {/* Instant Course Enquiry / Pre-Registration Modal */}
      <QuickApplyModal
        isOpen={isQuickApplyOpen}
        onClose={() => setIsQuickApplyOpen(false)}
        selectedCourse={quickApplyCourse}
      />

      {/* Official Exam Results Lookup Modal */}
      <ExamResultsLookupModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
      />

      {/* Official Apply as a Tutor Modal */}
      <TutorApplicationModal
        isOpen={isTutorApplyOpen}
        onClose={() => setIsTutorApplyOpen(false)}
      />
    </div>
  );
}
