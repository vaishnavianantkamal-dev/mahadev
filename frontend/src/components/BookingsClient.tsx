import React, { useState, useEffect } from "react";
import {
  getBookings,
  createBooking,
  updateBookingStatus,
  getServiceTypes,
  createServiceType,
} from "@/api/bookings";
import { getDevotees } from "@/api/devotees";
import {
  Plus,
  Search,
  Calendar,
  List,
  Settings,
  Check,
  X,
  CheckCircle2,
  Loader,
} from "lucide-react";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type ServiceCategory = "ABHISHEK" | "POOJA" | "MAHAPRASAD" | "OTHER";

interface DevoteeOption { id: string; name: string; phone: string; }
interface ServiceOption { id: string; name: string; price: string; slotCapacity: number; category: ServiceCategory; }
interface BookingRow {
  id: string; date: string; slotLabel: string | null; quantity: number;
  amount: string; status: BookingStatus; notes: string | null; paymentId: string | null;
  devotee: { name: string; phone: string }; serviceType: { name: string };
}

export default function BookingsClient() {
  const [activeTab, setActiveTab] = useState<"list" | "calendar" | "services" | "new">("list");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [devotees, setDevotees] = useState<DevoteeOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // New Booking Form
  const [selectedDevoteeId, setSelectedDevoteeId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  const [bookingQty, setBookingQty] = useState(1);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Service Form
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>("POOJA");
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [newServiceCapacity, setNewServiceCapacity] = useState(50);
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [serviceError, setServiceError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getBookings().catch(() => []),
      getDevotees().catch(() => []),
      getServiceTypes().catch(() => []),
    ]).then(([bList, dList, sList]) => {
      setBookings(Array.isArray(bList) ? bList : []);
      setDevotees(Array.isArray(dList) ? dList : []);
      setServices(Array.isArray(sList) ? sList : []);
    }).finally(() => setLoadingData(false));
  }, []);

  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const filteredBookings = bookings.filter((b) => {
    const devName = b.devotee?.name?.toLowerCase() || "";
    const devPhone = b.devotee?.phone || "";
    const query = searchQuery.toLowerCase();
    return (
      (devName.includes(query) || devPhone.includes(query)) &&
      (selectedServiceFilter ? b.serviceType?.name === selectedServiceFilter : true) &&
      (selectedStatusFilter ? b.status === selectedStatusFilter : true)
    );
  });

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    const res = await updateBookingStatus(id, status);
    if (res.success) {
      setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b));
    } else {
      alert(res.error || "Failed to update status");
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(false);
    if (!selectedDevoteeId || !selectedServiceId || !bookingDate) {
      setBookingError("Please select a devotee, service, and date.");
      return;
    }
    setSubmitting(true);
    const res = await createBooking({
      devoteeId: selectedDevoteeId,
      serviceTypeId: selectedServiceId,
      date: new Date(bookingDate).toISOString(),
      slotLabel: bookingSlot,
      quantity: Number(bookingQty),
      notes: bookingNotes,
    });
    setSubmitting(false);
    if (res.success && res.booking) {
      setBookingSuccess(true);
      const devotee = devotees.find((d) => d.id === selectedDevoteeId)!;
      const service = services.find((s) => s.id === selectedServiceId)!;
      setBookings([{
        id: res.booking.id, date: res.booking.date, slotLabel: res.booking.slotLabel,
        quantity: res.booking.quantity, amount: res.booking.amount, status: res.booking.status,
        notes: res.booking.notes, paymentId: res.booking.paymentId,
        devotee: { name: devotee?.name || "", phone: devotee?.phone || "" },
        serviceType: { name: service?.name || "" },
      }, ...bookings]);
      setSelectedDevoteeId(""); setSelectedServiceId(""); setBookingDate(""); setBookingSlot(""); setBookingQty(1); setBookingNotes("");
    } else {
      setBookingError(res.error || "Overbooked capacity / transaction failure");
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError(null);
    const res = await createServiceType({
      name: newServiceName, category: newServiceCategory,
      price: Number(newServicePrice), slotCapacity: Number(newServiceCapacity),
      description: newServiceDesc, active: true,
    });
    if (res.success) {
      setServices([...services, { ...res.service }]);
      setNewServiceName(""); setNewServicePrice(0); setNewServiceCapacity(50); setNewServiceDesc("");
    } else {
      setServiceError(res.error || "Failed to add service type");
    }
  };

  const getCalendarBookingsByDay = () => {
    const map = new Map<string, { count: number; name: string; date: string }>();
    bookings.forEach((b) => {
      const dateStr = new Date(b.date).toDateString();
      if (!map.has(dateStr)) map.set(dateStr, { count: 0, name: b.serviceType?.name || "", date: b.date });
      map.set(dateStr, { ...map.get(dateStr)!, count: map.get(dateStr)!.count + b.quantity });
    });
    return Array.from(map.values());
  };

  const calendarDays = getCalendarBookingsByDay();

  if (loadingData) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-white rounded-xl border border-[#ecddc7]" />
        <div className="h-64 bg-white rounded-xl border border-[#ecddc7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[#ecddc7] bg-white rounded-t-xl overflow-hidden">
        {[
          { key: "list", icon: <List className="w-4 h-4" />, label: "Bookings List" },
          { key: "calendar", icon: <Calendar className="w-4 h-4" />, label: "Calendar View" },
          { key: "services", icon: <Settings className="w-4 h-4" />, label: "Pooja Rates" },
          { key: "new", icon: <Plus className="w-4 h-4" />, label: "New Booking" },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === key ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* BOOKINGS LIST */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border border-[#ecddc7] rounded-xl shadow-sm">
            <div className="flex items-center gap-2 border border-[#ecddc7]/70 px-3 py-2 rounded-lg bg-gray-50 md:col-span-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by devotee name or phone..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none" />
            </div>
            <select value={selectedServiceFilter} onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="w-full p-2 border border-[#ecddc7] rounded-lg text-xs bg-white focus:outline-none">
              <option value="">All Services</option>
              {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full p-2 border border-[#ecddc7] rounded-lg text-xs bg-white focus:outline-none">
              <option value="">All Statuses</option>
              {["PENDING","CONFIRMED","COMPLETED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl border border-[#ecddc7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-xs font-bold text-[#8a2e13]">
                    <th className="p-4">Devotee</th><th className="p-4">Service & Date</th>
                    <th className="p-4">Qty</th><th className="p-4">Amount</th>
                    <th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecddc7]/30 text-xs">
                  {filteredBookings.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-400 font-medium">No bookings found.</td></tr>
                  ) : filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#fbf6ec]/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#2a1810]">{b.devotee?.name}</div>
                        <div className="text-[10px] text-gray-500">{b.devotee?.phone}</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">
                        <div>{b.serviceType?.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(b.date)}{b.slotLabel ? ` | ${b.slotLabel}` : ""}</div>
                      </td>
                      <td className="p-4 font-medium">{b.quantity}</td>
                      <td className="p-4 font-bold text-[#8a2e13]">{formatCurrency(b.amount)}</td>
                      <td className="p-4"><span className="inline-block px-2 py-0.5 rounded text-[10px] bg-gray-50 border border-gray-200 text-gray-600">{b.paymentId || "Unpaid"}</span></td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          b.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          b.status === "COMPLETED" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                          b.status === "CANCELLED" ? "bg-gray-50 text-gray-500 border border-gray-200" :
                          "bg-amber-50 text-amber-700 border border-amber-100"}`}>{b.status}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.status === "PENDING" && (
                            <button onClick={() => handleStatusChange(b.id, "CONFIRMED")} className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors" title="Confirm"><Check className="w-3.5 h-3.5" /></button>
                          )}
                          {b.status === "CONFIRMED" && (
                            <button onClick={() => handleStatusChange(b.id, "COMPLETED")} className="p-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Complete"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                          )}
                          {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                            <button onClick={() => handleStatusChange(b.id, "CANCELLED")} className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <h3 className="text-base font-bold text-[#8a2e13] mb-4">Daily Booking Capacity Calendar</h3>
          {calendarDays.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold">No bookings active in logs to render.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {calendarDays.map((day) => (
                <div key={day.date} className="p-4 border border-[#ecddc7] rounded-xl bg-[#fbf6ec]/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8a2e13]">
                    <Calendar className="w-4 h-4 text-[#bf8f2e]" /> {formatDate(day.date)}
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-bold text-gray-700">{day.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Total: {day.count} slots</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SERVICES CONFIG */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#8a2e13]">Temple Pooja Catalog</h3>
            <div className="divide-y divide-[#ecddc7]/30">
              {services.map((s) => (
                <div key={s.id} className="py-4 flex justify-between items-start first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-xs font-bold text-[#2a1810]">{s.name}</h4>
                    <span className="inline-block mt-1 px-1.5 rounded text-[8px] bg-[#fbf6ec] border border-[#ecddc7] text-[#bf8f2e] font-bold">{s.category}</span>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">Daily Max: {s.slotCapacity} devotees</p>
                  </div>
                  <p className="text-sm font-bold text-[#8a2e13]">{formatCurrency(s.price)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
            <h3 className="text-base font-bold text-[#8a2e13] mb-4">Add Service Rate</h3>
            {serviceError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-4">{serviceError}</div>}
            <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Service Name *</label>
                <input required type="text" placeholder="e.g. Rudrabhishek Pooja" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Category</label>
                  <select value={newServiceCategory} onChange={(e) => setNewServiceCategory(e.target.value as ServiceCategory)} className="w-full p-2 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
                    {["ABHISHEK","POOJA","MAHAPRASAD","OTHER"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Price (₹) *</label>
                  <input required type="number" value={newServicePrice} onChange={(e) => setNewServicePrice(Number(e.target.value))} className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Daily Slot Capacity *</label>
                <input required type="number" value={newServiceCapacity} onChange={(e) => setNewServiceCapacity(Number(e.target.value))} className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Description</label>
                <textarea value={newServiceDesc} onChange={(e) => setNewServiceDesc(e.target.value)} rows={3} className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors">Add Service</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW COUNTER BOOKING */}
      {activeTab === "new" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <h3 className="text-base font-bold text-[#8a2e13] mb-4">Record Counter Pooja / Abhishek Booking</h3>
          {bookingError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-4">{bookingError}</div>}
          {bookingSuccess && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Booking registered successfully!</div>}
          <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Select Devotee *</label>
              <select required value={selectedDevoteeId} onChange={(e) => setSelectedDevoteeId(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
                <option value="">-- Choose Devotee --</option>
                {devotees.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Select Service *</label>
                <select required value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
                  <option value="">-- Choose Service --</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Booking Date *</label>
                <input required type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Batch Slot (Optional)</label>
                <select value={bookingSlot} onChange={(e) => setBookingSlot(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
                  <option value="">-- Default Slot --</option>
                  <option value="Morning Slot 1 (07:00 AM)">Morning Slot 1 (07:00 AM)</option>
                  <option value="Morning Slot 2 (08:30 AM)">Morning Slot 2 (08:30 AM)</option>
                  <option value="Evening Slot (07:30 PM)">Evening Slot (07:30 PM)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Quantity *</label>
                <input required type="number" min={1} value={bookingQty} onChange={(e) => setBookingQty(Number(e.target.value))} className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-gray-500 mb-1">Sankalp name / notes</label>
              <textarea value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} rows={3} className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors flex items-center justify-center gap-2">
              {submitting && <Loader className="w-4 h-4 animate-spin" />} Submit & Print Receipt
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
