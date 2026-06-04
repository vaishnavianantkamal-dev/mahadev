import React, { useEffect, useState } from "react";
import { History, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getPublicSiteContent } from "@/api/public";

export default function AboutPage() {
  const { locale, t } = useLocale();
  const [history, setHistory] = useState({ title: "Our Sacred Heritage", body: "The ancient Shri Mallikarjun Temple has a history spanning several centuries, serving as a beacon of faith and spirituality for the local community and pilgrims from across Maharashtra." });
  const [trust, setTrust] = useState({ title: "Shri Mallikarjun Devasthan Trust", body: "The trust manages all daily temple operations, charitable ventures, and development initiatives to serve the devotees and preserve this sacred heritage site." });

  useEffect(() => {
    getPublicSiteContent(locale).then((contents: any[]) => {
      const h = contents.find((c) => c.key === "about.history");
      const tr = contents.find((c) => c.key === "about.trust");
      if (h) setHistory({ title: h.title || history.title, body: h.bodyRich });
      if (tr) setTrust({ title: tr.title || trust.title, body: tr.bodyRich });
    });
  }, [locale]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#2a1810] space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#8a2e13] uppercase">{t.about}</h1>
        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Shri Mallikarjun Devasthan, Nhavre</p>
      </div>

      <div className="bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3">
          <History className="w-5 h-5 text-[#8a2e13]" />
          <h3 className="text-lg font-bold text-[#8a2e13]">{history.title}</h3>
        </div>
        <p className="text-xs leading-relaxed text-gray-600 font-semibold whitespace-pre-wrap">{history.body}</p>
      </div>

      <div className="bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3">
          <ShieldCheck className="w-5 h-5 text-[#8a2e13]" />
          <h3 className="text-lg font-bold text-[#8a2e13]">{trust.title}</h3>
        </div>
        <p className="text-xs leading-relaxed text-gray-600 font-semibold whitespace-pre-wrap">{trust.body}</p>
      </div>
    </div>
  );
}
