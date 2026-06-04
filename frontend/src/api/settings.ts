export async function getTempleProfile() {
  const res = await fetch("/api/settings/profile");
  if (!res.ok) throw new Error("Failed to fetch temple profile");
  return res.json();
}

export async function getStaffUsers() {
  const res = await fetch("/api/settings/staff");
  if (!res.ok) throw new Error("Failed to fetch staff users");
  return res.json();
}

export async function updateTempleProfile(data: {
  name: string;
  phone: string;
  email: string;
  address: string;
  bankRef: string;
}) {
  const res = await fetch("/api/settings/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTempleSettings(settings: {
  websiteActive: boolean;
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  primaryColor: string;
  allowRoomBookings: boolean;
  allowServiceBookings: boolean;
}) {
  const res = await fetch("/api/settings/toggles", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function saveStaffUser(data: {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}) {
  const res = await fetch("/api/settings/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
