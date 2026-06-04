import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DevoteeModal from "./DevoteeModal";
import { deleteDevotee, getDevotees } from "@/api/devotees";
import { Plus, Search, Trash2, Eye, UserCheck, Loader } from "lucide-react";
type DevoteeSource = "WEBSITE" | "WALKIN" | "CAMP" | "REFERRAL";

interface DevoteeRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  gotra: string | null;
  notes: string | null;
  source: DevoteeSource;
  consentWhatsapp: boolean;
  totalDonations: any; // Prisma.Decimal
  lastInteractionAt: Date;
}

export default function DevoteeListClient() {
  const [devotees, setDevotees] = useState<DevoteeRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getDevotees()
      .then((data) => {
        setDevotees(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch devotees:", err);
      })
      .finally(() => setLoadingData(false));
  }, []);


  const filtered = devotees.filter((d) => {
    const s = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(s) ||
      d.phone.includes(s) ||
      (d.city && d.city.toLowerCase().includes(s)) ||
      (d.gotra && d.gotra.toLowerCase().includes(s))
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete devotee ${name}? This will remove booking history as well.`)) {
      return;
    }
    const res = await deleteDevotee(id);
    if (res.success) {
      setDevotees(devotees.filter((d) => d.id !== id));
    } else {
      alert(res.error || "Failed to delete");
    }
  };

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#fbf6ec]/10 border border-[#ecddc7] rounded-xl p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-[#8a2e13] animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading devotee registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#8a2e13]">Devotee CRM Registry</h1>
          <p className="text-sm text-gray-500 font-medium">Search and manage contact sheets, gotra lineage, and historical donations.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8a2e13] text-[#fbf6ec] rounded-lg text-xs font-bold hover:bg-[#c25a22] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Devotee
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 p-3 bg-white border border-[#ecddc7] rounded-xl shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, gotra, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Devotees Table */}
      <div className="bg-white rounded-xl border border-[#ecddc7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-xs font-bold text-[#8a2e13]">
                <th className="p-4">Name & Gotra</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4">Source</th>
                <th className="p-4 text-right">Total Contributed</th>
                <th className="p-4 text-center">Consent</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecddc7]/30 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                    No devotees found. Click Add Devotee to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-[#fbf6ec]/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#2a1810]">{d.name}</div>
                      {d.gotra && (
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                          Gotra: <span className="font-bold">{d.gotra}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{d.phone}</div>
                      {d.email && <div className="text-[10px] text-gray-400">{d.email}</div>}
                    </td>
                    <td className="p-4 font-medium text-gray-600">{d.city || "-"}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#fbf6ec] border border-[#ecddc7] text-[#bf8f2e]">
                        {d.source}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-[#8a2e13]">
                      {formatCurrency(d.totalDonations)}
                    </td>
                    <td className="p-4 text-center">
                      {d.consentWhatsapp ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1faa59] bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                          <UserCheck className="w-3 h-3" /> WA Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                          No Updates
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/devotees/${d.id}`}
                          className="p-1.5 rounded-lg border border-[#ecddc7] bg-white text-gray-600 hover:bg-[#8a2e13] hover:text-[#fbf6ec] transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(d.id, d.name)}
                          className="p-1.5 rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DevoteeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
