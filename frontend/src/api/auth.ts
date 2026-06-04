export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "TRUST_ADMIN" | "STAFF";
}

export async function getCurrentUser(): Promise<SystemUser | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function setStubRole(role: string): Promise<void> {
  await fetch("/api/auth/stub-role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });
}
