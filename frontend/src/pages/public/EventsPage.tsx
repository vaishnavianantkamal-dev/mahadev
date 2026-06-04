import React, { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getPublicEvents } from "@/api/public";

export default function EventsPage() {
  const { locale, t } = useLocale();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === "mr" ? "mr-IN" : "en-IN", {
      month: "short", day: "numeric", year: "numeric",
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#2a1810] space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#8a2e13] uppercase">{t.events}</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Shri Mallikarjun Festivals Calendar</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#ecddc7] h-32 animate-pulse" />
          ))
        ) : events.length === 0 ? (
          <div className="bg-white p-12 text-center text-xs text-gray-400 font-semibold border border-[#ecddc7] rounded-2xl">
            No dynamic festivals registered currently. Check back during holy months.
          </div>
        ) : (
          events.map((evt: any) => (
            <div key={evt.id} className="bg-white rounded-2xl border border-[#ecddc7] shadow-sm overflow-hidden flex flex-col md:flex-row">
              {evt.bannerUrl && (
                <img src={evt.bannerUrl} alt={evt.title} className="w-full md:w-56 h-48 object-cover border-b md:border-b-0 md:border-r border-[#ecddc7]/30" />
              )}
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <h4 className="font-bold text-sm text-[#2a1810]">{evt.title}</h4>
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold mt-1">
                    <Clock className="w-3.5 h-3.5 text-[#bf8f2e]" />
                    <span>{formatDate(evt.startAt)} to {formatDate(evt.endAt)}</span>
                  </div>
                  <p className="text-gray-500 mt-4 leading-relaxed font-semibold">{evt.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
