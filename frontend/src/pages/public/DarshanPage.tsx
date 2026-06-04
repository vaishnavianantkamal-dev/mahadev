import React, { useEffect, useState } from "react";
import { Clock, Tv } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getPublicTimings, getPublicLiveDarshan } from "@/api/public";

export default function DarshanPage() {
  const { t } = useLocale();
  const [timings, setTimings] = useState<any[]>([]);
  const [liveStream, setLiveStream] = useState<any>(null);

  useEffect(() => {
    getPublicTimings().then(setTimings);
    getPublicLiveDarshan().then(setLiveStream);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#2a1810] space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#8a2e13] uppercase">{t.darshan}</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Shri Mallikarjun Devasthan Timings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Timings */}
        <div className="bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#ecddc7]/50 pb-4">
            <Clock className="w-5 h-5 text-[#8a2e13]" />
            <h3 className="text-lg font-bold text-[#8a2e13]">{t.timings}</h3>
          </div>
          <div className="divide-y divide-[#ecddc7]/30 text-xs font-semibold text-gray-700">
            {timings.length === 0 ? (
              <p className="py-6 text-center text-gray-400">No timings available</p>
            ) : (
              timings.map((time: any) => (
                <div key={time.id} className="py-3.5 flex justify-between items-center">
                  <span>{time.label}</span>
                  <span className="font-bold text-[#bf8f2e]">{time.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Stream */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#ecddc7]/50 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-[#8a2e13]" />
              <h3 className="text-lg font-bold text-[#8a2e13]">{t.liveDarshan}</h3>
            </div>
            {liveStream?.isLive ? (
              <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 border border-red-200 rounded text-[9px] font-extrabold animate-pulse">
                🔴 LIVE NOW
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-400 px-2 py-0.5 border border-gray-200 rounded text-[9px] font-extrabold">
                OFFLINE
              </span>
            )}
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#ecddc7]">
            {liveStream?.youtubeId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${liveStream.youtubeId}`}
                title="Temple Live Stream"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold text-xs">
                Stream unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
