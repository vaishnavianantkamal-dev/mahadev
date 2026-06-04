import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, CalendarRange, Users, Bed, PlusCircle, Send, BookOpen, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/api/dashboard";
import DashboardCharts from "@/components/DashboardCharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[#ecddc7] rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white h-28 rounded-xl border border-[#ecddc7]" />
          ))}
        </div>
        <div className="bg-white h-64 rounded-xl border border-[#ecddc7]" />
      </div>
    );
  }

  const kpis = [
    { name: "Donations (This Month)", value: formatCurrency(stats.monthlyDonations), icon: HeartHandshake, color: "bg-red-50 text-[#8a2e13] border-red-100", description: "Validated online & cash entries" },
    { name: "Bookings (This Week)", value: stats.weeklyBookings?.toString(), icon: CalendarRange, color: "bg-amber-50 text-[#c25a22] border-amber-100", description: "Pooja & Abhishek reservations" },
    { name: "Total Devotees in CRM", value: stats.totalDevotees?.toString(), icon: Users, color: "bg-yellow-50 text-[#bf8f2e] border-yellow-100", description: "Deduplicated devotee accounts" },
    { name: "Bhakta Niwas Rooms Active", value: stats.roomsOccupiedToday?.toString(), icon: Bed, color: "bg-emerald-50 text-[#1faa59] border-emerald-100", description: "Occupancy check-ins active today" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#8a2e13]">Administrative Center</h1>
        <p className="text-sm text-gray-500 font-medium">Quick indicators, real-time ledger records, and analytics dashboard.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.name} className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
              <div className={`p-3 rounded-lg border ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{kpi.name}</p>
                <h3 className="text-2xl font-bold mt-1 text-[#2a1810]">{kpi.value}</h3>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <DashboardCharts donationsHistory={stats.donationsHistory || []} bookingsByCategory={stats.bookingsByCategory || []} />

      {/* Bottom split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <h3 className="text-base font-bold text-[#8a2e13] mb-4">Live Activity Streams</h3>
          {!stats.recentActivity?.length ? (
            <div className="py-12 text-center text-sm text-gray-400 font-medium">
              No recent activity recorded. Run seed scripts or create bookings to populate logs.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border border-[#ecddc7]/50 bg-[#fbf6ec]/20 hover:bg-[#fbf6ec]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {activity.type === "donation" ? "❤️" : activity.type === "booking" ? "🕉️" : "🛏️"}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#2a1810]">{activity.title}</p>
                      <p className="text-[10px] text-gray-500 font-semibold">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#8a2e13]">{formatCurrency(activity.amount)}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 font-medium">
                      {new Date(activity.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#8a2e13] mb-4">Counter Operations</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">Frequent actions performed at the temple counter for walk-in devotees.</p>
            <div className="space-y-3">
              {[
                { to: "/admin/bookings", icon: PlusCircle, label: "New Pooja Booking" },
                { to: "/admin/donations", icon: HeartHandshake, label: "Record Cash Donation" },
                { to: "/admin/communication", icon: Send, label: "Draft Broadcast Message" },
                { to: "/admin/accounts", icon: BookOpen, label: "Audit Ledger Records" },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="flex items-center gap-3 w-full p-3 rounded-lg border border-[#ecddc7] text-xs font-bold hover:bg-[#8a2e13] hover:text-[#fbf6ec] hover:border-[#8a2e13] transition-all">
                  <Icon className="w-4 h-4 text-[#bf8f2e]" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-[#ecddc7]/50 pt-4 flex items-center gap-2 text-[10px] text-gray-400 font-semibold uppercase">
            <TrendingUp className="w-4 h-4 text-[#1faa59]" />
            Security & audit logs are active
          </div>
        </div>
      </div>
    </div>
  );
}
