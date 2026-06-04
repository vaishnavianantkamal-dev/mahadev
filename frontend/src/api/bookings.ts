export async function getServiceTypes() {
  const res = await fetch("/api/bookings/service-types");
  if (!res.ok) throw new Error("Failed to fetch service types");
  return res.json();
}

export async function createServiceType(data: unknown) {
  const res = await fetch("/api/bookings/service-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateServiceType(id: string, data: unknown) {
  const res = await fetch(`/api/bookings/service-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getBookings(filters?: { serviceTypeId?: string; date?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.serviceTypeId) params.append("serviceTypeId", filters.serviceTypeId);
  if (filters?.date) params.append("date", filters.date);
  if (filters?.status) params.append("status", filters.status);

  const res = await fetch(`/api/bookings?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function createBooking(data: any) {
  // Convert date to ISO string for transmission
  const payload = {
    ...data,
    date: data.date instanceof Date ? data.date.toISOString() : data.date,
  };
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateBookingStatus(id: string, status: string) {
  const res = await fetch(`/api/bookings/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function createBookingOrder(amount: number, serviceTypeId: string, date: Date, slotLabel?: string) {
  const res = await fetch("/api/bookings/online-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      serviceTypeId,
      date: date instanceof Date ? date.toISOString() : date,
      slotLabel,
    }),
  });
  return res.json();
}

export async function verifyAndRecordBooking(payload: any) {
  const res = await fetch("/api/bookings/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// --- ROOMS ---

export async function getRooms() {
  const res = await fetch("/api/rooms");
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

export async function createRoom(data: unknown) {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateRoom(id: string, data: unknown) {
  const res = await fetch(`/api/rooms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- ROOM BOOKINGS ---

export async function getRoomBookings() {
  const res = await fetch("/api/rooms/bookings");
  if (!res.ok) throw new Error("Failed to fetch room bookings");
  return res.json();
}

export async function createRoomBooking(data: any) {
  const payload = {
    ...data,
    checkIn: data.checkIn instanceof Date ? data.checkIn.toISOString() : data.checkIn,
    checkOut: data.checkOut instanceof Date ? data.checkOut.toISOString() : data.checkOut,
  };
  const res = await fetch("/api/rooms/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateRoomBookingStatus(id: string, status: string) {
  const res = await fetch(`/api/rooms/bookings/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function createRoomBookingOrder(
  amount: number,
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  guests: number
) {
  const res = await fetch("/api/rooms/online-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      roomId,
      checkIn: checkIn instanceof Date ? checkIn.toISOString() : checkIn,
      checkOut: checkOut instanceof Date ? checkOut.toISOString() : checkOut,
      guests,
    }),
  });
  return res.json();
}

export async function verifyAndRecordRoomBooking(payload: any) {
  const res = await fetch("/api/rooms/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
