"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Truck,
  ArrowRight,
  Image as ImageIcon,
  Flame,
  Zap,
  Trophy,
  Package,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { ClientOnly } from "./client-only";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import Image from "next/image";

const BRAND_BLACK = "#000000";
const BRAND_ACCENT = "#E53E3E";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState(null);
  const [expandedCategoryMobile, setExpandedCategoryMobile] = useState(null);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled && !activeMenu;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveMenu(null);
    setShowSearchDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setActiveMenu(null);
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const response = await fetchApi(`/public/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
        setSearchResults(response?.data?.products || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetchApi("/public/menus");
        if (response?.data?.navbarItems?.length > 0) {
          setMenuItems(response.data.navbarItems);
          const shopTab = response.data.navbarItems.find((i) => i.layout === "SHOP_TABS");
          if (shopTab?.categories?.length > 0) setActiveCategoryTab(shopTab.categories[0].id);
        }
      } catch {
        setMenuItems([
          {
            id: "fb-shop",
            label: "SHOP",
            layout: "COLUMNS_WITH_BANNER",
            isActive: true,
            columns: [
              {
                id: "fb-col",
                title: "CATEGORIES",
                links: [
                  { id: "1", label: "Whey Protein", url: "/products?category=whey-protein" },
                  { id: "2", label: "Protein Bars", url: "/products?category=protein-bars" },
                  { id: "3", label: "Pre Workout", url: "/products?category=pre-workout" },
                  { id: "4", label: "Creatine", url: "/products?category=creatine" },
                ],
              },
            ],
            bannerTitle: "PREMIUM SPORTS NUTRITION",
            bannerSubtitle: "SHOP NOW",
            bannerLink: "/products",
          },
          { id: "fb-about", label: "ABOUT", layout: "SIMPLE", slug: "/about", isActive: true },
          { id: "fb-contact", label: "CONTACT", layout: "SIMPLE", slug: "/contact", isActive: true },
        ]);
      }
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setIsMenuOpen(false);
    }
  };

  const renderSearchDropdown = () => {
    if (!showSearchDropdown) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] max-h-[420px] overflow-y-auto no-scrollbar">
        {isSearching ? (
          <div className="flex items-center justify-center py-6 px-4 gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <span>Searching &ldquo;{searchQuery}&rdquo;...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="py-2">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 tracking-wider border-b border-gray-100 uppercase">
              Products ({searchResults.length})
            </div>
            <div className="divide-y divide-gray-50">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => { setShowSearchDropdown(false); setSearchQuery(""); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="relative h-12 w-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <Package className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-sm font-medium text-gray-800 truncate group-hover:text-black">{product.name}</h4>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{product.category?.name || "Supplement"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {product.hasSale ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-gray-400 line-through">₹{product.regularPrice}</span>
                        <span className="text-sm font-bold text-red-600">₹{product.basePrice}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">₹{product.basePrice}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50 flex justify-between items-center text-xs">
              <span className="text-gray-400">Showing top results</span>
              <button
                onClick={(e) => { handleSearch(e); setShowSearchDropdown(false); }}
                className="font-semibold text-black hover:underline flex items-center gap-0.5"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No products found for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    );
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  return (
    <>
      <header
        ref={navbarRef}
        className={cn(
          "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-white shadow-md" : isTransparent ? "bg-black" : "bg-white"
        )}
      >
        <Toaster position="top-center" richColors />

        {/* ANNOUNCEMENT BAR */}
        {announcementVisible && (
          <div className="py-2 text-xs relative bg-black">
            <p className="text-center tracking-widest font-jost uppercase text-white">
              FREE SHIPPING ON ORDERS ABOVE ₹999 &nbsp;·&nbsp; PREMIUM SPORTS NUTRITION
            </p>
            <button
              onClick={() => setAnnouncementVisible(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* TOP NAV */}
        <div
          className="transition-all duration-300"
          style={{
            borderBottom: isTransparent ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
          }}
        >
          {/* Desktop */}
          <div className="hidden lg:flex items-center justify-between h-20 max-w-[1400px] mx-auto px-6 gap-8">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image
                src="/logo-2.png"
                alt="FITOVANCE"
                width={130}
                height={36}
                className={cn(
                  "h-9 w-auto object-contain transition-all duration-300",
                  isTransparent ? "brightness-0 invert" : ""
                )}
                priority
              />
            </Link>

            {/* Search */}
            <div className="relative flex-1 max-w-[480px]">
              <form
                onSubmit={handleSearch}
                className="flex items-center rounded-lg overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: isTransparent ? "rgba(255,255,255,0.1)" : "#f3f4f6",
                }}
              >
                <input
                  type="text"
                  placeholder="Search protein, creatine, supplements..."
                  className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
                  style={{
                    color: isTransparent ? "white" : "#374151",
                  }}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                  onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
                />
                <button
                  type="submit"
                  className="px-3 py-2.5 transition-colors"
                  style={{ color: isTransparent ? "rgba(255,255,255,0.5)" : "#9ca3af" }}
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
              {renderSearchDropdown()}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-5">
              <Link
                href="/wishlist"
                className="flex flex-col items-center gap-0.5 transition-colors group"
                style={{ color: isTransparent ? "rgba(255,255,255,0.85)" : "#4b5563" }}
              >
                <Heart className="h-5 w-5 group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                <span className="text-[10px] font-jost tracking-wider">WISHLIST</span>
              </Link>

              <ClientOnly>
                <div className="relative">
                  <button
                    className="flex flex-col items-center gap-0.5 transition-colors"
                    style={{ color: isTransparent ? "rgba(255,255,255,0.85)" : "#4b5563" }}
                    onClick={() => setActiveMenu(activeMenu === "account" ? null : "account")}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-[10px] font-jost tracking-wider">
                      {isAuthenticated ? (user?.name?.split(" ")[0] || "ACCOUNT") : "ACCOUNT"}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "absolute right-0 top-[calc(100%+12px)] w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 transition-all duration-200 z-50",
                      activeMenu === "account" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none"
                    )}
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-sm">{user?.name || "User"}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        </div>
                        {[{ label: "My Account", href: "/account" }, { label: "My Orders", href: "/account/orders" }, { label: "Wishlist", href: "/wishlist" }].map((l) => (
                          <Link key={l.href} href={l.href} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setActiveMenu(null)}>
                            {l.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => { handleLogout(); setActiveMenu(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 space-y-2">
                        <Link href="/auth" onClick={() => setActiveMenu(null)} className="block w-full text-center py-2.5 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                          Login
                        </Link>
                        <Link href="/register" onClick={() => setActiveMenu(null)} className="block w-full text-center py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </ClientOnly>

              <Link
                href="/cart"
                className="flex flex-col items-center gap-0.5 transition-colors group relative"
                style={{ color: isTransparent ? "rgba(255,255,255,0.85)" : "#4b5563" }}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-[10px] font-jost tracking-wider">CART</span>
                <ClientOnly>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {getCartItemCount()}
                    </span>
                  )}
                </ClientOnly>
              </Link>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center h-14 px-3 gap-2">
            <button
              onClick={() => setIsMenuOpen(true)}
              className={cn("p-2 transition-colors", isTransparent ? "text-white" : "text-gray-700")}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex-1 flex justify-center items-center h-8">
              <Image
                src="/logo-2.png"
                alt="FITOVANCE"
                width={100}
                height={32}
                className={cn(
                  "h-8 w-auto object-contain transition-all duration-300",
                  isTransparent ? "brightness-0 invert" : ""
                )}
              />
            </Link>
            <ClientOnly>
              <Link
                href="/cart"
                className={cn("p-2 relative transition-colors", isTransparent ? "text-white" : "text-gray-700")}
              >
                <ShoppingBag className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            </ClientOnly>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div
          className={cn(
            "lg:hidden px-3 py-2 border-b transition-all duration-300",
            isTransparent ? "border-white/10" : "border-gray-100"
          )}
        >
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-lg overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: isTransparent ? "rgba(255,255,255,0.1)" : "#f3f4f6",
            }}
          >
            <input
              type="text"
              placeholder="Search supplements..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-transparent placeholder:text-gray-400"
              style={{
                color: isTransparent ? "white" : "#374151",
              }}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
            />
            <button
              type="submit"
              className="px-3 py-2 transition-colors"
              style={{ color: isTransparent ? "rgba(255,255,255,0.5)" : "#9ca3af" }}
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          {renderSearchDropdown()}
        </div>

        {/* DESKTOP NAV LINKS */}
        <nav
          className="hidden lg:block transition-all duration-300"
          style={{
            borderBottom: isTransparent ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f3f4f6",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6">
            <ul className="flex items-center justify-center gap-1">
              {menuItems.map((item) => {
                const hasMega = item.layout !== "SIMPLE" || (item.columns?.length > 0);
                const isActive = activeMenu === item.label;

                return (
                  <li
                    key={item.id}
                    className={cn(item.layout === "SIMPLE" ? "relative" : "static")}
                    onMouseEnter={() => hasMega && setActiveMenu(item.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    {item.slug ? (
                      <Link
                        href={item.slug}
                        className="flex items-center gap-1 px-4 py-3.5 text-xs font-jost tracking-[0.15em] font-semibold uppercase transition-all duration-200 border-b-2"
                        style={{
                          color: isTransparent ? "rgba(255,255,255,0.85)" : "#4b5563",
                          borderColor: isActive ? (isTransparent ? "white" : "black") : "transparent",
                        }}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className="flex items-center gap-1 px-4 py-3.5 text-xs font-jost tracking-[0.15em] font-semibold uppercase transition-all duration-200 border-b-2 cursor-pointer select-none"
                        style={{
                          color: isActive
                            ? (isTransparent ? "white" : "black")
                            : (isTransparent ? "rgba(255,255,255,0.85)" : "#4b5563"),
                          borderColor: isActive ? (isTransparent ? "white" : "black") : "transparent",
                        }}
                      >
                        {item.label}
                        {hasMega && (
                          <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isActive && "rotate-180")} />
                        )}
                      </span>
                    )}

                    {/* MEGA DROPDOWN */}
                    {hasMega && (
                      <div
                        className={cn(
                          "bg-white shadow-2xl border-t transition-all duration-200 z-50 text-black left-0 right-0",
                          item.layout === "SIMPLE"
                            ? "absolute top-full w-56 px-0 py-2 border-b"
                            : "absolute top-full w-full border-b"
                        )}
                        style={{
                          opacity: isActive ? 1 : 0,
                          visibility: isActive ? "visible" : "hidden",
                          transform: isActive ? "translateY(0)" : "translateY(-4px)",
                        }}
                      >
                        {/* 1. SHOP_TABS */}
                        {item.layout === "SHOP_TABS" && (
                          <div className="max-w-[1400px] mx-auto grid grid-cols-[240px_1fr] gap-6 py-6 px-6">
                            <div className="border-r border-gray-100 pr-6 flex flex-col gap-0.5 max-h-[400px] overflow-y-auto no-scrollbar">
                              {item.categories?.map((cat) => (
                                <button
                                  key={cat.id}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-xs font-semibold tracking-wider font-jost transition-all rounded-md flex items-center justify-between",
                                    activeCategoryTab === cat.id
                                      ? "bg-black text-white"
                                      : "text-gray-600 hover:bg-gray-50"
                                  )}
                                  onMouseEnter={() => setActiveCategoryTab(cat.id)}
                                >
                                  {cat.name.toUpperCase()}
                                  <ChevronRight className="h-3 w-3 opacity-40" />
                                </button>
                              ))}
                            </div>
                            <div className="min-h-[300px] max-h-[400px] overflow-y-auto no-scrollbar">
                              {(() => {
                                const activeCat = item.categories?.find((c) => c.id === activeCategoryTab);
                                if (!activeCat?.columns?.length) {
                                  return <div className="flex h-full items-center justify-center text-sm text-gray-300">Select a category</div>;
                                }
                                return (
                                  <div className="flex flex-wrap gap-8 justify-between">
                                    {activeCat.columns.map((col) => (
                                      <div key={col.id} className="flex-1 min-w-[150px] max-w-[220px] flex flex-col gap-2">
                                        <h4 className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 mb-1">
                                          {col.title}
                                        </h4>
                                        <ul className="flex flex-col gap-1.5">
                                          {col.links?.map((lnk) => (
                                            <li key={lnk.id}>
                                              <Link
                                                href={lnk.url}
                                                className="text-sm text-gray-600 hover:text-black transition-colors inline-block"
                                                onClick={() => setActiveMenu(null)}
                                              >
                                                {lnk.label}
                                                {lnk.badge && (
                                                  <span className="ml-1.5 text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full uppercase">
                                                    {lnk.badge}
                                                  </span>
                                                )}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* 2. COLUMNS_WITH_BANNER */}
                        {item.layout === "COLUMNS_WITH_BANNER" && (
                          <div className="max-w-[1400px] mx-auto grid grid-cols-[1fr_300px] gap-8 py-6 px-6">
                            <div className="flex flex-wrap gap-8 justify-start">
                              {item.columns?.map((col) => (
                                <div key={col.id} className="flex-1 min-w-[150px] max-w-[220px] flex flex-col gap-2">
                                  <h4 className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 mb-1">
                                    {col.title}
                                  </h4>
                                  <ul className="flex flex-col gap-1.5">
                                    {col.links?.map((lnk) => (
                                      <li key={lnk.id}>
                                        <Link
                                          href={lnk.url}
                                          className="text-sm text-gray-600 hover:text-black transition-colors inline-block"
                                          onClick={() => setActiveMenu(null)}
                                        >
                                          {lnk.label}
                                          {lnk.badge && (
                                            <span className="ml-1.5 text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full uppercase">
                                              {lnk.badge}
                                            </span>
                                          )}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            {/* Banner */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden group min-h-[280px]">
                              {item.bannerImage ? (
                                <>
                                  <img src={item.bannerImage} alt={item.bannerTitle || ""} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                  <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col items-center z-10">
                                    <p className="font-jost text-sm font-bold tracking-widest uppercase mb-3">{item.bannerTitle}</p>
                                    <Link
                                      href={item.bannerLink || "/products"}
                                      className="px-5 py-2 bg-white text-black font-semibold text-[10px] tracking-widest uppercase rounded-lg hover:bg-black hover:text-white transition-colors"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      {item.bannerSubtitle || "SHOP NOW"}
                                    </Link>
                                  </div>
                                </>
                              ) : (
                                <div className="flex h-full flex-col justify-center items-center p-4">
                                  <Flame className="h-8 w-8 text-gray-300 mb-2" />
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.bannerTitle || "Trending"}</p>
                                  <Link
                                    href={item.bannerLink || "/products"}
                                    className="mt-3 px-4 py-2 bg-black text-white rounded-lg text-[10px] uppercase tracking-widest font-semibold"
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    {item.bannerSubtitle || "Shop Now"}
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 3. IMAGE_GRID */}
                        {item.layout === "IMAGE_GRID" && (
                          <div className="max-w-[1400px] mx-auto py-6 px-6">
                            <div className="grid grid-cols-6 gap-4">
                              {item.columns?.[0]?.links?.map((lnk) => (
                                <Link
                                  key={lnk.id}
                                  href={lnk.url}
                                  className="relative block aspect-[4/5] rounded-xl overflow-hidden shadow group"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  {lnk.image ? (
                                    <img src={lnk.image} alt={lnk.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  ) : (
                                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                      <ImageIcon className="h-8 w-8 text-gray-300" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
                                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                                    <span className="font-jost text-[10px] tracking-widest font-bold uppercase">{lnk.label}</span>
                                    <ArrowRight className="h-3.5 w-3.5 transform -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. SIMPLE */}
                        {item.layout === "SIMPLE" && (
                          <ul className="py-1">
                            {item.columns?.[0]?.links?.map((lnk) => (
                              <li key={lnk.id}>
                                <Link href={lnk.url} className="block px-5 py-2.5 text-sm hover:bg-gray-50 text-gray-600" onClick={() => setActiveMenu(null)}>
                                  {lnk.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* MOBILE SIDE MENU */}
      <div className={cn("fixed inset-0 z-[60] lg:hidden transition-opacity duration-300", isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
        <div
          className={cn("absolute left-0 top-0 bottom-0 w-[85%] max-w-sm flex flex-col bg-white transition-transform duration-300", isMenuOpen ? "translate-x-0" : "-translate-x-full")}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black text-white shrink-0">
            <Image
              src="/logo-2.png"
              alt="FITOVANCE"
              width={100}
              height={36}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <button onClick={() => setIsMenuOpen(false)} className="p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User */}
          <ClientOnly>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              {isAuthenticated ? (
                <div>
                  <p className="font-semibold text-sm">Hi, {user?.name?.split(" ")[0] || "User"}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              ) : (
                <Link href="/auth" className="flex items-center gap-2 text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>
                  <User className="h-5 w-5" /> Login / Register
                </Link>
              )}
              <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="p-1 text-gray-400">
                <Heart className="h-5 w-5" />
              </Link>
            </div>
          </ClientOnly>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto">
            <Link
              href="/products?productType=new"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3.5 text-sm font-bold border-b border-gray-100 text-red-600"
            >
              <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> NEW ARRIVALS</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            {menuItems.map((item) => {
              const hasSubmenu = item.layout !== "SIMPLE" || (item.columns?.length > 0);
              const isExpanded = expandedMobileMenu === item.id;

              if (!hasSubmenu) {
                return (
                  <div key={item.id} className="border-b border-gray-100">
                    <Link href={item.slug || "/products"} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50">
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </Link>
                  </div>
                );
              }

              return (
                <div key={item.id} className="border-b border-gray-100">
                  <button
                    onClick={() => setExpandedMobileMenu(isExpanded ? null : item.id)}
                    className="flex items-center justify-between w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className={cn("h-4 w-4 text-gray-300 transition-transform duration-200", isExpanded && "rotate-90")} />
                  </button>

                  <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0")}>
                    {item.layout === "SHOP_TABS" ? (
                      <div className="pl-4">
                        {item.categories?.map((cat) => {
                          const isCatExpanded = expandedCategoryMobile === cat.id;
                          return (
                            <div key={cat.id} className="border-b border-gray-50">
                              <button
                                onClick={() => setExpandedCategoryMobile(isCatExpanded ? null : cat.id)}
                                className="flex items-center justify-between w-full py-2.5 pr-4 text-xs font-semibold text-gray-600"
                              >
                                {cat.name.toUpperCase()}
                                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isCatExpanded && "rotate-90")} />
                              </button>
                              <div className={cn("overflow-hidden transition-all duration-200 pl-4 space-y-2 bg-gray-50", isCatExpanded ? "max-h-[500px] py-2" : "max-h-0 opacity-0")}>
                                {cat.columns?.map((col) => (
                                  <div key={col.id} className="py-1">
                                    <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{col.title}</div>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {col.links?.map((lnk) => (
                                        <Link
                                          key={lnk.id}
                                          href={lnk.url}
                                          onClick={() => setIsMenuOpen(false)}
                                          className="text-xs text-gray-600 hover:text-black px-2 py-1 bg-white border border-gray-200 rounded-full"
                                        >
                                          {lnk.label}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-2 px-4 space-y-3">
                        {item.columns?.map((col) => (
                          <div key={col.id}>
                            <h5 className="font-bold text-[10px] text-gray-400 tracking-widest uppercase border-b border-gray-100 pb-1 mb-2">{col.title}</h5>
                            <div className="grid grid-cols-2 gap-1">
                              {col.links?.map((lnk) => (
                                <Link key={lnk.id} href={lnk.url} onClick={() => setIsMenuOpen(false)} className="text-xs text-gray-600 hover:text-black py-1 inline-block truncate">
                                  {lnk.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <Link
              href="/products?sale=true"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3.5 text-sm font-bold border-b border-gray-100 text-red-600"
            >
              <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> OFFERS</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            <div className="py-2 border-t border-gray-100">
              {[
                { label: "Track Order", href: "/account/orders", icon: <Truck className="h-4 w-4" /> },
                { label: "Contact Us", href: "/contact", icon: <Phone className="h-4 w-4" /> },
                { label: "About Us", href: "/about", icon: <MapPin className="h-4 w-4" /> },
              ].map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-gray-600">
                  <span className="text-gray-400">{link.icon}</span> {link.label}
                </Link>
              ))}
            </div>

            <ClientOnly>
              {isAuthenticated && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </ClientOnly>
          </div>
        </div>
      </div>

      {/* BOTTOM MOBILE NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
        <div className="grid grid-cols-4">
          {[
            { label: "Home", href: "/", icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, match: (p) => p === "/" },
            { label: "Shop", href: "/products", icon: <Search className="h-5 w-5" />, match: (p) => p.startsWith("/products") },
            { label: "Wishlist", href: "/wishlist", icon: <Heart className="h-5 w-5" />, match: (p) => p === "/wishlist" },
            { label: "Cart", href: "/cart", icon: <ShoppingBag className="h-5 w-5" />, match: (p) => p === "/cart", cart: true },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center justify-center py-2.5 transition-colors", item.match(pathname) ? "text-red-600" : "text-gray-600")}
            >
              <div className="relative">
                {item.icon}
                {item.cart && (
                  <ClientOnly>
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                        {getCartItemCount()}
                      </span>
                    )}
                  </ClientOnly>
                )}
              </div>
              <span className="text-[9px] font-jost tracking-wider mt-0.5 font-medium">{item.label.toUpperCase()}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
