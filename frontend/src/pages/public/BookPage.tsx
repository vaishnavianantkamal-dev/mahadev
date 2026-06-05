import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle2, Globe, Loader } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getPublicPoojaServices, createPublicBooking } from "@/api/public";

export default function BookPage() {
  const { t } = useLocale();
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [slotLabel, setSlotLabel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [devoteeName, setDevoteeName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("phonepe");

  useEffect(() => {
    getPublicPoojaServices().then(setServices);
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const totalAmount = selectedService ? Number(selectedService.price) * quantity : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const handleProceedToPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedServiceId || !bookingDate || !devoteeName || !phone) {
      setError("Please complete all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/online-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount, serviceTypeId: selectedServiceId, date: bookingDate, slotLabel }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setCheckoutOrder(data.order);
      } else {
        setError(data.error || "Failed to initiate online booking order.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!checkoutOrder || !selectedService) return;
    setLoading(true);
    setError(null);
    const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = `sig_mock_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const res = await createPublicBooking({
        orderId: checkoutOrder.id,
        paymentId: mockPaymentId,
        signature: mockSignature,
        devoteeName, phone, email,
        serviceTypeId: selectedServiceId,
        date: bookingDate,
        slotLabel, quantity, notes,
        amount: totalAmount,
      });
      if (res.success && res.booking) {
        setSuccessReceipt(res.booking);
      } else {
        setError(res.error || "Booking failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setCheckoutOrder(null);
    }
  };

  if (successReceipt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-[#2a1810] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1faa59] border border-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#8a2e13]">Pooja Booking Confirmed!</h2>
        <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
          Your booking for <span className="font-bold text-[#2a1810]">{selectedService?.name}</span> has been confirmed for {new Date(successReceipt.date).toLocaleDateString("en-IN")}.
        </p>
        <div className="bg-white border border-[#ecddc7] p-6 rounded-2xl text-left text-xs space-y-3 max-w-sm mx-auto shadow-sm">
          {[
            ["Booking ID", successReceipt.id],
            ["Devotee Name", devoteeName],
            ["Selected Date", new Date(successReceipt.date).toLocaleDateString("en-IN")],
            ["Amount Paid", formatCurrency(Number(successReceipt.amount))],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-[#ecddc7]/30 pb-2">
              <span className="font-bold text-gray-400">{label}:</span>
              <span className="font-bold text-gray-700 truncate max-w-[180px]">{value}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#fbf6ec] border border-[#ecddc7] p-5 rounded-2xl max-w-sm mx-auto text-center space-y-2">
          <p className="text-xs font-bold text-[#8a2e13] uppercase tracking-wider">🙏 Gratitude & Blessings</p>
          <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">
            Thank you for your devotion and support. May the divine blessings of Lord Shri Mallikarjun bring peace, prosperity, and happiness to you and your family.
          </p>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">A confirmation has been sent to your phone via WhatsApp/SMS.</p>
        <Link to="/" className="px-6 py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold text-xs rounded-lg hover:bg-[#c25a22] transition-colors inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#2a1810] grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-[#8a2e13]" />
          <h2 className="text-xl font-bold text-[#8a2e13]">Pooja Booking</h2>
        </div>
        <p className="text-gray-500 leading-relaxed">
          Book special abhisheks, archanas, or naivedya passes at Shri Mallikarjun Temple. Select your service, date, and input devotee contact details.
        </p>
        <div className="bg-[#fbf6ec] border border-[#ecddc7] p-4 rounded-xl text-[10px] text-gray-500 space-y-2 leading-relaxed">
          <p className="text-[#8a2e13] font-bold uppercase">⚠️ Slot Capacities</p>
          <p>Bookings are capped automatically per day to prevent overcrowding in the inner sanctuary.</p>
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-2 bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm">
        {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleProceedToPay} className="space-y-6 text-xs font-semibold">
          <div>
            <label className="block text-gray-500 mb-1">Select Pooja / Abhishek Service *</label>
            <select required value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
              <option value="">-- Choose Service --</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} - {formatCurrency(Number(s.price))}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 mb-1">Select Booking Date *</label>
              <input required type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Time Slot / Batch (Optional)</label>
              <select value={slotLabel} onChange={(e) => setSlotLabel(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
                <option value="">-- Default Slot --</option>
                <option value="Morning Slot 1 (07:00 AM)">Morning Slot 1 (07:00 AM)</option>
                <option value="Morning Slot 2 (08:30 AM)">Morning Slot 2 (08:30 AM)</option>
                <option value="Evening Slot (07:30 PM)">Evening Slot (07:30 PM)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 mb-1">Devotee Full Name *</label>
              <input required type="text" placeholder="e.g. Suresh Deshmukh" value={devoteeName} onChange={(e) => setDevoteeName(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Mobile Number *</label>
              <input required type="tel" placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 mb-1">Email Address (Optional)</label>
              <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Quantity *</label>
              <input required type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Sankalp name / special notes</label>
            <textarea placeholder="Name of family members for Sankalp..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
          </div>
          <div className="flex items-start">
            <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4 mt-0.5" />
            <label htmlFor="consent" className="ml-2 text-[10px] text-gray-400 cursor-pointer leading-relaxed">
              I consent to receive booking receipt logs and special updates on WhatsApp (+91).
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-all flex items-center justify-center gap-2">
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Proceed to Book {formatCurrency(totalAmount)}
          </button>
        </form>
      </div>

      {/* Checkout Modal */}
      {checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-[#ecddc7] shadow-xl w-full max-w-sm text-center text-[#2a1810] space-y-4">
            <div className="p-3 bg-yellow-50 text-[#bf8f2e] border border-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#8a2e13]">Razorpay Booking Simulation</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">Click below to mock successful checkout and generate your confirmed booking slot.</p>
            <div className="bg-[#fbf6ec] p-4 rounded-xl text-left text-[10px] space-y-2 border border-[#ecddc7] font-semibold text-gray-600">
              <p>Pooja: {selectedService?.name}</p>
              <p>Total Cost: {formatCurrency(totalAmount)}</p>
              <p>Devotee: {devoteeName}</p>
            </div>

            {/* Payment Method Selector */}
            <div className="text-left space-y-2 border-t border-b border-[#ecddc7]/30 py-3">
              <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("phonepe")}
                  className={`p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${paymentMethod === "phonepe" ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  PhonePe (UPI)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gpay")}
                  className={`p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${paymentMethod === "gpay" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Google Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${paymentMethod === "card" ? "border-[#8a2e13] bg-orange-50 text-[#8a2e13]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8a2e13]" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${paymentMethod === "netbanking" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Net Banking
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setCheckoutOrder(null)} className="flex-1 py-2 border border-[#ecddc7] rounded-lg font-bold text-xs text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSimulatePaymentSuccess} disabled={loading} className="flex-1 py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg text-xs hover:bg-[#c25a22]">
                {loading ? "Processing..." : "Pay and Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
