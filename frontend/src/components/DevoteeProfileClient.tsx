import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import DevoteeModal from "./DevoteeModal";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  BookOpen, 
  Calendar, 
  Bed, 
  HeartHandshake, 
  Edit,
  Loader
} from "lucide-react";
import { getDevotee } from "@/api/devotees";

type DevoteeSource = "WEBSITE" | "WALKIN" | "CAMP" | "REFERRAL";

export default function DevoteeProfileClient() {
  const { id } = useParams<{ id: string }>();
  const [devotee, setDevotee] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "rooms" | "donations">("bookings");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getDevotee(id)
        .then((data) => {
          setDevotee(data);
        })
        .catch((err) => {
          console.error("Failed to load devotee profile:", err);
        })
        .finally(() => setLoadingData(false));
    }
  }, [id]);


  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loadingData || !devotee) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#fbf6ec]/10 border border-[#ecddc7] rounded-xl p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-[#8a2e13] animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading devotee profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/admin/devotees" 
          className="inline-flex items-center gap-1 text-xs font-bold text-[#8a2e13] hover:text-[#c25a22]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Devotees CRM
        </Link>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Profile details card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm relative">
            <button 
              onClick={() => setModalOpen(true)}
              className="absolute top-4 right-4 p-2 rounded-lg border border-[#ecddc7] bg-white text-gray-500 hover:text-[#8a2e13] hover:bg-[#fbf6ec]/35 transition-colors"
              title="Edit Profile Details"
            >
              <Edit className="w-4 h-4" />
            </button>

            <div className="text-center pb-6 border-b border-[#ecddc7]/30">
              <div className="w-16 h-16 rounded-full bg-[#8a2e13]/10 border border-[#8a2e13]/25 text-[#8a2e13] flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                {devotee.name.charAt(0)}
              </div>
              <h2 className="text-base font-bold text-[#2a1810]">{devotee.name}</h2>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#fbf6ec] border border-[#ecddc7] text-[#bf8f2e]">
                Source: {devotee.source}
              </span>
            </div>

            {/* Profile Meta Info */}
            <div className="py-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                  <p className="font-semibold text-gray-700">{devotee.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                  <p className="font-semibold text-gray-700">{devotee.email || "No email registered"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">City / Village</p>
                  <p className="font-semibold text-gray-700">{devotee.city || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Gotra Lineage</p>
                  <p className="font-semibold text-[#8a2e13]">{devotee.gotra || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Contribution Metric */}
            <div className="bg-[#fbf6ec] border border-[#ecddc7] p-4 rounded-lg text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Total Lifetime Contributions</p>
              <h4 className="text-xl font-bold text-[#8a2e13] mt-1">{formatCurrency(devotee.totalDonations)}</h4>
            </div>

            {/* Notes Section */}
            {devotee.notes && (
              <div className="mt-6 pt-6 border-t border-[#ecddc7]/30">
                <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-2">Administrative Notes</h4>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 whitespace-pre-wrap">
                  {devotee.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side history tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#ecddc7] shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            
            {/* Tabs Header */}
            <div className="flex border-b border-[#ecddc7] bg-[#fbf6ec]">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === "bookings"
                    ? "border-[#8a2e13] text-[#8a2e13] bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Pooja Bookings ({devotee.bookings.length})
              </button>
              <button
                onClick={() => setActiveTab("rooms")}
                className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === "rooms"
                    ? "border-[#8a2e13] text-[#8a2e13] bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Bed className="w-4 h-4" />
                Room Bookings ({devotee.roomBookings.length})
              </button>
              <button
                onClick={() => setActiveTab("donations")}
                className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === "donations"
                    ? "border-[#8a2e13] text-[#8a2e13] bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                Donations ({devotee.donations.length})
              </button>
            </div>

            {/* Tab content panel */}
            <div className="p-6 flex-1">
              
              {/* Pooja Bookings list */}
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  {devotee.bookings.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                      No Pooja or Abhishek bookings recorded for this devotee.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {devotee.bookings.map((booking: any) => (
                        <div key={booking.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                          <div>
                            <p className="text-xs font-bold text-[#2a1810]">{booking.serviceType.name}</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              Date: {formatDate(booking.date)} {booking.slotLabel ? `| Slot: ${booking.slotLabel}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#8a2e13]">{formatCurrency(booking.amount)}</p>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              booking.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              booking.status === "CANCELLED" ? "bg-gray-50 text-gray-500 border border-gray-150" :
                              "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Room bookings list */}
              {activeTab === "rooms" && (
                <div className="space-y-4">
                  {devotee.roomBookings.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                      No Bhakta Niwas room bookings recorded for this devotee.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {devotee.roomBookings.map((rb: any) => (
                        <div key={rb.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                          <div>
                            <p className="text-xs font-bold text-[#2a1810]">{rb.room.name}</p>
                            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                              Room Type: {rb.room.roomType} | stay: {formatDate(rb.checkIn)} to {formatDate(rb.checkOut)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#8a2e13]">{formatCurrency(rb.amount)}</p>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              rb.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              rb.status === "CANCELLED" ? "bg-gray-50 text-gray-500 border border-gray-150" :
                              "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {rb.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Donations list */}
              {activeTab === "donations" && (
                <div className="space-y-4">
                  {devotee.donations.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                      No donation payments recorded for this devotee.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {devotee.donations.map((don: any) => (
                        <div key={don.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                          <div>
                            <p className="text-xs font-bold text-[#2a1810]">
                              Receipt #{don.receiptNo}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                              Purpose: <span className="font-bold text-[#bf8f2e]">{don.purpose || "General Development"}</span> | Date: {formatDate(don.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#8a2e13]">{formatCurrency(don.amount)}</p>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100`}>
                              SUCCESS
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      <DevoteeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        devotee={{
          id: devotee.id,
          name: devotee.name,
          phone: devotee.phone,
          email: devotee.email,
          city: devotee.city,
          gotra: devotee.gotra,
          notes: devotee.notes,
          source: devotee.source,
          consentWhatsapp: devotee.consentWhatsapp,
        }}
      />
    </div>
  );
}
