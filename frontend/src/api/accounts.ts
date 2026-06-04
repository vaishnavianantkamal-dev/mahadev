export async function getLedgerEntries(filters?: {
  entryType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.entryType) params.append("entryType", filters.entryType);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const res = await fetch(`/api/accounts?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch ledger entries");
  return res.json();
}

export async function createLedgerEntry(data: unknown) {
  const res = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getAccountsSummary() {
  const res = await fetch("/api/accounts/summary");
  if (!res.ok) throw new Error("Failed to fetch accounts summary");
  return res.json();
}
