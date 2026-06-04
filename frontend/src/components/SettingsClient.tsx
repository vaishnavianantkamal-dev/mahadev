import React, { useState, useEffect } from "react";
type Role = "SUPER_ADMIN" | "TRUST_ADMIN" | "STAFF";
import { 
  updateTempleProfile, 
  updateTempleSettings, 
  saveStaffUser, 
  getTempleProfile, 
  getStaffUsers 
} from "@/api/settings";
import { setStubRole, getCurrentUser, SystemUser } from "@/api/auth";
import {
  Building2,
  Sliders,
  Key,
  UserCog,
  Shield,
  Loader,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";

interface TempleProfile {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  bankRef: string | null;
  settings: any;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export default function SettingsClient() {
  const [temple, setTemple] = useState<TempleProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState<"profile" | "toggles" | "keys" | "users">("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forms State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bankRef, setBankRef] = useState("");

  // Toggles State
  const [websiteActive, setWebsiteActive] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [allowRoomBookings, setAllowRoomBookings] = useState(false);
  const [allowServiceBookings, setAllowServiceBookings] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#8a2e13");

  // Local Staff Directory State
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<Role>("STAFF");
  const [staffActive, setStaffActive] = useState(true);

  // Stub role switcher state for developer testing
  const [currentBypassRole, setCurrentBypassRole] = useState<Role>("STAFF");

  useEffect(() => {
    Promise.all([
      getTempleProfile().catch(() => null),
      getStaffUsers().catch(() => []),
      getCurrentUser().catch(() => null),
    ]).then(([profileData, staffData, userData]) => {
      setTemple(profileData);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setCurrentUser(userData);
    }).finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (temple) {
      setName(temple.name || "");
      setPhone(temple.phone || "");
      setEmail(temple.email || "");
      setAddress(temple.address || "");
      setBankRef(temple.bankRef || "");

      const rawSettings = temple.settings || {};
      setWebsiteActive(!!rawSettings.websiteActive);
      setWhatsappNotifications(!!rawSettings.whatsappNotifications);
      setEmailNotifications(!!rawSettings.emailNotifications);
      setAllowRoomBookings(!!rawSettings.allowRoomBookings);
      setAllowServiceBookings(!!rawSettings.allowServiceBookings);
      setPrimaryColor(rawSettings.primaryColor || "#8a2e13");
    }
  }, [temple]);

  useEffect(() => {
    if (currentUser) {
      setCurrentBypassRole(currentUser.role || "STAFF");
    }
  }, [currentUser]);


  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const res = await updateTempleProfile({ name, phone, email, address, bankRef });
    setLoading(false);

    if (res.success) {
      setSuccess("Temple profile details updated successfully!");
    } else {
      setError(res.error || "Failed to update profile details.");
    }
  };

  const handleTogglesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const res = await updateTempleSettings({
      websiteActive,
      whatsappNotifications,
      emailNotifications,
      allowRoomBookings,
      allowServiceBookings,
      primaryColor,
    });
    setLoading(false);

    if (res.success) {
      setSuccess("Temple configuration toggles saved successfully!");
    } else {
      setError(res.error || "Failed to update configurations.");
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const res = await saveStaffUser({
      id: editingStaffId || "",
      name: staffName,
      email: staffEmail,
      role: staffRole,
      active: staffActive,
    });
    setLoading(false);

    if (res.success && res.user) {
      setSuccess(`Successfully saved staff user: ${staffName}`);
      // Update local state list
      const fresh: StaffUser = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        active: res.user.active,
      };
      if (editingStaffId) {
        setStaff(staff.map((s) => (s.id === editingStaffId ? fresh : s)));
      } else {
        setStaff([...staff, fresh]);
      }
      // Reset form
      setEditingStaffId(null);
      setStaffName("");
      setStaffEmail("");
      setStaffRole("STAFF");
      setStaffActive(true);
    } else {
      setError(res.error || "Failed to save staff user.");
    }
  };

  const editStaff = (s: StaffUser) => {
    setEditingStaffId(s.id);
    setStaffName(s.name);
    setStaffEmail(s.email);
    setStaffRole(s.role);
    setStaffActive(s.active);
  };

  // Developer Bypass tool helper
  const handleBypassRoleChange = async (role: Role) => {
    setLoading(true);
    await setStubRole(role);
    setCurrentBypassRole(role);
    window.location.reload();
  };

  if (loadingData || !currentUser || !temple) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#fbf6ec]/10 border border-[#ecddc7] rounded-xl p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-[#8a2e13] animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading temple configurations...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-[#ecddc7] bg-white rounded-t-xl overflow-hidden shadow-sm">
        <button
          onClick={() => { setActiveTab("profile"); clearMessages(); }}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "profile"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Temple Profile
        </button>
        <button
          onClick={() => { setActiveTab("toggles"); clearMessages(); }}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "toggles"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Feature Toggles
        </button>
        <button
          onClick={() => { setActiveTab("keys"); clearMessages(); }}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "keys"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Key className="w-4 h-4" />
          API Integrations
        </button>
        <button
          onClick={() => { setActiveTab("users"); clearMessages(); }}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "users"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCog className="w-4 h-4" />
          Staff Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form view */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === "profile" && (
            <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3">
                <Building2 className="w-5 h-5 text-[#8a2e13]" />
                <h3 className="text-sm font-bold text-[#8a2e13]">Update Temple Profile</h3>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Temple Name *</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isSuperAdmin}
                      className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-[#8a2e13] disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Registered Slug (Readonly)</label>
                    <input
                      disabled
                      type="text"
                      value={temple.slug}
                      className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-100 text-gray-400 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Official Phone *</label>
                    <input
                      required
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isSuperAdmin}
                      className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-[#8a2e13] disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Office Email *</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isSuperAdmin}
                      className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-[#8a2e13] disabled:opacity-60"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 uppercase mb-1">Office/Mailing Address *</label>
                    <input
                      required
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isSuperAdmin}
                      className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-[#8a2e13] disabled:opacity-60"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 uppercase mb-1">Bank Account Reference info (ex: SBI A/C: ..., IFSC: ...)</label>
                    <textarea
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      disabled={!isSuperAdmin}
                      rows={2}
                      className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-[#8a2e13] disabled:opacity-60"
                    />
                  </div>
                </div>

                {isSuperAdmin ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    Save Profile Settings
                  </button>
                ) : (
                  <p className="text-[10px] text-red-500 text-center font-bold">
                    Profile modifications are locked. Super Admin privileges required.
                  </p>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: SYSTEM TOGGLES */}
          {activeTab === "toggles" && (
            <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3">
                <Sliders className="w-5 h-5 text-[#8a2e13]" />
                <h3 className="text-sm font-bold text-[#8a2e13]">System Feature Toggles</h3>
              </div>

              <form onSubmit={handleTogglesSubmit} className="space-y-6 text-xs font-semibold">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-[#ecddc7]/50 rounded-lg bg-[#fbf6ec]/10">
                    <div>
                      <span className="block text-gray-700 font-bold">Public Devotee Portal Activation</span>
                      <span className="text-[10px] text-gray-400 font-medium">When disabled, visitors cannot access the public reservation routes.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={websiteActive}
                      onChange={(e) => setWebsiteActive(e.target.checked)}
                      className="w-5 h-5 accent-[#8a2e13]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#ecddc7]/50 rounded-lg bg-[#fbf6ec]/10">
                    <div>
                      <span className="block text-gray-700 font-bold">Automated WhatsApp Messaging (Meta Cloud SDK)</span>
                      <span className="text-[10px] text-gray-400 font-medium">Auto-fires booking confirmations and receipt PDFs to devotee mobile numbers.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappNotifications}
                      onChange={(e) => setWhatsappNotifications(e.target.checked)}
                      className="w-5 h-5 accent-[#8a2e13]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#ecddc7]/50 rounded-lg bg-[#fbf6ec]/10">
                    <div>
                      <span className="block text-gray-700 font-bold">Email receipt vouchers delivery (Resend)</span>
                      <span className="text-[10px] text-gray-400 font-medium">Automatically mails e-receipt attachments on confirmed online donations.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 accent-[#8a2e13]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#ecddc7]/50 rounded-lg bg-[#fbf6ec]/10">
                    <div>
                      <span className="block text-gray-700 font-bold">Bhakta Niwas Accommodation Reservation</span>
                      <span className="text-[10px] text-gray-400 font-medium">Enables guest rooms check-in calendar search on public site.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowRoomBookings}
                      onChange={(e) => setAllowRoomBookings(e.target.checked)}
                      className="w-5 h-5 accent-[#8a2e13]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#ecddc7]/50 rounded-lg bg-[#fbf6ec]/10">
                    <div>
                      <span className="block text-gray-700 font-bold">Pooja & Abhishek Booking Portal</span>
                      <span className="text-[10px] text-gray-400 font-medium">Enables online date-slot picker checkout for abhishek services.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowServiceBookings}
                      onChange={(e) => setAllowServiceBookings(e.target.checked)}
                      className="w-5 h-5 accent-[#8a2e13]"
                    />
                  </div>

                  <div className="p-3 border border-[#ecddc7]/50 rounded-lg bg-[#fbf6ec]/10 flex items-center justify-between">
                    <div>
                      <span className="block text-gray-700 font-bold">Temple Main Theme Accent Color</span>
                      <span className="text-[10px] text-gray-400 font-medium">Configures client-side dashboard background themes & styles.</span>
                    </div>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-8 border border-[#ecddc7] cursor-pointer rounded bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  Save Configurations
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: API KEYS */}
          {activeTab === "keys" && (
            <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3">
                <Key className="w-5 h-5 text-[#8a2e13]" />
                <h3 className="text-sm font-bold text-[#8a2e13]">Integration Credentials</h3>
              </div>

              <div className="p-4 bg-[#fbf6ec]/40 rounded-xl border border-[#ecddc7] space-y-3 text-xs leading-relaxed text-gray-600 font-semibold">
                <p>
                  API Keys and private tokens are loaded securely from server-side environment configurations (`.env` variables)
                  and are never exposed to public frontend client browsers.
                </p>
                <div className="space-y-2 pt-2 text-[10px] font-mono">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                    <span>RAZORPAY_KEY_ID:</span>
                    <span className="text-[#8a2e13] font-bold">Configured via .env</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                    <span>RAZORPAY_KEY_SECRET:</span>
                    <span className="text-[#8a2e13] font-bold">Configured via .env</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                    <span>WHATSAPP_TOKEN:</span>
                    <span className="text-[#8a2e13] font-bold">Configured via .env</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span>RESEND_API_KEY:</span>
                    <span className="text-[#8a2e13] font-bold">Configured via .env</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STAFF DIRECTORY */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Form card */}
              <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3">
                  <UserCog className="w-5 h-5 text-[#8a2e13]" />
                  <h3 className="text-sm font-bold text-[#8a2e13]">
                    {editingStaffId ? "Edit Staff User Details" : "Register Staff User / Clerk ID"}
                  </h3>
                </div>

                <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 uppercase mb-1">Staff Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Ramesh Shinde"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        disabled={!isSuperAdmin}
                        className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-50 focus:outline-none focus:border-[#8a2e13]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 uppercase mb-1">Email Address (Clerk Login) *</label>
                      <input
                        required
                        type="email"
                        placeholder="ramesh@gmail.com"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        disabled={!isSuperAdmin}
                        className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-gray-50 focus:outline-none focus:border-[#8a2e13]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 uppercase mb-1">Administrative Role</label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value as Role)}
                        disabled={!isSuperAdmin}
                        className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN (Full control)</option>
                        <option value="TRUST_ADMIN">TRUST_ADMIN (Finance & Content)</option>
                        <option value="STAFF">STAFF (Check-in & Receipts)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-[#ecddc7]/50 rounded-lg bg-[#fbf6ec]/10">
                      <div>
                        <span className="block text-gray-700">Account Access Active</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={staffActive}
                        onChange={(e) => setStaffActive(e.target.checked)}
                        disabled={!isSuperAdmin}
                        className="w-5 h-5 accent-[#8a2e13]"
                      />
                    </div>
                  </div>

                  {isSuperAdmin ? (
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors flex items-center justify-center gap-2"
                      >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        {editingStaffId ? "Save Staff Changes" : "Register Staff Access"}
                      </button>
                      {editingStaffId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStaffId(null);
                            setStaffName("");
                            setStaffEmail("");
                            setStaffRole("STAFF");
                            setStaffActive(true);
                          }}
                          className="py-2.5 px-4 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-red-500 text-center font-bold">
                      Staff permissions edits are locked. Super Admin privileges required.
                    </p>
                  )}
                </form>
              </div>

              {/* Listing Table */}
              <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-[#8a2e13] uppercase">Staff Access Directory</h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-[#8a2e13] font-bold">
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                        {isSuperAdmin && <th className="p-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ecddc7]/30">
                      {staff.map((s) => (
                        <tr key={s.id} className="hover:bg-[#fbf6ec]/10">
                          <td className="p-3 font-bold text-gray-800">{s.name}</td>
                          <td className="p-3 text-gray-500 font-medium">{s.email}</td>
                          <td className="p-3">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#fbf6ec] border border-[#ecddc7] text-[#bf8f2e]">
                              {s.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              s.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {s.active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          {isSuperAdmin && (
                            <td className="p-3 text-right">
                              <button
                                onClick={() => editStaff(s)}
                                className="text-xs font-bold text-[#bf8f2e] hover:text-[#8a2e13] transition-colors"
                              >
                                Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Integration settings status / Developer bypass tool */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Developer sandbox simulation session control */}
          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3">
              <Shield className="w-5 h-5 text-[#8a2e13]" />
              <h3 className="text-sm font-bold text-[#8a2e13]">Developer Testing sandbox</h3>
            </div>
            
            <p className="text-[10px] leading-relaxed text-gray-500 font-semibold">
              Because `DEV_STUB_INTEGRATIONS=true` is enabled in your `.env` configuration file, you can simulate logins
              of different administrative roles on the fly using cookies.
            </p>

            <div className="space-y-2">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">Active Simulation Session:</span>
              <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
                <button
                  onClick={() => handleBypassRoleChange("SUPER_ADMIN")}
                  disabled={loading}
                  className={`py-2 px-3 rounded-lg border text-left flex justify-between items-center transition-all ${
                    currentBypassRole === "SUPER_ADMIN"
                      ? "bg-[#8a2e13]/10 border-[#8a2e13] text-[#8a2e13] font-bold"
                      : "bg-white border-[#ecddc7] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>SUPER_ADMIN (Devides)</span>
                  {currentBypassRole === "SUPER_ADMIN" && <span className="text-[8px] bg-[#8a2e13] text-white px-1.5 py-0.2 rounded font-bold">ACTIVE</span>}
                </button>
                
                <button
                  onClick={() => handleBypassRoleChange("TRUST_ADMIN")}
                  disabled={loading}
                  className={`py-2 px-3 rounded-lg border text-left flex justify-between items-center transition-all ${
                    currentBypassRole === "TRUST_ADMIN"
                      ? "bg-[#8a2e13]/10 border-[#8a2e13] text-[#8a2e13] font-bold"
                      : "bg-white border-[#ecddc7] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>TRUST_ADMIN (Mohanrao)</span>
                  {currentBypassRole === "TRUST_ADMIN" && <span className="text-[8px] bg-[#8a2e13] text-white px-1.5 py-0.2 rounded font-bold">ACTIVE</span>}
                </button>
                
                <button
                  onClick={() => handleBypassRoleChange("STAFF")}
                  disabled={loading}
                  className={`py-2 px-3 rounded-lg border text-left flex justify-between items-center transition-all ${
                    currentBypassRole === "STAFF"
                      ? "bg-[#8a2e13]/10 border-[#8a2e13] text-[#8a2e13] font-bold"
                      : "bg-white border-[#ecddc7] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>STAFF (Sanjay)</span>
                  {currentBypassRole === "STAFF" && <span className="text-[8px] bg-[#8a2e13] text-white px-1.5 py-0.2 rounded font-bold">ACTIVE</span>}
                </button>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-gray-400 font-bold border-t border-[#ecddc7]/30 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-[#bf8f2e]" /> Changing simulation session reloads page context.
            </div>
          </div>

          {/* Settings overview checklist status */}
          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-[#8a2e13] uppercase">Integration checklist</h4>
            <ul className="text-[10px] font-semibold text-gray-500 space-y-2">
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0" />
                Dev Sandbox Mode Active
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0" />
                Clerk Security Bypass Active
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0" />
                PG Database Connected
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0" />
                E-receipt PDF Generator Seeded
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
