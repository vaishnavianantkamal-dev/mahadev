import React, { useState, useEffect } from "react";
import { 
  createDarshanTiming, 
  deleteDarshanTiming, 
  createEvent, 
  deleteEvent, 
  updateLiveDarshan, 
  createMediaItem, 
  deleteMediaItem, 
  updateSiteContent,
  getDarshanTimings,
  getEvents,
  getLiveDarshans,
  getMediaItems,
  getSiteContents
} from "@/api/content";
import { 
  FileText, 
  Clock, 
  Calendar, 
  Tv, 
  Music, 
  Plus, 
  Trash2, 
  Loader, 
  CheckCircle2, 
  Play, 
  Video 
} from "lucide-react";
type DarshanType = "AARTI" | "DARSHAN" | "MAHAPRASAD";
type MediaItemType = "AUDIO" | "VIDEO" | "TEXT" | "IMAGE";
type MediaCategory = "AARTI" | "STOTRA" | "CHALISA" | "HISTORY" | "OTHER";
type Locale = "mr" | "en";

interface TimingRow {
  id: string;
  label: string;
  type: DarshanType;
  time: string;
  dayRule: string | null;
  active: boolean;
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  isFestival: boolean;
  bannerUrl: string | null;
}

interface LiveRow {
  id: string;
  title: string;
  youtubeId: string;
  isLive: boolean;
}

interface MediaRow {
  id: string;
  type: MediaItemType;
  category: MediaCategory;
  title: string;
  url: string;
  language: string;
}

interface ContentRow {
  id: string;
  key: string;
  title: string;
  bodyRich: string;
  locale: Locale;
}

export default function ContentClient() {
  const [activeTab, setActiveTab] = useState<"siteTexts" | "timings" | "events" | "live" | "media">("siteTexts");
  const [timings, setTimings] = useState<TimingRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [lives, setLives] = useState<LiveRow[]>([]);
  const [medias, setMedias] = useState<MediaRow[]>([]);
  const [siteTexts, setSiteTexts] = useState<ContentRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Live Stream Form
  const activeLive = lives[0];
  const [liveTitle, setLiveTitle] = useState("");
  const [liveYtId, setLiveYtId] = useState("");
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [liveSuccess, setLiveSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      getDarshanTimings().catch(() => []),
      getEvents().catch(() => []),
      getLiveDarshans().catch(() => []),
      getMediaItems().catch(() => []),
      getSiteContents().catch(() => []),
    ]).then(([tList, eList, lList, mList, sList]) => {
      setTimings(Array.isArray(tList) ? tList : []);
      setEvents(Array.isArray(eList) ? eList : []);
      setLives(Array.isArray(lList) ? lList : []);
      setMedias(Array.isArray(mList) ? mList : []);
      setSiteTexts(Array.isArray(sList) ? sList : []);
    }).finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (lives.length > 0) {
      const activeLive = lives[0];
      setLiveTitle(activeLive?.title || "");
      setLiveYtId(activeLive?.youtubeId || "");
      setIsLiveStream(activeLive?.isLive || false);
    }
  }, [lives]);

  // Timing Form
  const [timeLabel, setTimeLabel] = useState("");
  const [timeType, setTimeType] = useState<DarshanType>("DARSHAN");
  const [timeVal, setTimeVal] = useState("");
  const [timeRule, setTimeRule] = useState("Daily");

  // Event Form
  const [evtTitle, setEvtTitle] = useState("");
  const [evtDesc, setEvtDesc] = useState("");
  const [evtStart, setEvtStart] = useState("");
  const [evtEnd, setEvtEnd] = useState("");
  const [evtFestival, setEvtFestival] = useState(true);

  // Media Form
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaItemType>("AUDIO");
  const [mediaCat, setMediaCat] = useState<MediaCategory>("AARTI");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaLang, setMediaLang] = useState("mr");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLive) return;
    setLiveSuccess(false);

    const res = await updateLiveDarshan(activeLive.id, {
      title: liveTitle,
      youtubeId: liveYtId,
      isLive: isLiveStream,
    });

    if (res.success) {
      setLiveSuccess(true);
      setTimeout(() => setLiveSuccess(false), 2000);
    } else {
      alert("Failed to update live stream details");
    }
  };

  const handleTimingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeLabel || !timeVal) return;

    const res = await createDarshanTiming({
      label: timeLabel,
      type: timeType,
      time: timeVal,
      dayRule: timeRule,
      active: true,
    });

    if (res.success) {
      alert("Timing entry added successfully!");
      window.location.reload();
    } else {
      alert("Failed to save timing");
    }
  };

  const handleTimingDelete = async (id: string) => {
    if (!confirm("Delete this timing entry?")) return;
    const res = await deleteDarshanTiming(id);
    if (res.success) window.location.reload();
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtDesc || !evtStart || !evtEnd) return;

    const res = await createEvent({
      title: evtTitle,
      description: evtDesc,
      startAt: new Date(evtStart),
      endAt: new Date(evtEnd),
      isFestival: evtFestival,
      bannerUrl: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?q=80&w=800",
    });

    if (res.success) {
      alert("Festival/Event added successfully!");
      window.location.reload();
    } else {
      alert("Failed to save event");
    }
  };

  const handleEventDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const res = await deleteEvent(id);
    if (res.success) window.location.reload();
  };

  const handleMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaTitle || !mediaUrl) return;

    const res = await createMediaItem({
      title: mediaTitle,
      type: mediaType,
      category: mediaCat,
      url: mediaUrl,
      language: mediaLang,
    });

    if (res.success) {
      alert("Media item registered successfully!");
      window.location.reload();
    } else {
      alert("Failed to save media");
    }
  };

  const handleMediaDelete = async (id: string) => {
    if (!confirm("Delete this media entry?")) return;
    const res = await deleteMediaItem(id);
    if (res.success) window.location.reload();
  };

  const handleTextUpdate = async (id: string, key: string, title: string, body: string) => {
    const res = await updateSiteContent(id, title, body);
    if (res.success) {
      alert(`Updated content block [${key}] successfully!`);
    } else {
      alert("Failed to save edits");
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#fbf6ec]/10 border border-[#ecddc7] rounded-xl p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-[#8a2e13] animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading website content data...</p>
        </div>
      </div>
    );
  }

  return (

    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex border-b border-[#ecddc7] bg-white rounded-t-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("siteTexts")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "siteTexts" ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Bilingual Site Text
        </button>
        <button
          onClick={() => setActiveTab("timings")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "timings" ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          Darshan Timings
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "events" ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Festivals Calendar
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "live" ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Tv className="w-4 h-4" />
          Live stream Link
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "media" ? "border-[#8a2e13] text-[#8a2e13] bg-[#fbf6ec]/10" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Music className="w-4 h-4" />
          Media Players
        </button>
      </div>

      {/* VIEW: BILINGUAL SITE TEXTS */}
      {activeTab === "siteTexts" && (
        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#8a2e13]">Website Translations Center</h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">Edit the content blocks shown on the public landing page in Marathi and English.</p>
          </div>

          <div className="space-y-6 divide-y divide-[#ecddc7]/30">
            {siteTexts.map((text) => (
              <div key={text.id} className="pt-6 first:pt-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-bold text-[#8a2e13] text-xs uppercase tracking-wider">{text.key}</span>
                    <span className="ml-2 px-1.5 py-0.2 rounded text-[8px] bg-[#fbf6ec] border border-[#ecddc7] text-[#bf8f2e] font-bold uppercase">
                      {text.locale}
                    </span>
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                    const body = (form.elements.namedItem("body") as HTMLTextAreaElement).value;
                    handleTextUpdate(text.id, text.key, title, body);
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                >
                  <div className="md:col-span-1">
                    <label className="block font-bold text-gray-500 mb-1">Header Title</label>
                    <input
                      name="title"
                      defaultValue={text.title}
                      className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block font-bold text-gray-500 mb-1">Body Text</label>
                      <textarea
                        name="body"
                        defaultValue={text.bodyRich}
                        rows={2}
                        className="w-full p-2 border border-[#ecddc7] rounded-lg bg-[#fbf6ec]/10 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
                    >
                      Save block
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: DARSHAN TIMINGS */}
      {activeTab === "timings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#8a2e13]">Today's Aarti & Darshan Schedule</h3>
            <div className="divide-y divide-[#ecddc7]/30 text-xs">
              {timings.map((t) => (
                <div key={t.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#2a1810]">{t.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Rule: {t.dayRule || "Daily"} | Type: {t.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-[#bf8f2e]">{t.time}</p>
                    <button
                      onClick={() => handleTimingDelete(t.id)}
                      className="p-1 text-red-500 hover:bg-red-50 border border-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm text-xs">
            <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Add Timing Slot</h3>
            <form onSubmit={handleTimingSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Timing Slot Label *</label>
                <input
                  required
                  placeholder="e.g. Kakad Aarti (काकड आरती)"
                  value={timeLabel}
                  onChange={(e) => setTimeLabel(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Time Category</label>
                  <select
                    value={timeType}
                    onChange={(e) => setTimeType(e.target.value as DarshanType)}
                    className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                  >
                    <option value="AARTI">AARTI</option>
                    <option value="DARSHAN">DARSHAN</option>
                    <option value="MAHAPRASAD">MAHAPRASAD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Timings (Range) *</label>
                  <input
                    required
                    placeholder="e.g. 06:00 AM - 07:00 AM"
                    value={timeVal}
                    onChange={(e) => setTimeVal(e.target.value)}
                    className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Recurrence Rule</label>
                <input
                  placeholder="e.g. Daily / Thursday only"
                  value={timeRule}
                  onChange={(e) => setTimeRule(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
              >
                Add Timing Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: FESTIVALS EVENTS */}
      {activeTab === "events" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#8a2e13]">Dynamic Festivals List</h3>
            <div className="space-y-4">
              {events.map((evt) => (
                <div key={evt.id} className="p-4 border border-[#ecddc7]/70 bg-[#fbf6ec]/10 rounded-xl relative flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-[#2a1810]">{evt.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">
                      Range: {formatDate(evt.startAt)} to {formatDate(evt.endAt)}
                    </p>
                    <p className="mt-2 text-gray-600 leading-relaxed font-semibold">{evt.description}</p>
                  </div>
                  <button
                    onClick={() => handleEventDelete(evt.id)}
                    className="p-1 text-red-500 hover:bg-red-50 border border-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm text-xs">
            <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Add Festival / Event</h3>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Festival / Event Title *</label>
                <input
                  required
                  placeholder="e.g. Mahashivratri Celebrations"
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide schedule details, naivedya items, and events information..."
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Start Date *</label>
                  <input
                    required
                    type="date"
                    value={evtStart}
                    onChange={(e) => setEvtStart(e.target.value)}
                    className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-500 mb-1">End Date *</label>
                  <input
                    required
                    type="date"
                    value={evtEnd}
                    onChange={(e) => setEvtEnd(e.target.value)}
                    className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: LIVE STREAM */}
      {activeTab === "live" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#ecddc7]/30 pb-4 mb-6">
            <Tv className="w-6 h-6 text-[#8a2e13]" />
            <div>
              <h3 className="text-base font-bold text-[#8a2e13]">Nitya Live Darshan Config</h3>
              <p className="text-xs text-gray-500 font-medium">Control the YouTube live stream URL displayed on the devotee portal.</p>
            </div>
          </div>

          {liveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Live Stream updated successfully!
            </div>
          )}

          <form onSubmit={handleLiveSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Stream Display Title *</label>
              <input
                required
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-500 mb-1">YouTube Video ID (or URL) *</label>
              <input
                required
                placeholder="e.g. dQw4w9WgXcQ"
                value={liveYtId}
                onChange={(e) => setLiveYtId(e.target.value)}
                className="w-full p-2.5 border border-[#ecddc7] rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isLiveStream"
                checked={isLiveStream}
                onChange={(e) => setIsLiveStream(e.target.checked)}
                className="w-4 h-4 text-[#8a2e13] border-[#ecddc7] rounded"
              />
              <label htmlFor="isLiveStream" className="ml-2 font-semibold text-gray-600 cursor-pointer">
                Mark Live Stream as ACTIVE (Renders blinking LIVE badge on website)
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
            >
              Update Stream Config
            </button>
          </form>
        </div>
      )}

      {/* VIEW: MEDIA PLAYERS */}
      {activeTab === "media" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#8a2e13]">Sacred Media Catalog</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {medias.map((m) => (
                <div key={m.id} className="p-4 border border-[#ecddc7]/70 bg-[#fbf6ec]/10 rounded-xl relative flex flex-col justify-between">
                  <button
                    onClick={() => handleMediaDelete(m.id)}
                    className="absolute top-4 right-4 p-1 bg-white border border-[#ecddc7] text-red-500 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <span className="px-1.5 py-0.2 rounded text-[8px] bg-white border border-[#ecddc7] text-[#bf8f2e] font-bold uppercase">
                      {m.type}
                    </span>
                    <h4 className="font-bold text-[#2a1810] mt-2">{m.title}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Category: {m.category} | Lang: {m.language}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {m.type === "AUDIO" ? (
                      <audio controls src={m.url} className="w-full h-8" />
                    ) : (
                      <a
                        href={m.url}
                        target="_blank"
                        className="flex items-center gap-1.5 text-[#bf8f2e] hover:underline font-bold"
                      >
                        <Video className="w-4 h-4" /> Watch Video
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm text-xs">
            <h3 className="text-sm font-bold text-[#8a2e13] mb-4">Register Media Resource</h3>
            <form onSubmit={handleMediaSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Resource Title *</label>
                <input
                  required
                  placeholder="e.g. Kakad Aarti MP3 Audio"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Resource Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as MediaItemType)}
                    className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                  >
                    <option value="AUDIO">AUDIO</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="TEXT">TEXT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Category</label>
                  <select
                    value={mediaCat}
                    onChange={(e) => setMediaCat(e.target.value as MediaCategory)}
                    className="w-full p-2.5 border border-[#ecddc7] rounded-lg bg-white focus:outline-none"
                  >
                    <option value="AARTI">AARTI</option>
                    <option value="STOTRA">STOTRA</option>
                    <option value="CHALISA">CHALISA</option>
                    <option value="HISTORY">HISTORY</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Resource URL (or body text) *</label>
                <input
                  required
                  placeholder="e.g. Audio URL or YouTube Link"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full p-2 border border-[#ecddc7] rounded-lg focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors"
              >
                Register Resource
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
