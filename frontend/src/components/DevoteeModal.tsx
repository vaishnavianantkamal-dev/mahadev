import React, { useState } from "react";
import { createDevotee, updateDevotee } from "@/api/devotees";
type DevoteeSource = "WEBSITE" | "WALKIN" | "CAMP" | "REFERRAL";
import { X, Loader } from "lucide-react";

interface DevoteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  devotee?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    city: string | null;
    gotra: string | null;
    notes: string | null;
    source: DevoteeSource;
    consentWhatsapp: boolean;
  };
}

export default function DevoteeModal({ isOpen, onClose, devotee }: DevoteeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      city: formData.get("city") as string,
      gotra: formData.get("gotra") as string,
      notes: formData.get("notes") as string,
      source: formData.get("source") as DevoteeSource,
      consentWhatsapp: formData.get("consentWhatsapp") === "true",
    };

    let res;
    if (devotee) {
      res = await updateDevotee(devotee.id, data);
    } else {
      res = await createDevotee(data);
    }

    setLoading(false);

    if (res.success) {
      const result = res as any;
      if (result.wasDeduplicated) {
        alert(`A devotee with phone ${data.phone} already exists. Record linked to: ${result.devotee.name}`);
      }
      onClose();
      window.location.reload();
    } else {
      setError((res as any).error || "An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-[#ecddc7] shadow-xl overflow-hidden text-[#2a1810]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#ecddc7] bg-[#fbf6ec]">
          <h3 className="text-base font-bold text-[#8a2e13]">
            {devotee ? "Edit Devotee Details" : "Register New Devotee"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name *</label>
            <input
              required
              type="text"
              name="name"
              defaultValue={devotee?.name}
              placeholder="e.g. Rajesh Anant Patil"
              className="w-full p-2.5 border border-[#ecddc7] rounded-lg text-sm bg-[#fbf6ec]/10 focus:outline-none focus:border-[#8a2e13]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mobile Number *</label>
              <input
                required
                type="tel"
                name="phone"
                defaultValue={devotee?.phone}
                placeholder="10-digit number"
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg text-sm bg-[#fbf6ec]/10 focus:outline-none focus:border-[#8a2e13]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                defaultValue={devotee?.email || ""}
                placeholder="name@example.com"
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg text-sm bg-[#fbf6ec]/10 focus:outline-none focus:border-[#8a2e13]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">City / Village</label>
              <input
                type="text"
                name="city"
                defaultValue={devotee?.city || ""}
                placeholder="e.g. Pune"
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg text-sm bg-[#fbf6ec]/10 focus:outline-none focus:border-[#8a2e13]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Gotra</label>
              <input
                type="text"
                name="gotra"
                defaultValue={devotee?.gotra || ""}
                placeholder="e.g. Kashyap"
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg text-sm bg-[#fbf6ec]/10 focus:outline-none focus:border-[#8a2e13]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Registration Source</label>
              <select
                name="source"
                defaultValue={devotee?.source || "WALKIN"}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg text-sm bg-white focus:outline-none focus:border-[#8a2e13]"
              >
                <option value="WEBSITE">Website Booking</option>
                <option value="WHATSAPP">WhatsApp chat</option>
                <option value="WALKIN">Counter Walkin</option>
                <option value="PHONE">Phone Call</option>
                <option value="IMPORT">CSV Import</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <input
                type="checkbox"
                name="consentWhatsapp"
                id="consentWhatsapp"
                value="true"
                defaultChecked={devotee ? devotee.consentWhatsapp : true}
                className="w-4 h-4 text-[#8a2e13] border-[#ecddc7] rounded focus:ring-[#8a2e13]"
              />
              <label htmlFor="consentWhatsapp" className="ml-2 text-xs font-semibold text-gray-600 cursor-pointer">
                WhatsApp updates consent
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Private admin notes</label>
            <textarea
              name="notes"
              defaultValue={devotee?.notes || ""}
              placeholder="Record details about gotras, family background, or pooja history..."
              rows={3}
              className="w-full p-2.5 border border-[#ecddc7] rounded-lg text-sm bg-[#fbf6ec]/10 focus:outline-none focus:border-[#8a2e13]"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ecddc7] bg-[#fbf6ec]/10 -mx-6 -mb-6 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#ecddc7] rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-[#8a2e13] text-[#fbf6ec] rounded-lg text-xs font-bold hover:bg-[#c25a22] transition-colors disabled:opacity-50"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {devotee ? "Save Changes" : "Register Devotee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
