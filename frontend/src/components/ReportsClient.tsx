import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { getReports } from "@/api/reports";
import {
  TrendingUp,
  Download,
  Search,
  ShieldAlert,
  Calendar,
  Users,
  DollarSign,
  Filter,
  PieChart as PieIcon,
  Activity,
  FileText,
  Loader,
} from "lucide-react";

interface AuditLogRow {
  id: string;
  createdAt: Date | string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  meta: any;
}

interface LedgerSummaryRow {
  date: string;
  credit: number;
  debit: number;
}

interface CategoryShareRow {
  name: string;
  value: number;
}

interface CityShareRow {
  name: string;
  value: number;
}

interface SourceShareRow {
  name: string;
  value: number;
}

const COLORS = ["#8a2e13", "#c25a22", "#bf8f2e", "#e6c878", "#1faa59", "#2a1810", "#4f46e5", "#06b6d4"];

export default function ReportsClient() {
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [ledgerTrends, setLedgerTrends] = useState<LedgerSummaryRow[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryShareRow[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryShareRow[]>([]);
  const [devoteeCityStats, setDevoteeCityStats] = useState<CityShareRow[]>([]);
  const [devoteeSourceStats, setDevoteeSourceStats] = useState<SourceShareRow[]>([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    avgDonation: 0,
    avgDevoteeValue: 0,
    totalPoojaSales: 0,
    totalRoomSales: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    getReports()
      .then((data) => {
        setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
        setLedgerTrends(Array.isArray(data.ledgerTrends) ? data.ledgerTrends : []);
        setIncomeBreakdown(Array.isArray(data.incomeBreakdown) ? data.incomeBreakdown : []);
        setExpenseBreakdown(Array.isArray(data.expenseBreakdown) ? data.expenseBreakdown : []);
        setDevoteeCityStats(Array.isArray(data.devoteeCityStats) ? data.devoteeCityStats : []);
        setDevoteeSourceStats(Array.isArray(data.devoteeSourceStats) ? data.devoteeSourceStats : []);
        if (data.summaryMetrics) {
          setSummaryMetrics(data.summaryMetrics);
        }
      })
      .catch((err) => {
        console.error("Failed to load reports:", err);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const [activeTab, setActiveTab] = useState<"financial" | "devotees" | "audit">("financial");
  const [isMounted, setIsMounted] = useState(false);
  
  // Audit Logs Search & Filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [auditEntityFilter, setAuditEntityFilter] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const term = auditSearch.toLowerCase();
    const actionMatch = auditActionFilter ? log.action === auditActionFilter : true;
    const entityMatch = auditEntityFilter ? log.entity === auditEntityFilter : true;
    const searchMatch =
      (log.userId && log.userId.toLowerCase().includes(term)) ||
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term) ||
      (log.entityId && log.entityId.toLowerCase().includes(term)) ||
      (log.meta && JSON.stringify(log.meta).toLowerCase().includes(term));
    return actionMatch && entityMatch && searchMatch;
  });

  // Extract unique actions & entities for dropdown filters
  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action)));
  const uniqueEntities = Array.from(new Set(auditLogs.map((l) => l.entity)));

  // Export Audit Logs to CSV
  const exportAuditLogsCSV = () => {
    const headers = ["Timestamp", "Actor / Clerk ID", "Action", "Entity Type", "Entity ID", "Meta Info"];
    const rows = filteredAuditLogs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.userId || "SYSTEM",
      log.action,
      log.entity,
      log.entityId || "",
      log.meta ? JSON.stringify(log.meta).replace(/"/g, '""') : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `temple_audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Ledger Summary to CSV
  const exportLedgerSummaryCSV = () => {
    const headers = ["Period / Date", "Income (Credits)", "Expense (Debits)", "Net Savings"];
    const rows = ledgerTrends.map((trend) => [
      trend.date,
      trend.credit,
      trend.debit,
      trend.credit - trend.debit,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `temple_financial_trends_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#fbf6ec]/10 border border-[#ecddc7] rounded-xl p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-[#8a2e13] animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading audit and reports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#2a1810]">
      {/* Upper Navigation Tabs */}
      <div className="flex border-b border-[#ecddc7] bg-white rounded-t-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab("financial")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "financial"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Financial & Sales Analytics
        </button>
        <button
          onClick={() => setActiveTab("devotees")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "devotees"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Devotee & Operations Demographics
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "audit"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          System Audit Trail
        </button>
      </div>

      {/* TAB 1: FINANCIAL & SALES ANALYTICS */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#ecddc7] shadow-sm">
              <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Average Donation</span>
              <h3 className="text-xl font-bold mt-1 text-[#8a2e13]">{formatCurrency(summaryMetrics.avgDonation)}</h3>
              <p className="text-[9px] text-gray-400 mt-1 font-semibold">Per successful donation receipt</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#ecddc7] shadow-sm">
              <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Average Devotee Value</span>
              <h3 className="text-xl font-bold mt-1 text-[#bf8f2e]">{formatCurrency(summaryMetrics.avgDevoteeValue)}</h3>
              <p className="text-[9px] text-gray-400 mt-1 font-semibold">Lifetime contributions per profile</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#ecddc7] shadow-sm">
              <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pooja Booking Sales</span>
              <h3 className="text-xl font-bold mt-1 text-[#1faa59]">{formatCurrency(summaryMetrics.totalPoojaSales)}</h3>
              <p className="text-[9px] text-gray-400 mt-1 font-semibold">Confirmed poojas & abhisheks</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#ecddc7] shadow-sm">
              <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Room Stay Sales</span>
              <h3 className="text-xl font-bold mt-1 text-[#c25a22]">{formatCurrency(summaryMetrics.totalRoomSales)}</h3>
              <p className="text-[9px] text-gray-400 mt-1 font-semibold">Bhakta Niwas accommodation receipts</p>
            </div>
          </div>

          {/* Recharts Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Income & Expense History Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#8a2e13]">Income & Expense Audit Trends</h3>
                <button
                  onClick={exportLedgerSummaryCSV}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-[#ecddc7] rounded-lg text-[10px] font-bold text-[#bf8f2e] hover:bg-[#8a2e13] hover:text-white transition-all"
                >
                  <Download className="w-3 h-3" /> Export Financial Trend
                </button>
              </div>

              {!isMounted ? (
                <div className="h-[280px] flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded-lg animate-pulse">
                  Loading financial charts...
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ledgerTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ecddc7" vertical={false} />
                      <XAxis dataKey="date" stroke="#2a1810" fontSize={10} tickLine={false} />
                      <YAxis stroke="#2a1810" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          formatCurrency(Number(value || 0)),
                          name === "credit" ? "Income (Credits)" : "Expense (Debits)",
                        ]}
                        contentStyle={{ backgroundColor: "#fbf6ec", borderColor: "#ecddc7", borderRadius: "8px" }}
                        labelStyle={{ fontWeight: "bold", color: "#8a2e13" }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                          <span className="text-xs font-bold text-gray-600 uppercase">
                            {value === "credit" ? "Credits (Income)" : "Debits (Expenses)"}
                          </span>
                        )}
                      />
                      <Bar dataKey="credit" fill="#1faa59" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="debit" fill="#8a2e13" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Income Shares Category Chart */}
            <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Income Sources Breakdown</h3>

              {!isMounted ? (
                <div className="h-[200px] flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded-lg animate-pulse">
                  Loading income share...
                </div>
              ) : (
                <div className="h-[200px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {incomeBreakdown.map((entry, index) => (
                          <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [formatCurrency(Number(v)), "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Legend details */}
              <div className="mt-4 space-y-1.5 text-[10px] font-semibold">
                {incomeBreakdown.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#8a2e13]">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row: Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expense breakdown chart */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Expense Categories Distribution</h3>

              {!isMounted ? (
                <div className="h-[200px] flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded-lg animate-pulse">
                  Loading expense shares...
                </div>
              ) : (
                <div className="h-[200px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-expense-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [formatCurrency(Number(v)), "Spent"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-4 space-y-1.5 text-[10px] font-semibold">
                {expenseBreakdown.length === 0 ? (
                  <p className="text-center text-gray-400 py-3">No expenses recorded yet.</p>
                ) : (
                  expenseBreakdown.map((item, idx) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }}
                        />
                        <span className="text-gray-600 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-red-600">{formatCurrency(item.value)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* General transparency notes & instructions */}
            <div className="lg:col-span-2 bg-[#fbf6ec]/40 p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-center space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#bf8f2e] flex items-center gap-2">
                <Activity className="w-4 h-4" /> Transparency & Financial Auditing Guidelines
              </h4>
              <p className="text-xs leading-relaxed text-gray-600 font-semibold">
                Shri Mallikarjun Devasthan operates on an open-ledger policy. All donations made online or counter-cash
                automatically insert matching ledger transactions. Debits/expenses logged in the system must be backed by official
                vendor receipts and certified by the Trust Accountant Devidas Kulkarni.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] font-bold text-gray-500">
                <div className="p-3 bg-white border border-[#ecddc7] rounded-lg">
                  <span className="text-[#8a2e13] block text-xs">Section 80G Compliant</span>
                  All donations qualify for tax exemption certificates. E-receipt PDFs are generated using strict cryptography hashes.
                </div>
                <div className="p-3 bg-white border border-[#ecddc7] rounded-lg">
                  <span className="text-[#8a2e13] block text-xs">Zero Cash Discrepancy</span>
                  Every counter cash transaction requires staff verification. End-of-day balances must match physical vaults.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVOTEE & OPERATIONS DEMOGRAPHICS */}
      {activeTab === "devotees" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Devotees City Distribution */}
            <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Devotees Geographical Distribution (Top Cities)</h3>

              {!isMounted ? (
                <div className="h-[250px] flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded-lg animate-pulse">
                  Loading city distributions...
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={devoteeCityStats} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ecddc7" horizontal={false} />
                      <XAxis type="number" stroke="#2a1810" fontSize={10} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#2a1810" fontSize={10} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [`${val} devotees`, "Total"]}
                        contentStyle={{ backgroundColor: "#fbf6ec", borderColor: "#ecddc7" }}
                      />
                      <Bar dataKey="value" fill="#c25a22" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Devotees Source Distribution */}
            <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Registration Channels (Acquisition)</h3>

              {!isMounted ? (
                <div className="h-[220px] flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded-lg animate-pulse">
                  Loading registration source distribution...
                </div>
              ) : (
                <div className="h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devoteeSourceStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {devoteeSourceStats.map((entry, index) => (
                          <Cell key={`cell-source-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => [`${val} profiles`, "Volume"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold">
                {devoteeSourceStats.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-gray-600 truncate">{item.name}: <span className="text-[#8a2e13]">{item.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operational highlights */}
          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#8a2e13] border-b border-[#ecddc7]/30 pb-3">Operational Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-gray-600">
              <div className="p-4 border border-[#ecddc7] rounded-xl space-y-2 bg-[#fbf6ec]/20">
                <span className="text-[#8a2e13] font-bold text-sm block">95%+ WhatsApp Consent Rate</span>
                <p className="text-[10px] text-gray-500">Devotees opt-in for automated e-receipts and festival invitations via Whatsapp alerts.</p>
              </div>
              <div className="p-4 border border-[#ecddc7] rounded-xl space-y-2 bg-[#fbf6ec]/20">
                <span className="text-[#8a2e13] font-bold text-sm block">Deduplication Success</span>
                <p className="text-[10px] text-gray-500">Auto-merging guest phone records during book/checkout prevents duplicate profiles in database CRM.</p>
              </div>
              <div className="p-4 border border-[#ecddc7] rounded-xl space-y-2 bg-[#fbf6ec]/20">
                <span className="text-[#8a2e13] font-bold text-sm block">Bilingual Outreach</span>
                <p className="text-[10px] text-gray-500">Public portal supports quick Marathi/English toggling, increasing visitor convenience and bookings.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          {/* Controls & Search row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border border-[#ecddc7] rounded-xl shadow-sm">
            <div className="flex items-center gap-2 border border-[#ecddc7]/70 px-3 py-2 rounded-lg bg-gray-50 md:col-span-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit trail by actor, entity ID, or meta message..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
            <div>
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="w-full p-2 border border-[#ecddc7] rounded-lg text-xs bg-white focus:outline-none focus:border-[#8a2e13]"
              >
                <option value="">All Actions</option>
                {uniqueActions.map((act) => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={auditEntityFilter}
                onChange={(e) => setAuditEntityFilter(e.target.value)}
                className="w-full p-2 border border-[#ecddc7] rounded-lg text-xs bg-white focus:outline-none focus:border-[#8a2e13]"
              >
                <option value="">All Entities</option>
                {uniqueEntities.map((ent) => (
                  <option key={ent} value={ent}>{ent}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-bold text-gray-500">Showing {filteredAuditLogs.length} audit trail records</p>
            <button
              onClick={exportAuditLogsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ecddc7] bg-white text-[#bf8f2e] text-xs font-bold rounded-lg hover:bg-[#8a2e13] hover:text-[#fbf6ec] hover:border-[#8a2e13] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Audit Logs CSV
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-xl border border-[#ecddc7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-xs font-bold text-[#8a2e13]">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Action Event</th>
                    <th className="p-4">Entity Type</th>
                    <th className="p-4">Entity ID Reference</th>
                    <th className="p-4">Meta Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecddc7]/30 text-xs">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-medium font-semibold">
                        No system audit records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#fbf6ec]/10 transition-colors">
                        <td className="p-4 font-semibold text-gray-500">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="p-4 font-bold text-gray-700">
                          {log.userId || "SYSTEM"}
                        </td>
                        <td className="p-4 font-bold text-[#8a2e13]">
                          {log.action}
                        </td>
                        <td className="p-4 font-semibold text-gray-600">
                          {log.entity}
                        </td>
                        <td className="p-4 font-mono text-gray-400 text-[10px] break-all select-all">
                          {log.entityId || "-"}
                        </td>
                        <td className="p-4 text-gray-500 max-w-[240px] truncate font-medium" title={JSON.stringify(log.meta)}>
                          {JSON.stringify(log.meta)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
