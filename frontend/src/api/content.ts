export async function getDarshanTimings() {
  const res = await fetch("/api/content/timings");
  if (!res.ok) throw new Error("Failed to fetch darshan timings");
  return res.json();
}

export async function createDarshanTiming(data: unknown) {
  const res = await fetch("/api/content/timings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDarshanTiming(id: string) {
  const res = await fetch(`/api/content/timings/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function getEvents() {
  const res = await fetch("/api/content/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function createEvent(data: any) {
  const payload = {
    ...data,
    startAt: data.startAt instanceof Date ? data.startAt.toISOString() : data.startAt,
    endAt: data.endAt instanceof Date ? data.endAt.toISOString() : data.endAt,
  };
  const res = await fetch("/api/content/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteEvent(id: string) {
  const res = await fetch(`/api/content/events/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function getLiveDarshans() {
  const res = await fetch("/api/content/live");
  if (!res.ok) throw new Error("Failed to fetch live darshans");
  return res.json();
}

export async function updateLiveDarshan(id: string, data: unknown) {
  const res = await fetch(`/api/content/live/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMediaItems() {
  const res = await fetch("/api/content/media");
  if (!res.ok) throw new Error("Failed to fetch media items");
  return res.json();
}

export async function createMediaItem(data: unknown) {
  const res = await fetch("/api/content/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMediaItem(id: string) {
  const res = await fetch(`/api/content/media/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function getSiteContents() {
  const res = await fetch("/api/content/site");
  if (!res.ok) throw new Error("Failed to fetch site contents");
  return res.json();
}

export async function updateSiteContent(id: string, title: string, bodyRich: string) {
  const res = await fetch(`/api/content/site/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, bodyRich }),
  });
  return res.json();
}
