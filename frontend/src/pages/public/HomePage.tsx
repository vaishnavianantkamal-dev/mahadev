import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  HeartHandshake, 
  Calendar, 
  Bed, 
  Radio, 
  ArrowRight, 
  Clock, 
  FileText, 
  PhoneCall, 
  Info, 
  Award, 
  Users, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Send 
} from "lucide-react";
import { useLocale } from "@/lib/i18n";
import {
  getPublicTimings,
  getPublicEvents,
  getPublicLiveDarshan,
  getPublicSiteContent,
} from "@/api/public";

// Custom Premium SVG Icons for Quick Actions Navigation
function DiyaIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c.6 1.2 1.5 2.5 1.5 4a1.5 1.5 0 1 1-3 0c0-1.5.9-2.8 1.5-4z" />
      <path d="M5 14c0 3.87 3.13 7 7 7s7-3.13 7-7H5z" />
      <path d="M3 14h18" />
      <path d="M9 21h6" />
    </svg>
  );
}

function DonationIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <path d="M12 16.5c-1.5-1.5-2.5-2.2-2.5-3.2 0-1 1-1.5 1.5-.7.5-.8 1.5-.3 1.5.7 0 1-1 1.7-2.5 3.2z" />
    </svg>
  );
}

function PrasadIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
      <rect x="5" y="10" width="14" height="4" rx="1" />
      <rect x="5" y="15" width="14" height="5" rx="1" />
      <path d="M8 10v10" />
      <path d="M16 10v10" />
    </svg>
  );
}

function BedIconCustom({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6v14" />
      <path d="M21 10v10" />
      <path d="M3 14h18" />
      <rect x="6" y="9" width="4" height="3" rx="0.5" />
      <path d="M12 14v-4h9" />
    </svg>
  );
}

function LiveStreamIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="14" height="11" rx="2" />
      <polygon points="7 8 11 10.5 7 13" />
      <path d="M16 9l5-4v12l-5-4" />
    </svg>
  );
}

function TempleIconCustom({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M12 3h4l-2 1.5-2 1.5" />
      <path d="M12 6L7 11h10z" />
      <path d="M5 11h14v3H5z" />
      <path d="M4 14h16v7H4z" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    </svg>
  );
}

function BookIconCustom({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function PhoneIconCustom({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

const HOME_STRINGS = {
  mr: {
    omNamahShivay: "|| ॐ नमः शिवाय ||",
    heroTitle: "श्री मल्लिकार्जुन देवस्थान, न्हावरे",
    heroSubtitle: "श्रद्धा, सेवा आणि पारदर्शकतेचा संगम",
    heroDesc: "श्री मल्लिकार्जुन महादेवाच्या कृपेने भाविकांसाठी सेवा करा. ऑनलाईन करून उपलब्ध तुमचे अनुभव अधिक सोयीस्कर बनवले गेले.",
    onlineDarshanBtn: "ऑनलाईन दर्शन",
    donateBtn: "देणगी द्या",
    
    // Quick Actions
    poojaApply: "ऑनलाईन अर्ज",
    poojaApplySub: "(अभिषेक / पूजा)",
    makeDonation: "देणगी द्या",
    makeDonationSub: "सुरक्षित पेमेंट",
    prasadPass: "महाप्रसाद पास",
    prasadPassSub: "बुकिंग करा",
    bhaktaNiwas: "भक्तनिवास",
    bhaktaNiwasSub: "रूम आरक्षण",
    liveDarshan: "लाईव्ह दर्शन",
    liveDarshanSub: "आजच पहा",
    utsavCalendar: "उत्सव व कार्यक्रम",
    utsavCalendarSub: "दिनदर्शिका",
    infoCenter: "माहिती केंद्र",
    infoCenterSub: "मंदिर माहिती",
    contactUs: "संपर्क",
    contactUsSub: "आमच्याशी जोडा",

    // Timings
    timingsTitle: "आजचे दर्शन व आरती वेळापत्रक",
    viewAllTimings: "संपूर्ण माहिती पहा",
    
    // Live Darshan Card
    liveDarshanCardTitle: "लाईव्ह दर्शन (Live)",
    watchingCount: "थेट प्रक्षेपण पाहत आहेत: 1.2K",
    watchNow: "आता दर्शन घ्या",
    
    // Upcoming Festivals
    upcomingTitle: "आगामी उत्सव व कार्यक्रम",
    viewAll: "सर्व पहा",
    
    // News & Updates
    newsTitle: "नवीन अपडेट्स",
    news1: "महाशिवरात्री देणगी खुली",
    news1Sub: "सर्व भाविकांनी सहकार्य करावे. ०२ मे २०२६",
    news2: "ऑनलाईन अभिषेक व पूजा सेवा सुरु",
    news2Sub: "आजच बुकिंग पूर्ण करा. २० एप्रिल २०२६",
    news3: "देणगी पावती WhatsApp वर",
    news3Sub: "सेवा अधिक सुलभ व पारदर्शक. २० एप्रिल २०२६",

    // CTA Banner
    ctaTitle: "देणगी द्या, सेवा घडवा",
    ctaSubtitle: "आपली देणगी मंदिराच्या विकासासाठी आणि धार्मिक व सामाजिक उपक्रमांसाठी वापरली जाते.",
    securePayment: "सुरक्षित पेमेंट",
    instantReceipt: "त्वरित पावती",
    taxBenefit: "80G कर सवलत उपलब्ध",
    
    // Facilities & Services
    facilitiesTitle: "सुविधा व सेवा",
    bhaktaNiwasDesc: "उत्कृष्ट व सुरक्षित निवास व्यवस्था",
    bhaktaNiwasBtn: "रूम आरक्षण करा",
    mahaprasadDesc: "स्वादिष्ट महाप्रसाद पास बुकिंग",
    mahaprasadBtn: "पास बुक करा",
    abhishekDesc: "ऑनलाईन पूजा व अभिषेक सेवा",
    abhishekBtn: "बुकिंग करा",
    parkingDesc: "प्रशस्त व सुरक्षित पार्किंग सुविधा",
    parkingBtn: "अधिक माहिती",
    socialDesc: "आरोग्य शिबीर, रक्तदान, वृक्षारोपण",
    socialBtn: "उपक्रम पहा",

    // Stats
    statDevotees: "वार्षिक भाविक",
    statHistory: "वर्षांचा इतिहास",
    statFestivals: "उत्सव व आयोजन",
    statService: "भक्तसेवा",
    statSafety: "पारदर्शक व सुरक्षित",

    // Gallery
    galleryTitle: "मंदिर दर्शन गॅलरी",
    gallerySub: "सर्व गॅलरी पहा",

    // Transparency
    transparencyTitle: "पारदर्शकता आमची ओळख",
    ledgerTitle: "डिजिटल लेखा जोखा",
    ledgerDesc: "सर्व आर्थिक व्यव्हार डिजिटल आणि सुरक्षित",
    ledgerLink: "लेखा जोखा पहा →",
    receiptTitle: "तात्काळ ई-पावती",
    receiptDesc: "देणगी केल्यावर तात्काळ पावती मिळवा",
    receiptLink: "उदाहरणे पहा →",
    paymentTitle: "सुरक्षित पेमेंट",
    paymentDesc: "UPI, कार्ड, नेट बँकिंग द्वारे सुरक्षित देणगी",
    paymentLink: "देणगी द्या →",

    // WhatsApp updates
    waTitle: "WhatsApp अपडेट्स मिळवा",
    waDesc: "उत्सव, आरती वेळ आणि महत्वाच्या सूचना थेट तुमच्या WhatsApp वर मिळवा.",
    waBtn: "WhatsApp वर जोडा",
    newsletterTitle: "न्यूजलेटर सबस्क्राईब करा",
    newsletterDesc: "देवस्थानच्या नवीन अपडेट्स ईमेल द्वारे मिळवा.",
    newsletterInputPlaceholder: "आपला ईमेल पत्ता",
    newsletterBtn: "सबस्क्राईब करा"
  },
  en: {
    omNamahShivay: "|| Om Namah Shivay ||",
    heroTitle: "Shri Mallikarjun Devasthan, Nhavre",
    heroSubtitle: "Union of Devotion, Service and Transparency",
    heroDesc: "Avail dynamic online bookings and stay updates directly. Lord Shiva's divine experience made convenient.",
    onlineDarshanBtn: "Online Darshan",
    donateBtn: "Donate Online",
    
    // Quick Actions
    poojaApply: "Online Application",
    poojaApplySub: "(Abhishek / Pooja)",
    makeDonation: "Donate Now",
    makeDonationSub: "Secure Payment",
    prasadPass: "Mahaprasad Pass",
    prasadPassSub: "Book Now",
    bhaktaNiwas: "Bhakta Niwas",
    bhaktaNiwasSub: "Room Reservation",
    liveDarshan: "Live Darshan",
    liveDarshanSub: "Watch Today",
    utsavCalendar: "Events & Calendar",
    utsavCalendarSub: "Schedule",
    infoCenter: "Information Center",
    infoCenterSub: "Temple History",
    contactUs: "Contact Us",
    contactUsSub: "Get in touch",

    // Timings
    timingsTitle: "Today's Darshan & Aarti Timings",
    viewAllTimings: "View Complete Schedule",
    
    // Live Darshan Card
    liveDarshanCardTitle: "Live Darshan",
    watchingCount: "Live Viewers: 1.2K",
    watchNow: "Watch Live Now",
    
    // Upcoming Festivals
    upcomingTitle: "Upcoming Festivals & Events",
    viewAll: "View All",
    
    // News & Updates
    newsTitle: "Latest Updates",
    news1: "Mahashivratri Donations Open",
    news1Sub: "All devotees are requested to cooperate. 02 May 2026",
    news2: "Online Abhishek & Pooja Service Live",
    news2Sub: "Complete bookings easily today. 20 April 2026",
    news3: "Donation Receipts on WhatsApp",
    news3Sub: "Fast, easy and transparent receipts. 20 April 2026",

    // CTA Banner
    ctaTitle: "Donate Now, Support Service",
    ctaSubtitle: "Your donations support temple development, food drives, and local social activities.",
    securePayment: "Secure Payment",
    instantReceipt: "Instant Receipt",
    taxBenefit: "80G Tax Exemption Available",
    
    // Facilities & Services
    facilitiesTitle: "Facilities & Services",
    bhaktaNiwasDesc: "Excellent and safe accommodations",
    bhaktaNiwasBtn: "Reserve Room",
    mahaprasadDesc: "Delicious Mahaprasad pass booking",
    mahaprasadBtn: "Book Pass",
    abhishekDesc: "Online Pooja & Abhishek bookings",
    abhishekBtn: "Book Pooja",
    parkingDesc: "Spacious and secure parking zone",
    parkingBtn: "More Details",
    socialDesc: "Medical camp, blood drive, green drives",
    socialBtn: "View Activities",

    // Stats
    statDevotees: "Annual Devotees",
    statHistory: "Years of History",
    statFestivals: "Festivals & Events",
    statService: "Devotee Support",
    statSafety: "Transparent & Safe",

    // Gallery
    galleryTitle: "Temple Darshan Gallery",
    gallerySub: "View All Gallery",

    // Transparency
    transparencyTitle: "Transparency is Our Identity",
    ledgerTitle: "Digital Ledger",
    ledgerDesc: "All financial transactions are digital and secure",
    ledgerLink: "View Ledger →",
    receiptTitle: "Instant E-Receipt",
    receiptDesc: "Receive secure receipt directly after donation",
    receiptLink: "View Sample →",
    paymentTitle: "Secure Payments",
    paymentDesc: "UPI, Cards, Net Banking secure donations",
    paymentLink: "Donate Now →",

    // WhatsApp updates
    waTitle: "Get WhatsApp Updates",
    waDesc: "Get festival updates, timings, and notifications directly on WhatsApp.",
    waBtn: "Join on WhatsApp",
    newsletterTitle: "Subscribe to Newsletter",
    newsletterDesc: "Get the latest updates from temple trust via email.",
    newsletterInputPlaceholder: "Your email address",
    newsletterBtn: "Subscribe"
  }
};

export default function HomePage() {
  const { locale } = useLocale();
  const t = HOME_STRINGS[locale];

  const [timings, setTimings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [liveStream, setLiveStream] = useState<any>(null);
  const [heroTitle, setHeroTitle] = useState(t.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(t.heroSubtitle);

  useEffect(() => {
    getPublicTimings().then(setTimings);
    getPublicEvents().then((data) => setEvents(data.slice(0, 4)));
    getPublicLiveDarshan().then(setLiveStream);
    getPublicSiteContent(locale).then((contents: any[]) => {
      const heroT = contents.find((c) => c.key === "home.hero_title");
      const heroS = contents.find((c) => c.key === "home.hero_subtitle");
      if (heroT) setHeroTitle(heroT.bodyRich);
      if (heroS) setHeroSubtitle(heroS.bodyRich);
    });
  }, [locale]);

  return (
    <div className="space-y-16 pb-16 text-[#2a1810] bg-[#fbf6ec]/15 font-sans leading-relaxed">
      
      {/* 1. HERO BANNER WITH DEITY SPLIT */}
      <section
        className="relative py-16 md:py-24 text-[#fbf6ec] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('/images/hero temple.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a1810]/95 via-[#8a2e13]/85 to-[#bf8f2e]/45" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero Left Info */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <span className="text-sm font-bold text-[#e6c878] tracking-widest uppercase block animate-pulse">
              {t.omNamahShivay}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#e6c878] drop-shadow-md">
              {heroTitle}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-[#fbf6ec] tracking-wide">
              {heroSubtitle}
            </h2>
            <p className="text-xs sm:text-sm max-w-xl leading-relaxed text-[#fbf6ec]/85 font-medium">
              {t.heroDesc}
            </p>
            <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/darshan"
                className="flex items-center gap-2 px-6 py-3 bg-[#bf8f2e] text-[#2a1810] font-bold text-xs rounded-xl shadow-lg border border-[#e6c878]/30 hover:bg-[#e6c878] hover:scale-105 transition-all"
              >
                🔱 {t.onlineDarshanBtn}
              </Link>
              <Link
                to="/donate"
                className="flex items-center gap-2 px-6 py-3 bg-[#8a2e13] text-[#fbf6ec] font-bold text-xs rounded-xl shadow-lg border border-[#ecddc7]/20 hover:bg-[#c25a22] hover:scale-105 transition-all"
              >
                ❤️ {t.donateBtn}
              </Link>
            </div>
          </div>

          {/* Hero Right Deity Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-2 rounded-full bg-gradient-to-tr from-[#bf8f2e] via-[#8a2e13] to-[#e6c878] shadow-2xl shadow-[#2a1810]/70 animate-fade-in hover:scale-105 transition-all duration-300">
              <div className="bg-[#2a1810] p-1.5 rounded-full overflow-hidden border border-[#ecddc7]/30">
                <img
                  src="/images/malika arjun.png"
                  alt="Shri Mallikarjun Deity"
                  className="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-full"
                />
              </div>
              <span className="absolute bottom-2 right-4 text-3xl animate-bounce">🔱</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CIRCULAR QUICK ACTIONS NAVIGATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#ecddc7] rounded-2xl shadow-md p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-y-6 gap-x-0 text-center">
            {[
              { to: "/book", icon: <DiyaIcon className="w-6 h-6" />, title: t.poojaApply, sub: t.poojaApplySub },
              { to: "/donate", icon: <DonationIcon className="w-6 h-6" />, title: t.makeDonation, sub: t.makeDonationSub },
              { to: "/book", icon: <PrasadIcon className="w-6 h-6" />, title: t.prasadPass, sub: t.prasadPassSub },
              { to: "/rooms", icon: <BedIconCustom className="w-6 h-6" />, title: t.bhaktaNiwas, sub: t.bhaktaNiwasSub },
              { to: "/darshan", icon: <LiveStreamIcon className="w-6 h-6" />, title: t.liveDarshan, sub: t.liveDarshanSub },
              { to: "/events", icon: <TempleIconCustom className="w-6 h-6" />, title: t.utsavCalendar, sub: t.utsavCalendarSub },
              { to: "/media", icon: <BookIconCustom className="w-6 h-6" />, title: t.infoCenter, sub: t.infoCenterSub },
              { to: "/contact", icon: <PhoneIconCustom className="w-6 h-6" />, title: t.contactUs, sub: t.contactUsSub },
            ].map(({ to, icon, title, sub }, idx) => (
              <Link 
                key={idx} 
                to={to} 
                className="group flex flex-col items-center space-y-2 focus:outline-none px-2 lg:border-r lg:border-[#ecddc7]/60 lg:last:border-r-0"
              >
                <div className="w-14 h-14 rounded-full bg-[#fbf6ec] border border-[#ecddc7] flex items-center justify-center shadow-sm text-[#8a2e13] group-hover:bg-[#8a2e13] group-hover:text-[#fbf6ec] group-hover:border-[#8a2e13] group-hover:scale-110 transition-all duration-200">
                  {icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-extrabold text-[#2a1810] group-hover:text-[#8a2e13] transition-colors">{title}</p>
                  <p className="text-[9px] text-gray-400 font-bold tracking-tight">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FOUR CARD DASHBOARD GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* CARD A: DARSHAN TIMINGS */}
          <div className="bg-white rounded-2xl border border-[#ecddc7] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3 mb-4">
                <Clock className="w-4 h-4 text-[#8a2e13]" />
                <h3 className="text-xs font-extrabold text-[#8a2e13] uppercase tracking-wide">
                  {t.timingsTitle}
                </h3>
              </div>
              <div className="space-y-3 text-xs font-bold">
                {[
                  { label: locale === "mr" ? "काकड आरती" : "Kakad Aarti", time: "05:00 AM" },
                  { label: locale === "mr" ? "अभिषेक पूजा" : "Abhishek Pooja", time: "07:00 AM" },
                  { label: locale === "mr" ? "माध्यान्ह आरती" : "Midday Aarti", time: "12:00 PM" },
                  { label: locale === "mr" ? "सायं आरती" : "Evening Aarti", time: "07:30 PM" },
                  { label: locale === "mr" ? "शेज आरती" : "Shej Aarti", time: "09:30 PM" },
                ].map((row, index) => (
                  <div key={index} className="flex justify-between items-center py-0.5 border-b border-[#ecddc7]/10 last:border-0 text-gray-700">
                    <span className="flex items-center gap-1.5">🔸 {row.label}</span>
                    <span className="text-[#bf8f2e]">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <Link 
                to="/darshan" 
                className="block text-center w-full py-2 bg-[#8a2e13] text-[#fbf6ec] font-bold text-[10px] rounded-lg hover:bg-[#c25a22] transition-colors"
              >
                {t.viewAllTimings}
              </Link>
            </div>
          </div>

          {/* CARD B: LIVE STREAM MEDIA */}
          <div className="bg-white rounded-2xl border border-[#ecddc7] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between border-b border-[#ecddc7]/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#8a2e13]" />
                  <h3 className="text-xs font-extrabold text-[#8a2e13] uppercase tracking-wide">
                    {t.liveDarshanCardTitle}
                  </h3>
                </div>
                <span className="flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-extrabold animate-pulse">
                  🔴 LIVE
                </span>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#ecddc7]/30 relative group shadow-inner">
                {liveStream?.youtubeId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${liveStream.youtubeId}`}
                    title="Live stream preview"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#2a1810]/5 text-gray-400 space-y-1">
                    <span className="text-2xl">📹</span>
                    <span className="text-[10px] font-semibold">Stream Offline</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-3 text-center">
                👥 {t.watchingCount}
              </p>
            </div>
            <div className="pt-4">
              <Link 
                to="/darshan" 
                className="block text-center w-full py-2 bg-[#bf8f2e] text-[#2a1810] font-bold text-[10px] rounded-lg hover:bg-[#e6c878] transition-colors"
              >
                {t.watchNow}
              </Link>
            </div>
          </div>

          {/* CARD C: FESTIVALS & UTASV */}
          <div className="bg-white rounded-2xl border border-[#ecddc7] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between border-b border-[#ecddc7]/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8a2e13]" />
                  <h3 className="text-xs font-extrabold text-[#8a2e13] uppercase tracking-wide">
                    {t.upcomingTitle}
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-gray-400 font-semibold">
                    No upcoming events listed
                  </div>
                ) : (
                  events.map((evt) => (
                    <div key={evt.id} className="flex gap-2.5 items-start text-[10px] font-semibold text-gray-700">
                      {evt.bannerUrl ? (
                        <img 
                          src={evt.bannerUrl} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-lg border border-[#ecddc7]/35 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#fbf6ec] rounded-lg border border-[#ecddc7]/35 flex items-center justify-center flex-shrink-0">🛕</div>
                      )}
                      <div>
                        <p className="font-extrabold text-[#2a1810] line-clamp-1">{evt.title}</p>
                        <p className="text-[9px] text-[#bf8f2e] mt-0.5">
                          {new Date(evt.startAt).toLocaleDateString(locale === "mr" ? "mr-IN" : "en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pt-4">
              <Link 
                to="/events" 
                className="block text-center w-full py-2 border border-[#ecddc7] text-[#bf8f2e] font-bold text-[10px] rounded-lg hover:bg-[#8a2e13] hover:text-[#fbf6ec] transition-all"
              >
                {t.viewAll}
              </Link>
            </div>
          </div>

          {/* CARD D: NEWS & ANNOUNCEMENTS */}
          <div className="bg-white rounded-2xl border border-[#ecddc7] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 border-b border-[#ecddc7]/30 pb-3 mb-4">
                <FileText className="w-4 h-4 text-[#8a2e13]" />
                <h3 className="text-xs font-extrabold text-[#8a2e13] uppercase tracking-wide">
                  {t.newsTitle}
                </h3>
              </div>
              <div className="space-y-3.5">
                {[
                  { title: t.news1, sub: t.news1Sub },
                  { title: t.news2, sub: t.news2Sub },
                  { title: t.news3, sub: t.news3Sub },
                ].map((n, idx) => (
                  <div key={idx} className="text-[10px] font-semibold leading-relaxed border-l-2 border-[#bf8f2e] pl-2">
                    <p className="font-extrabold text-[#2a1810]">{n.title}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{n.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <Link 
                to="/about" 
                className="block text-center w-full py-2 border border-[#ecddc7] text-[#bf8f2e] font-bold text-[10px] rounded-lg hover:bg-[#8a2e13] hover:text-[#fbf6ec] transition-all"
              >
                {t.viewAll}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. MID CALL-TO-ACTION HORIZONTAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#2a1810] via-[#8a2e13] to-[#bf8f2e] rounded-2xl shadow-lg border border-[#ecddc7]/20 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none">
            <span className="text-9xl">🔱</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-[#e6c878]/30 flex items-center justify-center text-2xl">
              🔥
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#e6c878]">{t.ctaTitle}</h3>
              <p className="text-xs text-[#fbf6ec]/85 max-w-xl font-medium">{t.ctaSubtitle}</p>
              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] text-[#e6c878] font-bold">
                <span>🛡️ {t.securePayment}</span>
                <span>📄 {t.instantReceipt}</span>
                <span>📜 {t.taxBenefit}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link 
              to="/donate" 
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#e6c878] text-[#2a1810] font-extrabold text-xs rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all"
            >
              ❤️ {t.donateBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FACILITIES & SERVICES SECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-bold text-[#8a2e13] uppercase tracking-wide">
            — {t.facilitiesTitle} —
          </h3>
          <span className="text-lg block">⚜️</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-xs font-semibold">
          {[
            { img: "/images/img1.jpg", title: locale === "mr" ? "भक्तनिवास" : "Bhakta Niwas", desc: t.bhaktaNiwasDesc, btn: t.bhaktaNiwasBtn, link: "/rooms" },
            { img: "/images/img 2.jpg", title: locale === "mr" ? "महाप्रसाद" : "Mahaprasad", desc: t.mahaprasadDesc, btn: t.mahaprasadBtn, link: "/book" },
            { img: "/images/img3.jpg", title: locale === "mr" ? "अभिषेक / पूजा" : "Abhishek / Pooja", desc: t.abhishekDesc, btn: t.abhishekBtn, link: "/book" },
            { img: "/images/img 4.jpg", title: locale === "mr" ? "वाहनतळ सुविधा" : "Parking Facility", desc: t.parkingDesc, btn: t.parkingBtn, link: "/about" },
            { img: "/images/img3.jpg", title: locale === "mr" ? "सामाजिक उपक्रम" : "Social Outreach", desc: t.socialDesc, btn: t.socialBtn, link: "/about" },
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-[#ecddc7] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="aspect-square w-full overflow-hidden border-b border-[#ecddc7]/30 bg-gray-50 relative group">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#2a1810]/5 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-center">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#2a1810] text-sm">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-2">
                  <Link 
                    to={item.link} 
                    className="block w-full py-2 bg-[#bf8f2e]/10 text-[#8a2e13] border border-[#ecddc7] hover:bg-[#8a2e13] hover:text-[#fbf6ec] hover:border-[#8a2e13] font-extrabold text-[10px] rounded-lg transition-all"
                  >
                    {item.btn}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. STATISTICS SUMMARY NUMBERS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#8a2e13] border border-[#ecddc7]/30 rounded-2xl shadow-lg p-6 sm:p-8 text-[#fbf6ec]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#ecddc7]/20 text-center font-bold">
            {[
              { val: "1L+", label: t.statDevotees },
              { val: "500+", label: t.statHistory },
              { val: "25+", label: t.statFestivals },
              { val: "24x7", label: t.statService },
              { val: "100%", label: t.statSafety },
            ].map((stat, idx) => (
              <div key={idx} className="pt-4 md:pt-0 first:pt-0">
                <h4 className="text-2xl sm:text-3xl font-extrabold text-[#e6c878]">{stat.val}</h4>
                <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TEMPLE DARSHAN GALLERY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-bold text-[#8a2e13] uppercase tracking-wide">
            — {t.galleryTitle} —
          </h3>
          <span className="text-lg block">⚜️</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            "/images/hero temple.png",
            "/images/malika arjun.png",
            "/images/img1.jpg",
            "/images/img 2.jpg",
            "/images/img3.jpg"
          ].map((src, idx) => (
            <div 
              key={idx} 
              className="aspect-video w-full overflow-hidden rounded-xl border border-[#ecddc7] shadow-sm hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer bg-gray-50"
            >
              <img src={src} alt="Temple gallery" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Link 
            to="/media" 
            className="px-6 py-2.5 bg-[#8a2e13] text-[#fbf6ec] font-bold text-xs rounded-xl shadow border border-[#ecddc7]/30 hover:bg-[#c25a22] transition-colors"
          >
            {t.gallerySub}
          </Link>
        </div>
      </section>

      {/* 8. TRANSPARENCY STATEMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-bold text-[#8a2e13] uppercase tracking-wide">
            — {t.transparencyTitle} —
          </h3>
          <span className="text-lg block">⚜️</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-xs font-semibold text-gray-700">
          {[
            { title: t.ledgerTitle, desc: t.ledgerDesc, link: t.ledgerLink, icon: <Award className="w-7 h-7 text-[#bf8f2e]" />, to: "/admin" },
            { title: t.receiptTitle, desc: t.receiptDesc, link: t.receiptLink, icon: <FileText className="w-7 h-7 text-[#bf8f2e]" />, to: "/donate" },
            { title: t.paymentTitle, desc: t.paymentDesc, link: t.paymentLink, icon: <ShieldCheck className="w-7 h-7 text-[#bf8f2e]" />, to: "/donate" }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 rounded-2xl border border-[#ecddc7] shadow-sm space-y-4 hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-[#fbf6ec] border border-[#ecddc7] flex items-center justify-center mx-auto shadow-sm">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-[#2a1810] text-sm">{item.title}</h4>
                <p className="text-[10px] text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-2">
                <Link to={item.to} className="font-extrabold text-[#8a2e13] hover:underline text-[10px]">
                  {item.link}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. WHATSAPP CONNECT & NEWSLETTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
          
          {/* WhatsApp Card */}
          <div className="bg-[#1faa59]/10 border border-[#1faa59]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <span className="text-4xl block flex-shrink-0">💬</span>
              <div className="space-y-1">
                <h4 className="font-bold text-[#1faa59] text-base">{t.waTitle}</h4>
                <p className="text-gray-600 font-medium leading-relaxed max-w-sm">{t.waDesc}</p>
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <a 
                href="https://wa.me/919494816173" 
                target="_blank" 
                rel="noreferrer"
                className="block text-center px-6 py-3 bg-[#1faa59] text-white font-extrabold rounded-xl hover:bg-emerald-600 shadow-md hover:scale-105 transition-all"
              >
                💚 {t.waBtn}
              </a>
            </div>
          </div>

          {/* Newsletter Card */}
          <div className="bg-white border border-[#ecddc7] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <span className="text-4xl block flex-shrink-0">📬</span>
              <div className="space-y-1">
                <h4 className="font-bold text-[#8a2e13] text-base">{t.newsletterTitle}</h4>
                <p className="text-gray-500 font-medium leading-relaxed max-w-sm">{t.newsletterDesc}</p>
              </div>
            </div>
            <form 
              onSubmit={(e) => { e.preventDefault(); alert("Subscribed successfully!"); }}
              className="mt-4 flex gap-2 w-full"
            >
              <input 
                required
                type="email" 
                placeholder={t.newsletterInputPlaceholder}
                className="flex-1 p-3 border border-[#ecddc7] bg-[#fbf6ec]/10 rounded-xl focus:outline-none focus:border-[#8a2e13] font-medium"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-[#8a2e13] text-[#fbf6ec] font-extrabold rounded-xl hover:bg-[#c25a22] transition-colors"
              >
                {t.newsletterBtn}
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
