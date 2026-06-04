import React, { useEffect, useState } from "react";
import { PhoneCall, Mail, MapPin, Building } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getPublicTemple } from "@/api/public";

export default function ContactPage() {
  const { t } = useLocale();
  const [temple, setTemple] = useState<any>(null);

  useEffect(() => {
    getPublicTemple().then(setTemple);
  }, []);

  const address = temple?.address || "Shri Mallikarjun Devasthan, Nhavre, Taluka Shirur, District Pune, Maharashtra - 412211";
  const phone = temple?.phone || "+91 9494816173";
  const email = temple?.email || "contact@shrimallikarjunnhavre.org";
  const bankRef = temple?.bankRef || "SBI A/C: 38290123456, IFSC: SBIN0001234";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#2a1810] space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#8a2e13] uppercase">{t.contact}</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Shri Mallikarjun Devasthan Trust Office</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact details */}
        <div className="bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm space-y-6 text-xs font-semibold">
          <h3 className="text-base font-bold text-[#8a2e13] border-b border-[#ecddc7]/30 pb-3">Office Contacts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#bf8f2e] flex-shrink-0" />
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">Location Address</p>
                <p className="text-gray-700 mt-1 leading-relaxed">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-[#bf8f2e] flex-shrink-0" />
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">Helpline Number</p>
                <p className="text-gray-700 mt-1 font-bold">{phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#bf8f2e] flex-shrink-0" />
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-gray-700 mt-1 font-bold">{email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank details */}
        <div className="bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm space-y-6 text-xs font-semibold">
          <h3 className="text-base font-bold text-[#8a2e13] border-b border-[#ecddc7]/30 pb-3">Devasthanam Bank Accounts</h3>
          <div className="p-4 border border-[#ecddc7] bg-[#fbf6ec]/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#8a2e13] font-bold">
              <Building className="w-4 h-4" />
              <span>State Bank of India (SBI)</span>
            </div>
            <div className="divide-y divide-[#ecddc7]/30 leading-loose">
              <p className="py-2 leading-relaxed text-gray-700">{bankRef}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
