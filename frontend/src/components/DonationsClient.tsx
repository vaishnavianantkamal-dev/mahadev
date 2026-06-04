import React, { useState, useEffect } from "react";
import { createCounterDonation, getDonations } from "@/api/donations";
import { getDevotees } from "@/api/devotees";
import { HeartHandshake, List, Plus, Search, CheckCircle2, Loader } from "lucide-react";

type DonationStatus = "PENDING" | "SUCCESS" | "FAILED";

interface DonationRow {
  id: string; donorName: string; phone: string; email: string | null;
  amount: string; purpose: string | null; status: DonationStatus;
  receiptNo: string; createdAt: string;
  devotee: { name: string } | null;
}
interface DevoteeOption { id: string; name: string; phone: string; }

export default function DonationsClient() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [devotees, setDevotees] = useState<DevoteeOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getDonations().catch(() => []),
      getDevotees().catch(() => []),
    ]).then(([dList, devList]) => {
      setDonations(Array.isArray(dList) ? dList : []);
      setDevotees(Array.isArray(devList) ? devList : []);
    }).finally(() => setLoadingData(false));
  }, []);

  // Form states
  const [selectedDevoteeId, setSelectedDevoteeId] = useState("");
  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(100);
  const [purpose, setPurpose] = useState("General Development");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Currency formatter
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

  // Filter list
  const filtered = donations.filter((d) => {
    const s = search.toLowerCase();
    return (
      d.donorName.toLowerCase().includes(s) ||
      d.phone.includes(s) ||
      d.receiptNo.toLowerCase().includes(s) ||
      (d.purpose && d.purpose.toLowerCase().includes(s))
    );
  });

  // Autofill form if Devotee is selected from CRM
  const handleDevoteeSelect = (id: string) => {
    setSelectedDevoteeId(id);
    if (!id) {
      setDonorName("");
      setPhone("");
      setEmail("");
      return;
    }
    const dev = devotees.find((d) => d.id === id);
    if (dev) {
      setDonorName(dev.name);
      setPhone(dev.phone);
      // We will look up email if stored, or allow staff input
      const matchedDevFull = donations.find((don: DonationRow) => don.devotee?.name === dev.name);
      setEmail(matchedDevFull?.email || "");
    }
  };

  // Action: submit donation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);

    const res = await createCounterDonation({
      donorName,
      phone,
      email,
      amount: Number(amount),
      purpose,
    });

    setLoading(false);

    if (res.success && res.donation) {
      setFormSuccess(`Recorded successfully! Assigning Receipt Number: ${res.donation.receiptNo}`);
      
      const newD: DonationRow = {
        id: res.donation.id,
        donorName: res.donation.donorName,
        phone: res.donation.phone,
        email: res.donation.email,
        amount: res.donation.amount.toString(),
        purpose: res.donation.purpose,
        status: res.donation.status,
        receiptNo: res.donation.receiptNo,
        createdAt: res.donation.createdAt,
        devotee: selectedDevoteeId ? { name: donorName } : null,
      };

      setDonations([newD, ...donations]);
      // Reset form
      setSelectedDevoteeId("");
      setDonorName("");
      setPhone("");
      setEmail("");
      setAmount(100);
      setPurpose("General Development");
    } else {
      setFormError(res.error || "Failed to record donation");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
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
          Donations Registry
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
          Record Counter Donation
        </button>
      </div>

      {/* VIEW: DONATIONS REGISTRY */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-white border border-[#ecddc7] rounded-xl shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt number, donor name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-xl border border-[#ecddc7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-xs font-bold text-[#8a2e13]">
                    <th className="p-4">Receipt Details</th>
                    <th className="p-4">Donor Info</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Receipt E-Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecddc7]/30 text-xs">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                        No donation records found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d) => (
                      <tr key={d.id} className="hover:bg-[#fbf6ec]/20 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#2a1810]">{d.receiptNo}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(d.createdAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{d.donorName}</div>
                          <div className="text-[10px] text-gray-500 font-semibold">{d.phone}</div>
                        </td>
                        <td className="p-4 font-semibold text-gray-600">
                          {d.purpose || "General Development"}
                        </td>
                        <td className="p-4 text-right font-bold text-[#8a2e13]">
                          {formatCurrency(d.amount)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                            d.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            d.status === "FAILED" ? "bg-red-50 text-red-700 border border-red-100" :
                            "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <a
                            href={`/receipts/${d.receiptNo}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#bf8f2e] hover:underline"
                          >
                            PDF Receipt
                          </a>
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

      {/* VIEW: RECORD COUNTER DONATION */}
      {activeTab === "new" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-[#ecddc7]/30 pb-4">
            <HeartHandshake className="w-6 h-6 text-[#8a2e13]" />
            <div>
              <h3 className="text-base font-bold text-[#8a2e13]">Record Cash/Counter Donation</h3>
              <p className="text-xs text-gray-500 font-medium">Record hand-to-hand cash donations at the counter.</p>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-4">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Link Devotee (CRM Contact - Optional)</label>
              <select
                value={selectedDevoteeId}
                onChange={(e) => handleDevoteeSelect(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
              >
                <option value="">-- Standalone Devotee / Guest --</option>
                {devotees.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Donor Full Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Suresh Deshmukh"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Mobile Number *</label>
                <input
                  required
                  type="tel"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Email (Optional, for auto-emailing PDF)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Donation Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Donation Purpose *</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                >
                  <option value="General Development">General Development</option>
                  <option value="Annadaan (Mahaprasad)">Annadaan (Mahaprasad)</option>
                  <option value="Temple Renovation">Temple Renovation</option>
                  <option value="Gau Shala Maintenance">Gau Shala Maintenance</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Print Receipt & Send E-Copy
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
