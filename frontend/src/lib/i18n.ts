import { useState, useEffect } from "react";

export type Locale = "mr" | "en";

export const translations = {
  mr: {
    title: "श्री मल्लिकार्जुन देवस्थान",
    subtitle: "न्हावरे, तालुका शिरूर",
    home: "मुख्यपृष्ठ",
    about: "इतिहास व माहिती",
    darshan: "दर्शन वेळा",
    book: "पूजा बुकिंग",
    donate: "देणगी (Donate)",
    rooms: "भक्त निवास",
    events: "उत्सव व दिनविशेष",
    media: "आरती व ग्रंथालय",
    contact: "संपर्क",
    liveDarshan: "थेट दर्शन (Live)",
    bookPooja: "पूजा / अभिषेक बुकिंग",
    makeDonation: "देणगी ऑनलाईन जमा करा",
    checkAvailability: "खोली उपलब्धता तपासा",
    heroTitle: "श्री मल्लिकार्जुन देवस्थान, न्हावरे",
    heroSubtitle: "शिरूर तालुक्यातील ऐतिहासिक श्रद्धास्थान, भगवान शिवाचा मंगलमय आशीर्वाद.",
    timings: "आजचे दर्शन व आरतीचे वेळापत्रक",
    upcomingEvents: "नजीकचे उत्सव व कार्यक्रम",
    footerText: "© २०२६ श्री मल्लिकार्जुन देवस्थान ट्रस्ट, न्हावरे. सर्व हक्क राखीव. | विकसक: मंदिर आयटी विभाग",
    name: "पूर्ण नाव",
    phone: "मोबाईल क्रमांक",
    email: "ईमेल पत्ता (ऐच्छिक)",
    amount: "रक्कम (₹)",
    purpose: "देणगीचा हेतू",
    gotra: "गोत्र (ऐच्छिक)",
    city: "शहर / गाव",
    notes: "विशेष नोंद",
    submit: "प्रविष्ट करा",
    payNow: "पैसे द्या",
    whatsappConsent: "मी मंदिर प्रशासनाला व्हॉट्सॲप आणि एसएमएस द्वारे पावती व संदेश पाठवण्याची संमती देतो.",
    success: "यशस्वी!",
    error: "त्रुटी!",
    loading: "लोड होत आहे...",
    selectService: "सेवा निवडा",
    selectDate: "तारीख निवडा",
    selectSlot: "वेळ / बॅच निवडा",
    quantity: "संख्या",
    checkInDate: "चेक-इन तारीख",
    checkOutDate: "चेक-आउट तारीख",
    guestsCount: "भाविक संख्या",
    bookRoom: "खोली बुक करा",
    noRooms: "या तारखेला कोणतीही खोली रिकामी नाही.",
    viewReceipt: "पावती पहा",
    receiptNo: "पावती क्र.",
  },
  en: {
    title: "Shri Mallikarjun Devasthan",
    subtitle: "Nhavre, Taluka Shirur",
    home: "Home",
    about: "History & About",
    darshan: "Darshan Timings",
    book: "Pooja Bookings",
    donate: "Online Donation",
    rooms: "Bhakta Niwas",
    events: "Events & Festivals",
    media: "Media & Aarti",
    contact: "Contact Us",
    liveDarshan: "Live Darshan",
    bookPooja: "Book Pooja / Abhishek",
    makeDonation: "Donate Online",
    checkAvailability: "Check Room Availability",
    heroTitle: "Shri Mallikarjun Devasthan, Nhavre",
    heroSubtitle: "Experience peace and devotion at the historic shrine of Shirur.",
    timings: "Today's Darshan & Aarti Schedule",
    upcomingEvents: "Upcoming Festivals & Events",
    footerText: "© 2026 Shri Mallikarjun Devasthan Trust, Nhavre. All Rights Reserved. | Temple IT",
    name: "Full Name",
    phone: "Mobile Number",
    email: "Email Address (Optional)",
    amount: "Amount (₹)",
    purpose: "Donation Purpose",
    gotra: "Gotra (Optional)",
    city: "City / Village",
    notes: "Special Notes",
    submit: "Submit",
    payNow: "Proceed to Pay",
    whatsappConsent: "I consent to receive official booking receipts and temple updates via WhatsApp/SMS.",
    success: "Success!",
    error: "Error!",
    loading: "Loading...",
    selectService: "Select Service",
    selectDate: "Select Date",
    selectSlot: "Select Time Slot",
    quantity: "Quantity",
    checkInDate: "Check-in Date",
    checkOutDate: "Check-out Date",
    guestsCount: "Number of Guests",
    bookRoom: "Book Room",
    noRooms: "No rooms available for the selected dates.",
    viewReceipt: "View Receipt",
    receiptNo: "Receipt No.",
  }
};

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem("locale") as Locale) || "mr";
  });

  const toggleLocale = () => {
    const next = locale === "mr" ? "en" : "mr";
    setLocale(next);
    localStorage.setItem("locale", next);
    // Also update cookie for the backend if needed
    document.cookie = `locale=${next};max-age=${60 * 60 * 24 * 365};path=/`;
  };

  const t = translations[locale];

  return { locale, t, toggleLocale };
}
