import React, { useState, useEffect } from "react";
import { getLedgerEntries, createLedgerEntry, getAccountsSummary } from "@/api/accounts";
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  List,
  Search,
  Loader,
  CheckCircle2,
} from "lucide-react";

type LedgerEntryType = "CREDIT" | "DEBIT";

interface LedgerRow {
  id: string;
  entryType: LedgerEntryType;
  category: string;
  amount: string;
  source: string;
  referenceType: string | null;
  referenceId: string | null;
  date: string;
  note: string | null;
  createdBy: string | null;
}

interface SummaryProps {
  totalCredits: number;
  totalDebits: number;
  netBalance: number;
  monthlyCredits: number;
  monthlyDebits: number;
  monthlyNet: number;
}

const defaultSummary: SummaryProps = { totalCredits: 0, totalDebits: 0, netBalance: 0, monthlyCredits: 0, monthlyDebits: 0, monthlyNet: 0 };

export default function AccountsClient() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [summary, setSummary] = useState<SummaryProps>(defaultSummary);
  const [loadingData, setLoadingData] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  // Manual Entry Form
  const [entryType, setEntryType] = useState<LedgerEntryType>("DEBIT");
  const [category, setCategory] = useState("Grocery");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [source, setSource] = useState("COUNTER");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      getLedgerEntries().catch(() => []),
      getAccountsSummary().catch(() => defaultSummary),
    ]).then(([entries, summaryData]) => {
      setLedger(Array.isArray(entries) ? entries : []);
      setSummary(summaryData || defaultSummary);
    }).finally(() => setLoadingData(false));
  }, []);

  // Formatter
  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter ledger list
  const filtered = ledger.filter((item) => {
    const s = search.toLowerCase();
    const matchesSearch = item.category.toLowerCase().includes(s) || (item.note && item.note.toLowerCase().includes(s));
    const matchesType = typeFilter ? item.entryType === typeFilter : true;
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Action: submit manual entry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const finalCategory = category === "Other" ? customCategory : category;
    if (!finalCategory) {
      setError("Please specify a category name");
      setLoading(false);
      return;
    }

    const res = await createLedgerEntry({
      entryType,
      category: finalCategory,
      amount: Number(amount),
      source,
      note,
    });

    setLoading(false);

    if (res.success && res.entry) {
      setSuccess(true);
      const newE: LedgerRow = {
        id: res.entry.id,
        entryType: res.entry.entryType,
        category: res.entry.category,
        amount: res.entry.amount.toString(),
        source: res.entry.source,
        referenceType: null,
        referenceId: null,
        date: res.entry.date,
        note: res.entry.note,
        createdBy: res.entry.createdBy,
      };
      setLedger([newE, ...ledger]);
      // Reset form
      setAmount(0);
      setNote("");
      setCustomCategory("");
    } else {
      setError(res.error || "Failed to save ledger transaction");
    }
  };

  // Client-side CSV Exporter
  const exportToCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount (INR)", "Payment Source", "Notes", "Recorded By"];
    const rows = filtered.map((item) => [
      new Date(item.date).toISOString().split("T")[0],
      item.entryType,
      item.category,
      item.amount,
      item.source,
      item.note || "",
      item.createdBy || "SYSTEM",
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `temple_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique categories for filter select dropdown
  const uniqueCategories = Array.from(new Set(ledger.map((l) => l.category)));

  return (
    <div className="space-y-6">
      {/* Summary dashboard widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Lifetime Credit Receipts</p>
              <h3 className="text-2xl font-bold mt-1 text-[#1faa59]">{formatCurrency(summary.totalCredits)}</h3>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold">Current Month: {formatCurrency(summary.monthlyCredits)}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-[#1faa59] rounded-lg border border-emerald-100">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Lifetime Debits / Outflows</p>
              <h3 className="text-2xl font-bold mt-1 text-[#8a2e13]">{formatCurrency(summary.totalDebits)}</h3>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold">Current Month: {formatCurrency(summary.monthlyDebits)}</p>
            </div>
            <div className="p-2.5 bg-red-50 text-[#8a2e13] rounded-lg border border-red-100">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm bg-gradient-to-br from-white to-[#fbf6ec]/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Net Audit Balance</p>
              <h3 className="text-2xl font-bold mt-1 text-[#bf8f2e]">{formatCurrency(summary.netBalance)}</h3>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold">Current Month: {formatCurrency(summary.monthlyNet)}</p>
            </div>
            <div className="p-2.5 bg-yellow-50 text-[#bf8f2e] rounded-lg border border-yellow-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-[#ecddc7] bg-white rounded-t-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "list"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <List className="w-4 h-4" />
          Double Entry Ledger
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "new"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Plus className="w-4 h-4" />
          Record Expense / Debit
        </button>
      </div>

      {/* VIEW: DOUBLE ENTRY LEDGER */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Filters row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border border-[#ecddc7] rounded-xl shadow-sm">
            <div className="flex items-center gap-2 border border-[#ecddc7]/70 px-3 py-2 rounded-lg bg-gray-50 md:col-span-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search ledger logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-[#ecddc7] rounded-lg text-xs bg-white focus:outline-none focus:border-[#8a2e13]"
              >
                <option value="">All Transactions</option>
                <option value="CREDIT">Credits (Income)</option>
                <option value="DEBIT">Debits (Expenses)</option>
              </select>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-[#ecddc7] rounded-lg text-xs bg-white focus:outline-none focus:border-[#8a2e13]"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Export & Ledger listing */}
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-bold text-gray-500">Showing {filtered.length} audit records</p>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ecddc7] bg-white text-[#bf8f2e] text-xs font-bold rounded-lg hover:bg-[#8a2e13] hover:text-[#fbf6ec] hover:border-[#8a2e13] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV Ledger
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#ecddc7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-xs font-bold text-[#8a2e13]">
                    <th className="p-4">Date</th>
                    <th className="p-4">Reference / Cat</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4">Source</th>
                    <th className="p-4 text-right">Debit (Outflow)</th>
                    <th className="p-4 text-right">Credit (Receipt)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecddc7]/30 text-xs">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                        No transactions found matching the parameters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fbf6ec]/20 transition-colors">
                        <td className="p-4 font-semibold text-gray-600">
                          {formatDate(item.date)}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#2a1810]">{item.category}</div>
                          {item.referenceType && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] bg-[#fbf6ec] border border-[#ecddc7] text-gray-500 font-semibold">
                              {item.referenceType}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 max-w-[200px] truncate font-medium">
                          {item.note || "-"}
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-gray-50 border border-gray-150 text-gray-600 font-medium">
                            {item.source}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-red-600">
                          {item.entryType === "DEBIT" ? formatCurrency(item.amount) : "-"}
                        </td>
                        <td className="p-4 text-right font-bold text-emerald-600">
                          {item.entryType === "CREDIT" ? formatCurrency(item.amount) : "-"}
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

      {/* VIEW: RECORD EXPENSE/DEBIT */}
      {activeTab === "new" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <h3 className="text-base font-bold text-[#8a2e13] mb-4">Record General Ledger Outflow (Debit)</h3>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Debit transaction registered in temple accounts ledger successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Transaction Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                >
                  <option value="Grocery">Grocery / Kitchen stock</option>
                  <option value="Salary">Staff / Pandit Salary</option>
                  <option value="Electricity">Electricity / Utility bill</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Festival Expense">Festival Celebrations</option>
                  <option value="Other">Other Category...</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Outflow Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
            </div>

            {category === "Other" && (
              <div>
                <label className="block font-bold text-gray-500 mb-1">Specify Category Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Garden maintenance"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-500 mb-1">Payment Method / Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
              >
                <option value="COUNTER">Counter Cash Drawer</option>
                <option value="DIRECT">Direct Bank Transfer</option>
                <option value="UPI">Counter QR (UPI)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Receipt details / transaction notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Include invoice numbers, vendor names, or employee name..."
                rows={3}
                className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Save Debit Entry
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
