import React, { useEffect, useState } from "react";
import { Music, Video, FileText } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getPublicMedia } from "@/api/public";

export default function MediaPage() {
  const { t } = useLocale();
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicMedia().then(setMediaItems).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#2a1810] space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#8a2e13] uppercase">{t.media}</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Shri Mallikarjun Sacred Audio & Video Gallery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#ecddc7] h-44 animate-pulse" />
          ))
        ) : mediaItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-gray-400 font-semibold bg-white border border-[#ecddc7] rounded-2xl">
            No media files registered yet.
          </div>
        ) : (
          mediaItems.map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-[#ecddc7] shadow-sm flex flex-col justify-between text-xs space-y-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold bg-[#fbf6ec] border border-[#ecddc7] text-[#bf8f2e] uppercase">
                  {item.type}
                </span>
                <h3 className="font-bold text-sm text-[#2a1810] mt-2 leading-snug">{item.title}</h3>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">Category: {item.category}</p>
              </div>
              <div className="pt-4 border-t border-[#ecddc7]/30">
                {item.type === "AUDIO" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#bf8f2e] font-bold">
                      <Music className="w-4 h-4 animate-pulse" />
                      <span>Play Aarti Audio</span>
                    </div>
                    <audio controls src={item.url} className="w-full h-8" />
                  </div>
                )}
                {item.type === "VIDEO" && (
                  <a href={item.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8a2e13] text-[#fbf6ec] font-bold rounded-lg hover:bg-[#c25a22] transition-colors">
                    <Video className="w-4 h-4" /> Watch Video
                  </a>
                )}
                {item.type === "TEXT" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                      <FileText className="w-4 h-4 text-[#bf8f2e]" />
                      <span>Scripture / Stotra lyrics</span>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-[10px] text-gray-600 max-h-32 overflow-y-auto leading-relaxed">
                      {item.url}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
