import React, { useState, useEffect } from "react";
import { 
  createMessageGroup, 
  deleteMessageGroup, 
  createMessageTemplate, 
  deleteMessageTemplate, 
  triggerBroadcast,
  getMessageGroups,
  getBroadcasts
} from "@/api/communication";
import { 
  Plus, 
  MessageSquare, 
  Send, 
  List, 
  Trash2, 
  Volume2, 
  AlertCircle, 
  CheckCircle2, 
  Loader 
} from "lucide-react";
type ChannelType = "WHATSAPP" | "SMS" | "WEB";

interface TemplateItem {
  id: string;
  groupId: string;
  name: string;
  channel: ChannelType;
  body: string;
  variables: string[];
  whatsappTemplateName: string | null;
  language: string;
  active: boolean;
}

interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  templates: TemplateItem[];
}

interface BroadcastRow {
  id: string;
  scheduledAt: Date | null;
  status: string;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  template: { name: string };
  audience: any;
}

export default function CommunicationClient() {
  const [activeTab, setActiveTab] = useState<"templates" | "broadcasts" | "history">("templates");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupItem | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      getMessageGroups().catch(() => []),
      getBroadcasts().catch(() => []),
    ]).then(([groupList, broadcastList]) => {
      setGroups(Array.isArray(groupList) ? groupList : []);
      setBroadcasts(Array.isArray(broadcastList) ? broadcastList : []);
    }).finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (groups.length > 0 && !activeGroup) {
      setActiveGroup(groups[0]);
    }
  }, [groups, activeGroup]);


  // Group Form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  // Template Form
  const [newTmplName, setNewTmplName] = useState("");
  const [newTmplBody, setNewTmplBody] = useState("");
  const [newTmplVars, setNewTmplVars] = useState("name");
  const [newTmplMeta, setNewTmplMeta] = useState("");

  // Broadcast Form
  const [selectedTmplId, setSelectedTmplId] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastRes, setBroadcastRes] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;

    const res = await createMessageGroup({
      name: newGroupName,
      description: newGroupDesc,
      active: true,
    });

    if (res.success) {
      alert("Group added successfully!");
      window.location.reload();
    } else {
      alert("Failed to create group");
    }
  };

  const handleGroupDelete = async (id: string, name: string) => {
    if (!confirm(`Delete message group ${name}? This will delete all its templates.`)) return;
    const res = await deleteMessageGroup(id);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "Failed to delete");
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !newTmplName || !newTmplBody) return;

    const res = await createMessageTemplate({
      groupId: activeGroup.id,
      name: newTmplName,
      channel: "WHATSAPP",
      body: newTmplBody,
      variables: newTmplVars.split(",").map((v) => v.trim()),
      whatsappTemplateName: newTmplMeta || null,
      language: "mr",
      active: true,
    });

    if (res.success) {
      alert("Template added successfully!");
      window.location.reload();
    } else {
      alert("Failed to create template");
    }
  };

  const handleTemplateDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const res = await deleteMessageTemplate(id);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "Failed to delete");
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTmplId) return;

    setBroadcasting(true);
    setBroadcastRes(null);

    const res = await triggerBroadcast(selectedTmplId, cityFilter);
    setBroadcasting(false);

    if (res.success) {
      setBroadcastRes(`Broadcast finished successfully! Delivered: ${res.sentCount} | Failed: ${res.failedCount}`);
      // Refresh broadcasts history
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setBroadcastRes(`Error: ${res.error || "Failed to deliver broadcast"}`);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#fbf6ec]/10 border border-[#ecddc7] rounded-xl p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-[#8a2e13] animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading communications console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[#ecddc7] bg-white rounded-t-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "templates"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Template Groups
        </button>
        <button
          onClick={() => setActiveTab("broadcasts")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "broadcasts"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send className="w-4 h-4" />
          Launch Broadcast
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "history"
              ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <List className="w-4 h-4" />
          Broadcast logs
        </button>
      </div>

      {/* VIEW: GROUPS & TEMPLATES */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Groups sidebar Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#ecddc7] shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a2e13] mb-4">Subscriber Groups</h3>
              <div className="space-y-2">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setActiveGroup(g)}
                    className={`p-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors flex justify-between items-center ${
                      activeGroup?.id === g.id
                        ? "border-[#8a2e13] bg-[#8a2e13] text-[#fbf6ec]"
                        : "border-[#ecddc7] hover:bg-[#fbf6ec]/20"
                    }`}
                  >
                    <div>
                      <p>{g.name}</p>
                      <p className={`text-[9px] mt-0.5 ${activeGroup?.id === g.id ? "text-[#fbf6ec]/70" : "text-gray-400"}`}>
                        {g.templates.length} templates
                      </p>
                    </div>
                    {g.templates.length === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupDelete(g.id, g.name);
                        }}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create Group */}
            <div className="bg-white p-4 rounded-xl border border-[#ecddc7] shadow-sm text-xs">
              <h3 className="font-bold text-[#8a2e13] mb-3">Add Group Card</h3>
              <form onSubmit={handleGroupSubmit} className="space-y-3">
                <div>
                  <input
                    required
                    type="text"
                    placeholder="Group Name (e.g. Festival Greetings)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Description of group..."
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
                >
                  Create Group
                </button>
              </form>
            </div>
          </div>

          {/* Templates list & Add template Column */}
          <div className="lg:col-span-3 space-y-6">
            {activeGroup ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Templates List */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[#ecddc7]/30 pb-3">
                    <h3 className="text-base font-bold text-[#8a2e13]">{activeGroup.name} Templates</h3>
                  </div>

                  {activeGroup.templates.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                      No templates created under this group yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeGroup.templates.map((t) => (
                        <div key={t.id} className="p-4 border border-[#ecddc7]/70 bg-[#fbf6ec]/10 rounded-xl relative">
                          <button
                            onClick={() => handleTemplateDelete(t.id)}
                            className="absolute top-4 right-4 p-1 bg-white border border-[#ecddc7] text-red-500 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <h4 className="text-xs font-bold text-[#8a2e13]">{t.name}</h4>
                          {t.whatsappTemplateName && (
                            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold">
                              Meta Template: {t.whatsappTemplateName}
                            </span>
                          )}
                          <div className="mt-3 p-3 bg-white border border-[#ecddc7]/40 rounded-lg text-xs font-medium text-gray-700 whitespace-pre-wrap">
                            {t.body}
                          </div>
                          <div className="mt-2 text-[10px] text-gray-400 font-bold">
                            Supported tags: {t.variables.map((v) => `{{${v}}}`).join(", ") || "None"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Template Form */}
                <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm h-fit">
                  <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Add WhatsApp Template</h3>
                  <form onSubmit={handleTemplateSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Template Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Festival Wishes"
                        value={newTmplName}
                        onChange={(e) => setNewTmplName(e.target.value)}
                        className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">WhatsApp Approved Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. festival_wishes_approved"
                        value={newTmplMeta}
                        onChange={(e) => setNewTmplMeta(e.target.value)}
                        className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Template Body (Plain text) *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Hi {{name}}, Greetings from Shri Mallikarjun Temple..."
                        value={newTmplBody}
                        onChange={(e) => setNewTmplBody(e.target.value)}
                        className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Variables list (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. name, date, time"
                        value={newTmplVars}
                        onChange={(e) => setNewTmplVars(e.target.value)}
                        className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
                    >
                      Save Template
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="bg-white p-12 text-center text-sm text-gray-400 border border-[#ecddc7] rounded-xl font-medium">
                Create a subscriber group first to manage message templates.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: LAUNCH BROADCAST */}
      {activeTab === "broadcasts" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#ecddc7]/30 pb-4 mb-6">
            <Volume2 className="w-6 h-6 text-[#8a2e13]" />
            <div>
              <h3 className="text-base font-bold text-[#8a2e13]">Dispatch WhatsApp/SMS Broadcast</h3>
              <p className="text-xs text-gray-500 font-medium">Broadcast news, notifications, or invitations to targeted devotee sheets.</p>
            </div>
          </div>

          {broadcastRes && (
            <div className={`p-4 rounded-lg text-xs font-bold mb-6 border ${
              broadcastRes.startsWith("Error")
                ? "bg-red-50 border-red-100 text-red-700"
                : "bg-emerald-50 border-emerald-100 text-emerald-700 flex items-center gap-2"
            }`}>
              {!broadcastRes.startsWith("Error") && <CheckCircle2 className="w-5 h-5" />}
              {broadcastRes}
            </div>
          )}

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Select Message Template *</label>
              <select
                required
                value={selectedTmplId}
                onChange={(e) => setSelectedTmplId(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
              >
                <option value="">-- Choose Template --</option>
                {groups.flatMap((g) => g.templates).map((t) => (
                  <option key={t.id} value={t.id}>{t.name} (Lang: {t.language})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Filter Audience by City (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Pune (leave empty to broadcast to all consented devotees)"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none"
              />
            </div>

            <div className="bg-[#fbf6ec] border border-[#ecddc7] p-4 rounded-lg text-gray-600 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#bf8f2e] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#2a1810]">GDPR & Telecom Rules Consent Gated</p>
                <p className="mt-1 font-medium leading-relaxed">
                  This broadcast will only deliver to devotees who have enabled the **WhatsApp Consent checkbox** in their CRM contact sheet. Double-check template variables before dispatch.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors flex items-center justify-center gap-2"
            >
              {broadcasting && <Loader className="w-4 h-4 animate-spin" />}
              Send Broadcast Now
            </button>
          </form>
        </div>
      )}

      {/* VIEW: BROADCAST HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <h3 className="text-base font-bold text-[#8a2e13] mb-4">Auspicious Broadcasts Logs</h3>
          
          {broadcasts.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold">
              No historical broadcasts executed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#fbf6ec] border-b border-[#ecddc7] text-[#8a2e13] font-bold">
                    <th className="p-3">Sent Time</th>
                    <th className="p-3">Template Name</th>
                    <th className="p-3">Audience Filters</th>
                    <th className="p-3 text-center">Delivered</th>
                    <th className="p-3 text-center">Failed</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecddc7]/30">
                  {broadcasts.map((b) => (
                    <tr key={b.id} className="hover:bg-[#fbf6ec]/10">
                      <td className="p-3 font-semibold text-gray-600">{formatDate(b.createdAt)}</td>
                      <td className="p-3 font-bold text-[#2a1810]">{b.template.name}</td>
                      <td className="p-3 text-gray-500 font-medium">City: {b.audience?.cityFilter || "ALL"}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{b.sentCount}</td>
                      <td className="p-3 text-center font-bold text-red-500">{b.failedCount}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                          b.status === "SENT" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
