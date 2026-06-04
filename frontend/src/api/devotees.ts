export async function getDevotees(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`/api/devotees${query}`);
  if (!res.ok) throw new Error("Failed to fetch devotees");
  return res.json();
}

export async function createDevotee(rawFields: unknown) {
  const res = await fetch("/api/devotees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rawFields),
  });
  return res.json();
}

export async function updateDevotee(id: string, rawFields: unknown) {
  const res = await fetch(`/api/devotees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rawFields),
  });
  return res.json();
}

export async function deleteDevotee(id: string) {
  const res = await fetch(`/api/devotees/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function getDevotee(id: string) {
  const res = await fetch(`/api/devotees/${id}`);
  if (!res.ok) throw new Error("Failed to fetch devotee profile details");
  return res.json();
}

