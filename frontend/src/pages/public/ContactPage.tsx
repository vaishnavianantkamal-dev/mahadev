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

      {/* Google Map Section */}
      <div className="bg-white p-6 sm:p-8 border border-[#ecddc7] rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#8a2e13] border-b border-[#ecddc7]/30 pb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#bf8f2e]" />
          Location Map & Directions
        </h3>
        <div className="w-full h-80 rounded-xl overflow-hidden border border-[#ecddc7] bg-gray-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.601569974249!2d74.3411475759737!3d18.636959965611484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2d64f02888cf3%3A0xe54d924d5e975cae!2sShri%20Mallikarjun%20Mandir%2C%20Nhavre!5e0!3m2!1sen!2sin!4v1717580000000!5m2!1sen!2sin"
            className="w-full h-full border-0"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
