export async function getDonations(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`/api/donations${query}`);
  if (!res.ok) throw new Error("Failed to fetch donations");
  return res.json();
}

export async function createCounterDonation(data: unknown) {
  const res = await fetch("/api/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createDonationOrder(
  amount: number,
  donorName: string,
  phone: string,
  email?: string,
  purpose?: string
) {
  const res = await fetch("/api/donations/online-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, donorName, phone, email, purpose }),
  });
  return res.json();
}

export async function verifyAndRecordDonation(payload: any) {
  const res = await fetch("/api/donations/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
