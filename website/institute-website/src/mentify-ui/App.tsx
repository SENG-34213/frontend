"use client";

import React, { useState, useEffect } from "react";
import { CartItem, CourseItem, Language, MaterialItem } from "./types";
import { MOCK_COURSES } from "./data/mockData";
import { api } from "./lib/api/client";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { CartDrawer } from "./components/layout/CartDrawer";
import { CheckoutModal } from "./components/marketplace/CheckoutModal";

// Pages
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { MaterialDetailPage } from "./pages/MaterialDetailPage";
import { AdmissionsPage } from "./pages/AdmissionsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { PortalsPage } from "./pages/PortalsPage";
import { ContactLegalPage } from "./pages/ContactLegalPage";

export default function App({ initialLang = "en" }: { initialLang?: Language }) {
  // Navigation & Page State
  const [currentPath, setCurrentPath] = useState<string>("home");
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    api
      .getMarketplaceMaterials({ page: 1, limit: 100 })
      .then((response) => {
        if (isMounted) setMaterials(response.data);
      })
      .catch((error) => console.error("Unable to load homepage marketplace materials", error));

    return () => {
      isMounted = false;
    };
  }, []);

  // Localization State
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);

  // Commerce & Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Theme State (Light by default, togglable to Dark)
  // Keep the first render deterministic for SSR. Browser theme preferences
  // are applied after hydration to prevent a server/client markup mismatch.
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("tit_theme") || localStorage.getItem("mentify_theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("tit_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Synchronize hash with currentPath
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      if (hash.startsWith("course-")) {
        const id = hash.replace("course-", "");
        const found = MOCK_COURSES.find((c) => c.id === id);
        if (found) {
          setSelectedCourse(found);
          setCurrentPath("course-detail");
        }
      } else if (hash.startsWith("material-")) {
        const id = hash.replace("material-", "");
        const found = materials.find((m) => m.id === id);
        if (found) {
          setSelectedMaterial(found);
          setCurrentPath("material-detail");
        }
      } else {
        setCurrentPath(hash);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [materials]);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPreRegistration = () => {
    navigateTo("home");
    window.setTimeout(() => {
      document.getElementById("academic-placement")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse(course);
    window.location.hash = `course-${course.id}`;
    setCurrentPath("course-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectMaterial = (material: MaterialItem) => {
    setSelectedMaterial(material);
    window.location.hash = `material-${material.id}`;
    setCurrentPath("material-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyCourse = () => {
    navigateTo("admissions");
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
        onOpenAdmissions={openPreRegistration}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Page Content Router */}
      <main className="flex-1">
        {(![
          "courses",
          "course-detail",
          "marketplace",
          "material-detail",
          "features",
          "about",
          "teachers",
          "portals",
          "admissions",
          "contact",
          "faq",
          "privacy",
          "terms",
        ].includes(currentPath) ||
          currentPath === "home" ||
          (currentPath === "course-detail" && !selectedCourse) ||
          (currentPath === "material-detail" && !selectedMaterial)) && (
          <HomePage
            currentLang={currentLang}
            onNavigate={navigateTo}
            courses={MOCK_COURSES}
            materials={materials}
            onSelectCourse={handleSelectCourse}
            onSelectMaterial={handleSelectMaterial}
            onApplyCourse={handleApplyCourse}
            onAddToCart={handleAddToCart}
            onOpenAdmissions={() => navigateTo("admissions")}
          />
        )}

        {currentPath === "courses" && (
          <CoursesPage
            currentLang={currentLang}
            courses={MOCK_COURSES}
            onSelectCourse={handleSelectCourse}
            onApplyCourse={handleApplyCourse}
          />
        )}

        {currentPath === "course-detail" && selectedCourse && (
          <CourseDetailPage
            currentLang={currentLang}
            course={selectedCourse}
            onBack={() => navigateTo("courses")}
            onApply={handleApplyCourse}
          />
        )}

        {currentPath === "marketplace" && (
          <MarketplacePage
            currentLang={currentLang}
            onSelectMaterial={handleSelectMaterial}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentPath === "material-detail" && selectedMaterial && (
          <MaterialDetailPage
            currentLang={currentLang}
            material={selectedMaterial}
            relatedMaterials={materials.filter(
              (m) => m.id !== selectedMaterial.id && m.subject === selectedMaterial.subject,
            )}
            onBack={() => navigateTo("marketplace")}
            onAddToCart={handleAddToCart}
            onSelectRelated={handleSelectMaterial}
          />
        )}

        {currentPath === "features" && (
          <FeaturesPage onNavigate={navigateTo} onOpenAdmissions={() => navigateTo("admissions")} />
        )}

        {currentPath === "about" && (
          <AboutPage onNavigate={navigateTo} onOpenAdmissions={() => navigateTo("admissions")} />
        )}

        {currentPath === "teachers" && (
          <TeachersPage currentLang={currentLang} onNavigate={navigateTo} />
        )}

        {currentPath === "portals" && <PortalsPage currentLang={currentLang} />}

        {currentPath === "admissions" && (
          <AdmissionsPage currentLang={currentLang} onNavigate={navigateTo} />
        )}

        {currentPath === "contact" && (
          <ContactLegalPage currentLang={currentLang} initialTab="contact" />
        )}

        {currentPath === "faq" && <ContactLegalPage currentLang={currentLang} initialTab="faq" />}

        {currentPath === "privacy" && (
          <ContactLegalPage currentLang={currentLang} initialTab="privacy" />
        )}

        {currentPath === "terms" && (
          <ContactLegalPage currentLang={currentLang} initialTab="terms" />
        )}
      </main>

      {/* Global Application Footer */}
      <Footer onNavigate={navigateTo} />

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
    </div>
  );
}
