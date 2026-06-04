import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export function getCurrentUser(req: Request): SystemUser | null {
  const isStub = process.env.DEV_STUB_INTEGRATIONS === "true";
  
  if (isStub) {
    const stubRole = req.cookies?.stub_role || "SUPER_ADMIN";
    
    // Return mock users based on role selection
    if (stubRole === "SUPER_ADMIN") {
      return {
        id: "user_stub_admin",
        name: "Devidas Kulkarni (Dev Admin)",
        email: "admin@shrimallikarjun.org",
        role: Role.SUPER_ADMIN,
      };
    } else if (stubRole === "TRUST_ADMIN") {
      return {
        id: "user_stub_trust",
        name: "Mohanrao Patil (Dev Trust)",
        email: "trustee@shrimallikarjun.org",
        role: Role.TRUST_ADMIN,
      };
    } else {
      return {
        id: "user_stub_staff",
        name: "Sanjay Pawar (Dev Staff)",
        email: "sanjay@shrimallikarjun.org",
        role: Role.STAFF,
      };
    }
  }

  // Live Clerk Auth fallback for Express
  const clerkUserId = req.headers["x-clerk-user-id"] as string;
  const clerkUserRole = (req.headers["x-clerk-user-role"] as Role) || Role.STAFF;
  const clerkUserName = req.headers["x-clerk-user-name"] as string || "Staff Member";
  const clerkUserEmail = req.headers["x-clerk-user-email"] as string || "";

  if (clerkUserId) {
    return {
      id: clerkUserId,
      name: clerkUserName,
      email: clerkUserEmail,
      role: clerkUserRole,
    };
  }

  return null;
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    (req as any).user = user;
    next();
  };
}
