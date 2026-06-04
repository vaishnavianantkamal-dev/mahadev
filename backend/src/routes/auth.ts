import { Router } from "express";
import { getCurrentUser } from "../lib/auth";

const router = Router();

router.get("/me", (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({ user });
});

router.post("/stub-role", (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }
  res.cookie("stub_role", role, { maxAge: 365 * 24 * 60 * 60 * 1000, path: "/" });
  return res.json({ success: true, role });
});

export default router;
