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

export default function AdminLayout() {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  // If no user, show a stub login panel (since it's dev stub mode)
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fbf6ec]">
        <div className="bg-white p-8 rounded-2xl border border-[#ecddc7] shadow-lg text-center space-y-4 max-w-sm w-full mx-4">
          <span className="text-5xl block">🛕</span>
          <h1 className="text-xl font-bold text-[#8a2e13]">Shri Mallikarjun Admin</h1>
          <p className="text-xs text-gray-500 font-medium">Select your role to continue in development mode</p>
          <div className="space-y-2">
            {(["SUPER_ADMIN", "TRUST_ADMIN", "STAFF"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setStubRole(role).then(() => getCurrentUser().then(setUser))}
                className="w-full py-2 px-4 bg-[#8a2e13] text-[#fbf6ec] font-bold text-xs rounded-lg hover:bg-[#c25a22] transition-all"
              >
                Login as {role}
              </button>
            ))}
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
