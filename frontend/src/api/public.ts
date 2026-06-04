// Public-facing API calls (no auth required)
export async function getPublicTimings() {
  const res = await fetch("/api/content/timings");
  if (!res.ok) return [];
  return res.json();
}

export async function getPublicEvents() {
  const res = await fetch("/api/content/events");
  if (!res.ok) return [];
  return res.json();
}

export async function getPublicLiveDarshan() {
  const res = await fetch("/api/content/live");
  if (!res.ok) return null;
  const items = await res.json();
  return Array.isArray(items) ? (items[0] || null) : items;
}

export async function getPublicMedia() {
  const res = await fetch("/api/content/media");
  if (!res.ok) return [];
  return res.json();
}

export async function getPublicTemple() {
  const res = await fetch("/api/settings/profile");
  if (!res.ok) return null;
  return res.json();
}

export async function getPublicSiteContent(locale: string) {
  const res = await fetch(`/api/content/site?locale=${locale}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getPublicPoojaServices() {
  const res = await fetch("/api/bookings/service-types");
  if (!res.ok) return [];
  return res.json();
}

export async function getPublicRooms() {
  const res = await fetch("/api/rooms");
  if (!res.ok) return [];
  return res.json();
}

export async function createPublicBooking(data: unknown) {
  const res = await fetch("/api/bookings/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createPublicDonation(data: unknown) {
  const res = await fetch("/api/donations/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
