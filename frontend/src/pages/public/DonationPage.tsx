import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, CheckCircle2, Globe, Loader } from "lucide-react";
import { createPublicDonation } from "@/api/public";

export default function DonationPage() {
  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<number>(501);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [purpose, setPurpose] = useState("General Development");
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  const amountPresets = [251, 501, 1001, 2100, 5001];
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const handleProceedToPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!donorName || !phone || amount <= 0) {
      setError("Please complete all required fields and specify a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/donations/online-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, donorName, phone, email, purpose }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setCheckoutOrder(data.order);
      } else {
        setError(data.error || "Failed to initiate checkout.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!checkoutOrder) return;
    setLoading(true);
    setError(null);
    const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = `sig_mock_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const res = await createPublicDonation({
        orderId: checkoutOrder.id,
        paymentId: mockPaymentId,
        signature: mockSignature,
        donorName, phone, email, purpose, amount,
      });
      if (res.success && res.donation) {
        setSuccessReceipt(res.donation);
      } else {
        setError(res.error || "Payment verification failed.");
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
        <h2 className="text-2xl font-bold text-[#8a2e13]">Donation Received Successfully!</h2>
        <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
          Thank you for your generous contribution of <span className="font-bold text-[#2a1810]">{formatCurrency(successReceipt.amount)}</span> for {successReceipt.purpose}.
        </p>
        <div className="bg-white border border-[#ecddc7] p-6 rounded-2xl text-left text-xs space-y-3 max-w-sm mx-auto shadow-sm">
          {[
            ["Receipt No", successReceipt.receiptNo],
            ["Donor Name", successReceipt.donorName],
            ["Phone", successReceipt.phone],
            ["Amount Paid", formatCurrency(successReceipt.amount)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-[#ecddc7]/30 pb-2">
              <span className="font-bold text-gray-400">{label}:</span>
              <span className="font-bold text-gray-700">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 font-medium">An official e-receipt has been sent via WhatsApp/email.</p>
        <Link to="/" className="px-6 py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold text-xs rounded-lg hover:bg-[#c25a22] transition-colors inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#2a1810] grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center gap-3">
          <HeartHandshake className="w-8 h-8 text-[#8a2e13]" />
          <h2 className="text-xl font-bold text-[#8a2e13]">Online Donation</h2>
        </div>
        <p className="text-xs text-gray-500 font-semibold leading-relaxed">
          Support the development and daily charitable operations (Annadaan/Mahaprasad) of Shri Mallikarjun Devasthan, Nhavre.
        </p>
        <div className="bg-[#fbf6ec] border border-[#ecddc7] p-4 rounded-xl text-[10px] text-gray-500 font-semibold space-y-2 leading-relaxed">
          <p className="text-[#8a2e13] font-bold uppercase">💡 Taxation & Audit</p>
          <p>Instant e-receipt PDFs are generated and sent via WhatsApp/SMS immediately upon payment.</p>
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-2 bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm">
        {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleProceedToPay} className="space-y-6 text-xs font-semibold">
          {/* Amount Presets */}
          <div>
            <label className="block text-gray-500 font-bold uppercase tracking-wider mb-2">Select Donation Amount *</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {amountPresets.map((val) => (
                <button
                  type="button" key={val}
                  onClick={() => { setAmount(val); setIsCustomAmount(false); }}
                  className={`py-2 text-center border rounded-lg transition-all ${amount === val && !isCustomAmount ? "border-[#8a2e13] bg-[#8a2e13] text-[#fbf6ec]" : "border-[#ecddc7] hover:bg-[#fbf6ec]/30 text-gray-700"}`}
                >₹{val}</button>
              ))}
              <button type="button" onClick={() => { setIsCustomAmount(true); setAmount(100); }}
                className={`py-2 text-center border rounded-lg transition-all ${isCustomAmount ? "border-[#8a2e13] bg-[#8a2e13] text-[#fbf6ec]" : "border-[#ecddc7] hover:bg-[#fbf6ec]/30 text-gray-700"}`}
              >Custom</button>
            </div>
            {isCustomAmount && (
              <input required type="number" min={1} placeholder="Enter custom amount (₹)" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none mt-3" />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 mb-1">Donor Full Name *</label>
              <input required type="text" placeholder="e.g. Suresh Deshmukh" value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none" />
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
              <label className="block text-gray-500 mb-1">Contribution Purpose *</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none">
                <option>General Development</option>
                <option>Annadaan (Mahaprasad)</option>
                <option>Temple Renovation</option>
                <option>Gau Shala Maintenance</option>
              </select>
            </div>
          </div>
          <div className="flex items-start">
            <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4 mt-0.5" />
            <label htmlFor="consent" className="ml-2 text-[10px] text-gray-400 cursor-pointer leading-relaxed">
              I consent to receive temple receipt logs and festival notifications on WhatsApp (+91).
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-all flex items-center justify-center gap-2">
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Proceed to Pay {formatCurrency(amount)}
          </button>
        </form>
      </div>

      {/* Payment Modal */}
      {checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-[#ecddc7] shadow-xl w-full max-w-sm text-center text-[#2a1810] space-y-4">
            <div className="p-3 bg-yellow-50 text-[#bf8f2e] border border-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#8a2e13]">Razorpay Payment Simulation</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">Click below to mock successful checkout and generate your double-entry receipt.</p>
            <div className="bg-[#fbf6ec] p-4 rounded-xl text-left text-[10px] space-y-2 border border-[#ecddc7] font-semibold text-gray-600">
              <p>Order ID: {checkoutOrder.id}</p>
              <p>Amount: {formatCurrency(amount)}</p>
              <p>Donor: {donorName}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCheckoutOrder(null)} className="flex-1 py-2 border border-[#ecddc7] rounded-lg font-bold text-xs text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSimulatePaymentSuccess} disabled={loading} className="flex-1 py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg text-xs hover:bg-[#c25a22]">
                {loading ? "Processing..." : "Pay and Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
