import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bed, CheckCircle2, Globe, Loader } from "lucide-react";
import { getPublicRooms } from "@/api/public";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [devoteeName, setDevoteeName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  useEffect(() => { getPublicRooms().then(setRooms); }, []);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  let nights = 0;
  let totalAmount = 0;
  if (checkInDate && checkOutDate && selectedRoom) {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (end > start) {
      nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      totalAmount = Number(selectedRoom.pricePerNight) * nights;
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const handleProceedToPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedRoomId || !checkInDate || !checkOutDate || !devoteeName || !phone) {
      setError("Please complete all required fields.");
      return;
    }
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (end <= start) {
      setError("Check-out date must be after check-in date.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rooms/online-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount, roomId: selectedRoomId, checkIn: checkInDate, checkOut: checkOutDate, guests }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setCheckoutOrder(data.order);
      } else {
        setError(data.error || "Failed to initiate room booking.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!checkoutOrder || !selectedRoom) return;
    setLoading(true);
    setError(null);
    const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = `sig_mock_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const res = await fetch("/api/rooms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: checkoutOrder.id,
          paymentId: mockPaymentId,
          signature: mockSignature,
          devoteeName, phone, email,
          roomId: selectedRoomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests, amount: totalAmount,
        }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setSuccessReceipt(data.booking);
      } else {
        setError(data.error || "Room booking failed.");
      }
    } catch {
      setError("Network error.");
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
        <h2 className="text-2xl font-bold text-[#8a2e13]">Room Reservation Confirmed!</h2>
        <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
          Your room booking for <span className="font-bold text-[#2a1810]">{selectedRoom?.name}</span> has been confirmed for {nights} nights.
        </p>
        <div className="bg-white border border-[#ecddc7] p-6 rounded-2xl text-left text-xs space-y-3 max-w-sm mx-auto shadow-sm">
          {[
            ["Booking ID", successReceipt.id],
            ["Guest Name", devoteeName],
            ["Dates", `${new Date(successReceipt.checkIn).toLocaleDateString("en-IN")} to ${new Date(successReceipt.checkOut).toLocaleDateString("en-IN")}`],
            ["Amount Paid", formatCurrency(Number(successReceipt.amount))],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-[#ecddc7]/30 pb-2">
              <span className="font-bold text-gray-400">{label}:</span>
              <span className="font-bold text-gray-700 truncate max-w-[180px]">{value}</span>
            </div>
          ))}
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
      <div className="lg:col-span-1 space-y-6 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <Bed className="w-8 h-8 text-[#8a2e13]" />
          <h2 className="text-xl font-bold text-[#8a2e13]">Bhakta Niwas Accommodation</h2>
        </div>
        <p className="text-gray-500 leading-relaxed">Book accommodations at the temple guest house. Select your room type (AC/Non-AC Deluxe) and stay duration.</p>
        <div className="bg-[#fbf6ec] border border-[#ecddc7] p-4 rounded-xl text-[10px] text-gray-500 space-y-2 leading-relaxed">
          <p className="text-[#8a2e13] font-bold uppercase">⚡ Booking rules</p>
          <p>Double bookings are blocked in real-time. Check-in is at 12:00 PM and check-out is at 11:00 AM.</p>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm">
        {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleProceedToPay} className="space-y-6 text-xs font-semibold">
          <div>
            <label className="block text-gray-500 mb-1">Select Guest Room *</label>
            <select required value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
              <option value="">-- Choose Room --</option>
              {rooms.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name} ({r.roomType}) - {formatCurrency(Number(r.pricePerNight))} / night</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 mb-1">Check-in Date *</label>
              <input required type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Check-out Date *</label>
              <input required type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 mb-1">Guest Full Name *</label>
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
              <label className="block text-gray-500 mb-1">Number of Guests *</label>
              <input required type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
            </div>
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

      {checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-[#ecddc7] shadow-xl w-full max-w-sm text-center text-[#2a1810] space-y-4">
            <div className="p-3 bg-yellow-50 text-[#bf8f2e] border border-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#8a2e13]">Razorpay Room Booking Simulation</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">Click below to mock successful checkout and confirm your Bhakta Niwas stay.</p>
            <div className="bg-[#fbf6ec] p-4 rounded-xl text-left text-[10px] space-y-2 border border-[#ecddc7] font-semibold text-gray-600">
              <p>Room: {selectedRoom?.name}</p>
              <p>Stay duration: {nights} nights</p>
              <p>Total Cost: {formatCurrency(totalAmount)}</p>
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
