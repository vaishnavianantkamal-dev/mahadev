import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Bed,
  HeartHandshake,
  BookOpen,
  Users,
  MessageSquare,
  FileText,
  Settings,
  ArrowLeft,
  BarChart2,
  Menu,
  X,
} from "lucide-react";
import { getCurrentUser, setStubRole, SystemUser } from "@/api/auth";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarRange },
  { name: "Bhakta Niwas", href: "/admin/rooms", icon: Bed },
  { name: "Donations", href: "/admin/donations", icon: HeartHandshake },
  { name: "Accounts Ledger", href: "/admin/accounts", icon: BookOpen },
  { name: "Devotees CRM", href: "/admin/devotees", icon: Users },
  { name: "Communication", href: "/admin/communication", icon: MessageSquare },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Reports", href: "/admin/reports", icon: BarChart2 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isStub = (import.meta as any).env.VITE_DEV_STUB === "true" || true; // allow stub in dev

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isActive = (item: (typeof navigation)[0]) => {
    if (item.exact) return location.pathname === item.href;
    return location.pathname.startsWith(item.href);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let role: "SUPER_ADMIN" | "TRUST_ADMIN" | "STAFF" | null = null;
    if (email.trim() === "admin@temple.org" && password === "admin123") {
      role = "SUPER_ADMIN";
    } else if (email.trim() === "trustee@temple.org" && password === "trust123") {
      role = "TRUST_ADMIN";
    } else if (email.trim() === "staff@temple.org" && password === "staff123") {
      role = "STAFF";
    }

    if (role) {
      setTimeout(async () => {
        await setStubRole(role);
        const u = await getCurrentUser();
        setUser(u);
        setSubmitting(false);
      }, 800);
    } else {
      setTimeout(() => {
        setError("Invalid email or password. Please use the demo credentials below.");
        setSubmitting(false);
      }, 500);
    }
  };

  const handleAutofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fbf6ec]">
        <div className="text-center space-y-4">
          <span className="text-5xl animate-pulse block">🛕</span>
          <p className="text-sm font-semibold text-[#8a2e13] animate-pulse">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  // If no user, show the beautiful login panel with demo credentials
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf6ec] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-[#ecddc7] shadow-lg">
          <div className="text-center">
            <span className="text-5xl block animate-bounce">🛕</span>
            <h2 className="mt-4 text-2xl font-extrabold text-[#8a2e13]">
              Shri Mallikarjun Devasthan
            </h2>
            <p className="mt-1 text-sm text-gray-500 font-bold">
              Administrative CRM Login
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-lg text-center animate-shake">
                ⚠️ {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2a1810] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@temple.org"
                  className="w-full px-3 py-2 border border-[#ecddc7] rounded-lg focus:outline-none focus:border-[#8a2e13] focus:ring-1 focus:ring-[#8a2e13] text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a1810] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-[#ecddc7] rounded-lg focus:outline-none focus:border-[#8a2e13] focus:ring-1 focus:ring-[#8a2e13] text-sm font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#8a2e13] hover:bg-[#c25a22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a2e13] disabled:opacity-50 transition-colors"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Demo Credentials Helper Accordion */}
          <div className="mt-6 pt-6 border-t border-[#ecddc7]/40 bg-[#fbf6ec]/30 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-[#8a2e13] uppercase tracking-wide text-center">
              🔑 Demo Login Credentials
            </h4>
            <div className="space-y-2.5 text-[11px] font-semibold text-gray-700">
              {[
                { label: "Super Admin", email: "admin@temple.org", pass: "admin123" },
                { label: "Trust Admin", email: "trustee@temple.org", pass: "trust123" },
                { label: "Staff Member", email: "staff@temple.org", pass: "staff123" },
              ].map((demo, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-[#ecddc7]/20 last:border-0">
                  <div>
                    <p className="font-extrabold text-[#2a1810]">{demo.label}</p>
                    <p className="text-gray-400 font-medium">{demo.email} | {demo.pass}</p>
                  </div>
                  <button
                    onClick={() => handleAutofill(demo.email, demo.pass)}
                    className="px-2.5 py-1 bg-[#bf8f2e]/10 text-[#8a2e13] border border-[#ecddc7] rounded hover:bg-[#8a2e13] hover:text-[#fbf6ec] hover:border-[#8a2e13] font-bold text-[9px] transition-all"
                  >
                    Auto-fill
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center h-16 px-6 border-b border-[#ecddc7]/30 bg-[#2a1810]/20 flex-shrink-0">
        <span className="text-2xl mr-2">🛕</span>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight text-[#e6c878]">Shri Mallikarjun</span>
          <span className="text-[10px] text-[#fbf6ec]/70">Temple Admin CRM</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all group ${
                active
                  ? "bg-[#c25a22]/40 text-[#e6c878]"
                  : "hover:bg-[#c25a22]/30 hover:text-[#e6c878]"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  active ? "text-[#e6c878]" : "text-[#e6c878]/70 group-hover:text-[#e6c878]"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#ecddc7]/30 bg-[#2a1810]/20 flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold hover:text-[#e6c878] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Site
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#fbf6ec] text-[#2a1810] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#8a2e13] text-[#fbf6ec] transform transition-transform md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-[#8a2e13] text-[#fbf6ec] border-r border-[#ecddc7] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-[#ecddc7] shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[#8a2e13]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="hidden md:block text-lg font-semibold text-[#8a2e13]">
              Devasthanam Administrative Dashboard
            </h2>
            <span className="md:hidden text-xl">🛕</span>
          </div>

          {/* User info + stub role */}
          <div className="flex items-center gap-3">
            {isStub && (
              <div className="hidden sm:flex items-center gap-2 bg-[#fbf6ec] border border-[#ecddc7] px-3 py-1.5 rounded-lg text-xs">
                <span className="text-[#bf8f2e] font-semibold">Role:</span>
                <select
                  value={user.role}
                  onChange={async (e) => {
                    await setStubRole(e.target.value);
                    const u = await getCurrentUser();
                    setUser(u);
                  }}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer border border-[#ecddc7]/30 rounded px-1 py-0.5"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="TRUST_ADMIN">TRUST_ADMIN</option>
                  <option value="STAFF">STAFF</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#bf8f2e] text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-500 font-semibold">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fbf6ec]/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
