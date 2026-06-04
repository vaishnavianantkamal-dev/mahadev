import React, { useState, useEffect } from "react";
import {
  createRoom,
  updateRoom,
  createRoomBooking,
  updateRoomBookingStatus,
  getRooms,
  getRoomBookings,
} from "@/api/bookings";
import { getDevotees } from "@/api/devotees";
import {
  Plus, Bed, Calendar, List, Check, X, CheckCircle2, Clock, Search, Loader
} from "lucide-react";

type RoomBookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface DevoteeOption { id: string; name: string; phone: string; }
interface RoomOption { id: string; name: string; roomType: string; capacity: number; pricePerNight: string; }
interface RoomBookingRow {
  id: string; checkIn: string; checkOut: string; guests: number;
  amount: string; status: RoomBookingStatus; paymentId: string | null;
  devotee: { name: string; phone: string }; room: { name: string; roomType: string };
}

export default function RoomsClient() {
  const [activeTab, setActiveTab] = useState<"list" | "rooms" | "new">("list");
  const [bookings, setBookings] = useState<RoomBookingRow[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [devotees, setDevotees] = useState<DevoteeOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getRoomBookings().catch(() => []),
      getRooms().catch(() => []),
      getDevotees().catch(() => []),
    ]).then(([bList, rList, dList]) => {
      setBookings(Array.isArray(bList) ? bList : []);
      setRooms(Array.isArray(rList) ? rList : []);
      setDevotees(Array.isArray(dList) ? dList : []);
    }).finally(() => setLoadingData(false));
  }, []);

  // New Room Form State
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("Deluxe AC");
  const [newRoomCapacity, setNewRoomCapacity] = useState(4);
  const [newRoomPrice, setNewRoomPrice] = useState(1000);
  const [roomError, setRoomError] = useState<string | null>(null);

  // New Room Booking Form State
  const [selectedDevoteeId, setSelectedDevoteeId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Format currency
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

  // Filter stay history
  const filteredBookings = bookings.filter((b) => {
    const devName = b.devotee.name.toLowerCase();
    const devPhone = b.devotee.phone;
    const query = searchQuery.toLowerCase();
    return devName.includes(query) || devPhone.includes(query) || b.room.name.toLowerCase().includes(query);
  });

  // Action: status update
  const handleStatusChange = async (id: string, status: RoomBookingStatus) => {
    const res = await updateRoomBookingStatus(id, status);
    if (res.success) {
      setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b));
    } else {
      alert(res.error || "Failed to update status");
    }
  };

  // Action: submit new room
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError(null);

    const res = await createRoom({
      name: newRoomName,
      roomType: newRoomType,
      capacity: Number(newRoomCapacity),
      pricePerNight: Number(newRoomPrice),
      active: true,
    });

    if (res.success) {
      alert("Room added successfully!");
      window.location.reload();
    } else {
      setRoomError(res.error || "Failed to create room");
    }
  };

  // Action: submit room booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(false);

    if (!selectedDevoteeId || !selectedRoomId || !checkInDate || !checkOutDate) {
      setBookingError("Please fill out all booking details.");
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      setBookingError("Check-out date must be after check-in date.");
      return;
    }

    const res = await createRoomBooking({
      devoteeId: selectedDevoteeId,
      roomId: selectedRoomId,
      checkIn,
      checkOut,
      guests: Number(guestsCount),
    });

    if (res.success && res.booking) {
      setBookingSuccess(true);
      const devotee = devotees.find((d) => d.id === selectedDevoteeId)!;
      const room = rooms.find((r) => r.id === selectedRoomId)!;
      
      const newB: RoomBookingRow = {
        id: res.booking.id,
        checkIn: res.booking.checkIn,
        checkOut: res.booking.checkOut,
        guests: res.booking.guests,
        amount: res.booking.amount.toString(),
        status: res.booking.status,
        paymentId: res.booking.paymentId,
        devotee: { name: devotee.name, phone: devotee.phone },
        room: { name: room.name, roomType: room.roomType },
      };

      setBookings([newB, ...bookings]);
      setSelectedDevoteeId("");
      setSelectedRoomId("");
      setCheckInDate("");
      setCheckOutDate("");
      setGuestsCount(1);
    } else {
      setBookingError(res.error || "Room is already occupied or transaction failed.");
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
          Stay History
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "rooms"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bed className="w-4 h-4" />
          Rooms Config
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
          Book Guest Room
        </button>
      </div>

      {/* VIEW: STAY HISTORY */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-white border border-[#ecddc7] rounded-xl shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by devotee, room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-xl border border-[#ecddc7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-xs font-bold text-[#8a2e13]">
                    <th className="p-4">Devotee</th>
                    <th className="p-4">Room & Type</th>
                    <th className="p-4">Stay Dates</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4 text-right">Total Stay Cost</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecddc7]/30 text-xs">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                        No active guest bookings found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#fbf6ec]/20 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#2a1810]">{b.devotee.name}</div>
                          <div className="text-[10px] text-gray-500 font-semibold">{b.devotee.phone}</div>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">
                          <div>{b.room.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold mt-0.5">{b.room.roomType}</div>
                        </td>
                        <td className="p-4 font-medium text-gray-600">
                          {formatDate(b.checkIn)} to {formatDate(b.checkOut)}
                        </td>
                        <td className="p-4 font-medium text-center">{b.guests}</td>
                        <td className="p-4 text-right font-bold text-[#8a2e13]">{formatCurrency(b.amount)}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            b.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            b.status === "COMPLETED" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            b.status === "CANCELLED" ? "bg-gray-50 text-gray-500 border border-gray-150" :
                            "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {b.status === "PENDING" && (
                              <button
                                onClick={() => handleStatusChange(b.id, "CONFIRMED")}
                                className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                                title="Confirm Check-in"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {b.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleStatusChange(b.id, "COMPLETED")}
                                className="p-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                title="Check Out Guest"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                              <button
                                onClick={() => handleStatusChange(b.id, "CANCELLED")}
                                className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                title="Cancel Booking"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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

      {/* VIEW: ROOMS CONFIG */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rooms List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#8a2e13]">Guest Room Inventory</h3>
            <div className="divide-y divide-[#ecddc7]/30">
              {rooms.map((r) => (
                <div key={r.id} className="py-4 flex justify-between items-start first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-xs font-bold text-[#2a1810]">{r.name}</h4>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[8px] bg-[#fbf6ec] border border-[#ecddc7] text-[#bf8f2e] font-bold">
                      {r.roomType}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">Capacity: {r.capacity} Guests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#8a2e13]">{formatCurrency(r.pricePerNight)} / night</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Room Form */}
          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
            <h3 className="text-base font-bold text-[#8a2e13] mb-4">Add Guest Room</h3>
            {roomError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-4">
                {roomError}
              </div>
            )}
            <form onSubmit={handleRoomSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Room Name / Number *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Room 103"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Room Type</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full p-2 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                  >
                    <option value="Deluxe AC">Deluxe AC</option>
                    <option value="Standard Non-AC">Standard Non-AC</option>
                    <option value="Dormitory Hall">Dormitory Hall</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Price / Night *</label>
                  <input
                    required
                    type="number"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                    className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Max Guest Capacity *</label>
                <input
                  required
                  type="number"
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
              >
                Create Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: GUEST RESERVATION FORM */}
      {activeTab === "new" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <h3 className="text-base font-bold text-[#8a2e13] mb-4">Record Room Stay Booking</h3>

          {bookingError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg mb-4">
              {bookingError}
            </div>
          )}
          {bookingSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Guest stay reservation registered and logged in ledger successfully!
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Select Devotee (CRM Contact) *</label>
              <select
                required
                value={selectedDevoteeId}
                onChange={(e) => setSelectedDevoteeId(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
              >
                <option value="">-- Choose Devotee --</option>
                {devotees.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Select Available Room *</label>
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.roomType}) - {formatCurrency(r.pricePerNight)} / night
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Guests Count *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Check-in Date *</label>
                <input
                  required
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Check-out Date *</label>
                <input
                  required
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
            >
              Book Room
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
