export async function getMessageGroups() {
  const res = await fetch("/api/communication/groups");
  if (!res.ok) throw new Error("Failed to fetch message groups");
  return res.json();
}

export async function createMessageGroup(data: unknown) {
  const res = await fetch("/api/communication/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMessageGroup(id: string) {
  const res = await fetch(`/api/communication/groups/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function createMessageTemplate(data: unknown) {
  const res = await fetch("/api/communication/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMessageTemplate(id: string) {
  const res = await fetch(`/api/communication/templates/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function getBroadcasts() {
  const res = await fetch("/api/communication/broadcasts");
  if (!res.ok) throw new Error("Failed to fetch broadcasts");
  return res.json();
}

export async function triggerBroadcast(templateId: string, cityFilter?: string) {
  const res = await fetch("/api/communication/broadcasts/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId, cityFilter }),
  });
  return res.json();
}
