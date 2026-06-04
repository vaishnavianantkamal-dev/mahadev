import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  HeartHandshake,
  CalendarRange,
  Bed,
  Radio,
  Globe,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n";

export default function PublicLayout() {
  const { locale, t, toggleLocale } = useLocale();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [phone] = useState("+91 9494816173");
  const [email] = useState("contact@shrimallikarjunnhavre.org");
  const [address] = useState("Nhavre, Taluka Shirur, Pune, Maharashtra - 412211");

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/about", label: t.about },
    { to: "/darshan", label: t.darshan },
    { to: "/book", label: t.book },
    { to: "/rooms", label: t.rooms },
    { to: "/donate", label: t.donate },
    { to: "/events", label: t.events },
    { to: "/media", label: t.media },
    { to: "/contact", label: t.contact },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf6ec]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#8a2e13] text-[#fbf6ec] border-b border-[#ecddc7]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🛕</span>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm tracking-wide text-[#e6c878] uppercase">
                {t.title}
              </span>
              <span className="text-[9px] text-[#fbf6ec]/80 leading-none">
                {t.subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-5 text-xs font-bold">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-[#e6c878] transition-colors ${
                  isActive(link.to) ? "text-[#e6c878] border-b border-[#e6c878]" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#2a1810]/30 hover:bg-[#2a1810]/60 border border-[#ecddc7]/30 rounded-lg text-xs font-bold transition-all text-[#e6c878]"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === "mr" ? "English" : "मराठी"}
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#bf8f2e] text-[#2a1810] font-bold text-xs rounded-lg hover:bg-[#e6c878] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-[#e6c878] ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="md:hidden bg-[#2a1810] border-t border-[#ecddc7]/20 px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-xs font-bold text-[#fbf6ec] hover:text-[#e6c878] py-2 border-b border-[#ecddc7]/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#2a1810] text-[#fbf6ec]/80 border-t border-[#ecddc7]/20 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#e6c878] uppercase">Shri Mallikarjun Temple</h3>
            <p className="leading-relaxed font-semibold">
              Lord Shiva's ancient shrine located in Nhavre, taluka Shirur, Pune. Serving devotees
              with daily rituals and charitable programs.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#e6c878] uppercase">Quick Links</h3>
            <ul className="space-y-2 font-medium">
              <li><Link to="/about" className="hover:text-[#e6c878] transition-colors">{t.about}</Link></li>
              <li><Link to="/darshan" className="hover:text-[#e6c878] transition-colors">{t.darshan}</Link></li>
              <li><Link to="/book" className="hover:text-[#e6c878] transition-colors">{t.book}</Link></li>
              <li><Link to="/rooms" className="hover:text-[#e6c878] transition-colors">{t.rooms}</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#e6c878] uppercase">Sacred Services</h3>
            <ul className="space-y-2 font-medium">
              <li><Link to="/donate" className="hover:text-[#e6c878]">{t.donate}</Link></li>
              <li><Link to="/media" className="hover:text-[#e6c878]">{t.media}</Link></li>
              <li><Link to="/events" className="hover:text-[#e6c878]">{t.events}</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#e6c878] uppercase">Contact Temple Office</h3>
            <p className="leading-relaxed font-medium text-gray-400">
              {address}<br />
              Phone: {phone}<br />
              Email: {email}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#ecddc7]/10 text-center font-bold text-gray-500">
          <p>{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
