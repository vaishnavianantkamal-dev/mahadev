import { PrismaClient, Role, DevoteeSource, ServiceCategory, BookingStatus, RoomBookingStatus, DonationStatus, PaymentStatus, PaymentType, LedgerEntryType, ChannelType, BroadcastStatus, Locale, DarshanType, MediaItemType, MediaCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed database...");

  // Clean old data in order
  await prisma.auditLog.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.mediaItem.deleteMany({});
  await prisma.liveDarshan.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.darshanTiming.deleteMany({});
  await prisma.siteContent.deleteMany({});
  await prisma.messageLog.deleteMany({});
  await prisma.broadcast.deleteMany({});
  await prisma.messageTemplate.deleteMany({});
  await prisma.messageGroup.deleteMany({});
  await prisma.ledgerEntry.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.donation.deleteMany({});
  await prisma.roomBooking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.serviceType.deleteMany({});
  await prisma.devotee.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.temple.deleteMany({});

  console.log("Cleaned up existing database records.");

  // 1. Seed Temple
  const temple = await prisma.temple.create({
    data: {
      name: "Shri Mallikarjun Devasthan, Nhavre",
      slug: "shri-mallikarjun",
      address: "Nhavre, Taluka Shirur, District Pune, Maharashtra - 412211",
      phone: "+91 9494816173",
      email: "contact@shrimallikarjunnhavre.org",
      bankRef: "SBI A/C: 38290123456, IFSC: SBIN0001234",
      logoUrl: "/images/temple-logo.png",
      settings: {
        websiteActive: true,
        whatsappNotifications: true,
        emailNotifications: true,
        primaryColor: "#8a2e13",
        allowRoomBookings: true,
        allowServiceBookings: true,
      },
    },
  });
  const templeId = temple.id;
  console.log(`Seeded Temple: ${temple.name} (ID: ${templeId})`);

  // 2. Seed Users
  const userAdmin = await prisma.user.create({
    data: {
      id: "user_stub_admin",
      templeId,
      name: "Devidas Kulkarni",
      email: "admin@shrimallikarjun.org",
      role: Role.SUPER_ADMIN,
      active: true,
    },
  });
  const userStaff = await prisma.user.create({
    data: {
      id: "user_stub_staff",
      templeId,
      name: "Sanjay Pawar",
      email: "sanjay@shrimallikarjun.org",
      role: Role.STAFF,
      active: true,
    },
  });
  console.log("Seeded default admin and staff users.");

  // 3. Seed Devotees (8-10 with Maharashtra cities)
  const devoteesData = [
    { name: "Rajesh Anant Patil", phone: "9876543210", email: "rajesh.patil@gmail.com", city: "Pune", gotra: "Shandilya", source: DevoteeSource.WEBSITE },
    { name: "Suresh Baburao Deshmukh", phone: "9823456789", email: "suresh.d@yahoo.com", city: "Mumbai", gotra: "Kashyap", source: DevoteeSource.WALKIN },
    { name: "Amit Madhav Joshi", phone: "9890123456", email: "amit.joshi@outlook.com", city: "Nashik", gotra: "Vasistha", source: DevoteeSource.PHONE },
    { name: "Sunita Ramchandra Kulkarni", phone: "9422012345", email: "sunita.k@gmail.com", city: "Sangli", gotra: "Shandilya", source: DevoteeSource.WEBSITE },
    { name: "Priya Ramesh Shinde", phone: "9011054321", email: "priya.shinde@gmail.com", city: "Nhavre", gotra: "Bharadwaj", source: DevoteeSource.WALKIN },
    { name: "Rahul Vinayak More", phone: "8888812345", email: "rahul.more@rediffmail.com", city: "Satara", gotra: "Kashyap", source: DevoteeSource.WHATSAPP },
    { name: "Manoj Tukaram Pawar", phone: "7777712345", email: "manoj.pawar@gmail.com", city: "Kolhapur", gotra: "Angiras", source: DevoteeSource.IMPORT },
    { name: "Vikas Dnyaneshwar Kale", phone: "9922113344", email: "vikas.kale@gmail.com", city: "Nagpur", gotra: "Gautam", source: DevoteeSource.WEBSITE },
    { name: "Nitin Sopan Shinde", phone: "9855443322", email: "nitin.shinde@yahoo.com", city: "Chhatrapati Sambhajinagar", gotra: "Atri", source: DevoteeSource.WEBSITE },
  ];

  const devotees = [];
  for (const d of devoteesData) {
    const devotee = await prisma.devotee.create({
      data: {
        ...d,
        templeId,
        consentWhatsapp: true,
        totalDonations: 0,
      },
    });
    devotees.push(devotee);
  }
  console.log(`Seeded ${devotees.length} Devotees.`);

  // 4. Seed ServiceTypes
  const abhishekService = await prisma.serviceType.create({
    data: {
      templeId,
      name: "Abhishek (अभिषेक)",
      category: ServiceCategory.ABHISHEK,
      description: "Simple Abhishek on the Shivling with pure water and milk chanting mantras.",
      price: 101.00,
      slotCapacity: 20,
      durationMin: 30,
      active: true,
    },
  });

  const rudrabhishekService = await prisma.serviceType.create({
    data: {
      templeId,
      name: "Rudrabhishek Pooja (रुद्राभिषेक)",
      category: ServiceCategory.ABHISHEK,
      description: "Detailed Abhishek performed with 11 holy substances alongside chanting of Sri Rudram.",
      price: 251.00,
      slotCapacity: 10,
      durationMin: 60,
      active: true,
    },
  });

  const mahapoojaService = await prisma.serviceType.create({
    data: {
      templeId,
      name: "Mahapooja (महापूजा)",
      category: ServiceCategory.POOJA,
      description: "Grand Pooja including decoration, shringar, aarti, and offering special Naivedya.",
      price: 501.00,
      slotCapacity: 5,
      durationMin: 90,
      active: true,
    },
  });

  const mahaprasadService = await prisma.serviceType.create({
    data: {
      templeId,
      name: "Mahaprasad Pass (महाप्रसाद पास)",
      category: ServiceCategory.MAHAPRASAD,
      description: "Sacred noon meal ticket for devotees at the temple dining hall.",
      price: 50.00,
      slotCapacity: 200,
      durationMin: 120,
      active: true,
    },
  });
  console.log("Seeded Service Types.");

  // Add some TimeSlots for Abhishek
  await prisma.timeSlot.createMany({
    data: [
      { serviceTypeId: abhishekService.id, label: "Morning Slot 1", startTime: "07:00", capacity: 10 },
      { serviceTypeId: abhishekService.id, label: "Morning Slot 2", startTime: "08:30", capacity: 10 },
      { serviceTypeId: rudrabhishekService.id, label: "Rudrabhishek Batch A", startTime: "09:00", capacity: 5 },
      { serviceTypeId: rudrabhishekService.id, label: "Rudrabhishek Batch B", startTime: "10:30", capacity: 5 },
    ],
  });
  console.log("Seeded Time Slots.");

  // 5. Seed Rooms (Bhakta Niwas Rooms)
  const roomA = await prisma.room.create({
    data: { templeId, name: "Bhakta Niwas - Room 101", roomType: "Deluxe AC", capacity: 4, pricePerNight: 1200.00, active: true },
  });
  const roomB = await prisma.room.create({
    data: { templeId, name: "Bhakta Niwas - Room 102", roomType: "Deluxe AC", capacity: 4, pricePerNight: 1200.00, active: true },
  });
  const roomC = await prisma.room.create({
    data: { templeId, name: "Bhakta Niwas - Room 201", roomType: "Standard Non-AC", capacity: 3, pricePerNight: 600.00, active: true },
  });
  const roomD = await prisma.room.create({
    data: { templeId, name: "Bhakta Niwas - Room 202", roomType: "Standard Non-AC", capacity: 3, pricePerNight: 600.00, active: true },
  });
  console.log("Seeded Bhakta Niwas Rooms.");

  // 6. Seed Room Bookings
  const today = new Date();
  const roomBooking = await prisma.roomBooking.create({
    data: {
      templeId,
      devoteeId: devotees[0].id,
      roomId: roomA.id,
      checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
      guests: 2,
      amount: 1200.00,
      status: RoomBookingStatus.CONFIRMED,
      paymentId: "pay_room_mock_001",
    },
  });

  // 7. Seed Service Bookings
  await prisma.booking.create({
    data: {
      templeId,
      devoteeId: devotees[1].id,
      serviceTypeId: rudrabhishekService.id,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      slotLabel: "Rudrabhishek Batch A",
      quantity: 1,
      amount: 251.00,
      status: BookingStatus.CONFIRMED,
      paymentId: "pay_booking_mock_001",
      notes: "Sankalp in the name of Suresh Deshmukh",
    },
  });
  console.log("Seeded Sample Bookings.");

  // 8. Seed Donations (a dozen across the month)
  const purposes = ["General Development", "Annadaan (Mahaprasad)", "Temple Renovation", "Gau Shala Maintenance"];
  const donationAmounts = [500, 1000, 2100, 5000, 51, 101, 11000, 501, 10000, 250, 1500, 50000];

  for (let i = 0; i < 12; i++) {
    const devIndex = i % devotees.length;
    const amount = donationAmounts[i];
    const purpose = purposes[i % purposes.length];
    const date = new Date(today.getTime() - (12 - i) * 2 * 24 * 60 * 60 * 1000); // spread across 24 days
    const receiptNo = `MM-${today.getFullYear()}-${10000 + i}`;

    const donation = await prisma.donation.create({
      data: {
        templeId,
        devoteeId: devotees[devIndex].id,
        donorName: devotees[devIndex].name,
        phone: devotees[devIndex].phone,
        email: devotees[devIndex].email,
        amount,
        purpose,
        status: DonationStatus.SUCCESS,
        receiptNo,
        createdAt: date,
        paymentId: `pay_don_mock_${100 + i}`,
      },
    });

    // Update Devotee Total
    await prisma.devotee.update({
      where: { id: devotees[devIndex].id },
      data: {
        totalDonations: { increment: amount },
        lastInteractionAt: date,
      },
    });

    // Create LedgerEntry for credit
    await prisma.ledgerEntry.create({
      data: {
        templeId,
        entryType: LedgerEntryType.CREDIT,
        category: "Donation",
        amount,
        source: "WEBSITE",
        referenceType: "Donation",
        referenceId: donation.id,
        date,
        note: `Donation received for ${purpose} - Receipt #${receiptNo}`,
        createdBy: "SYSTEM",
        createdAt: date,
      },
    });
  }

  // Also add some DEBIT entries to make the ledger look real
  await prisma.ledgerEntry.createMany({
    data: [
      {
        templeId,
        entryType: LedgerEntryType.DEBIT,
        category: "Salary",
        amount: 15000.00,
        source: "COUNTER",
        date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
        note: "Staff salary for Pandit ji",
        createdBy: "user_stub_admin",
      },
      {
        templeId,
        entryType: LedgerEntryType.DEBIT,
        category: "Grocery",
        amount: 8500.00,
        source: "COUNTER",
        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        note: "Annadaan kitchen groceries",
        createdBy: "user_stub_admin",
      },
      {
        templeId,
        entryType: LedgerEntryType.DEBIT,
        category: "Electricity",
        amount: 3200.00,
        source: "DIRECT",
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        note: "MSEB Electricity bill payment",
        createdBy: "user_stub_admin",
      },
    ],
  });
  console.log("Seeded Donations and Ledger entries.");

  // 9. Seed Message Groups and Templates
  const groupFestival = await prisma.messageGroup.create({
    data: { templeId, name: "Festival Greetings", description: "Greetings sent to devotees on auspicious festivals", active: true },
  });
  const groupDarshan = await prisma.messageGroup.create({
    data: { templeId, name: "Darshan Updates", description: "Timings changes or special events updates", active: true },
  });
  const groupDonation = await prisma.messageGroup.create({
    data: { templeId, name: "Donation Acknowledgements", description: "Auto-receipts and thank you templates", active: true },
  });

  await prisma.messageTemplate.createMany({
    data: [
      {
        groupId: groupFestival.id,
        name: "Mahashivratri Wishes (महाशिवरात्री)",
        channel: ChannelType.WHATSAPP,
        body: "महोदय {{name}}, श्री मल्लिकार्जुन देवस्थान, न्हावरे यांच्या वतीने महाशिवरात्रीच्या हार्दिक शुभेच्छा! आजचे दर्शन वेळ सकाळी ६ ते रात्री १० पर्यंत आहे. ओम नमः शिवाय!",
        variables: ["name"],
        whatsappTemplateName: "mahashivratri_wishes",
        language: "mr",
      },
      {
        groupId: groupDarshan.id,
        name: "Darshan Timing Change (दर्शन वेळ बदल)",
        channel: ChannelType.WHATSAPP,
        body: "प्रिय भाविक {{name}}, उद्या {{date}} रोजी सूर्यग्रहणानिमित्त मंदिराचे गर्भगृह दुपारी {{time}} वाजता बंद राहील. कृपया नोंद घ्यावी.",
        variables: ["name", "date", "time"],
        whatsappTemplateName: "darshan_timing_change",
        language: "mr",
      },
      {
        groupId: groupDonation.id,
        name: "Donation Receipt (देणगी पावती)",
        channel: ChannelType.WHATSAPP,
        body: "आदरणीय {{name}}, श्री मल्लिकार्जुन देवस्थानला ₹{{amount}} ची देणगी दिल्याबद्दल धन्यवाद. तुमची पावती संख्या {{receiptNo}} आहे. पावती डाऊनलोड करा: {{url}}",
        variables: ["name", "amount", "receiptNo", "url"],
        whatsappTemplateName: "donation_receipt_whatsapp",
        language: "mr",
      },
    ],
  });
  console.log("Seeded Message Groups and Templates.");

  // 10. Seed Darshan Timings
  await prisma.darshanTiming.createMany({
    data: [
      { templeId, label: "Kakad Aarti (काकड आरती)", type: DarshanType.AARTI, time: "05:30 AM - 06:00 AM", dayRule: "Daily" },
      { templeId, label: "Morning Pooja & Abhishek (पूजा आणि अभिषेक)", type: DarshanType.DARSHAN, time: "06:00 AM - 08:30 AM", dayRule: "Daily" },
      { templeId, label: "General Darshan (सर्वसाधारण दर्शन)", type: DarshanType.DARSHAN, time: "08:30 AM - 12:00 PM", dayRule: "Daily" },
      { templeId, label: "Mahaprasad (महाप्रसाद)", type: DarshanType.MAHAPRASAD, time: "12:30 PM - 02:30 PM", dayRule: "Daily" },
      { templeId, label: "Evening Aarti & Bhajans (आरती व भजन)", type: DarshanType.AARTI, time: "07:30 PM - 08:30 PM", dayRule: "Daily" },
      { templeId, label: "Evening Aarti & Mahaprasad (सायं आरती आणि महाप्रसाद)", type: DarshanType.AARTI, time: "07:00 PM - 08:30 PM", dayRule: "Daily" },
      { templeId, label: "Shejarti (शेजारती)", type: DarshanType.AARTI, time: "09:30 PM - 10:00 PM", dayRule: "Daily" },
    ],
  });
  console.log("Seeded Darshan Timings.");

  // 11. Seed Events
  await prisma.event.createMany({
    data: [
      {
        templeId,
        title: "Mahashivratri Mahotsav (महाशिवरात्री महोत्सव)",
        description: "Grand celebrations at Nhavre, continuous abhishek, night-long prayers, bhajans, and free Mahaprasad distribution to all devotees.",
        startAt: new Date(today.getFullYear() + 1, 1, 15, 6, 0),
        endAt: new Date(today.getFullYear() + 1, 1, 16, 22, 0),
        isFestival: true,
        bannerUrl: "/images/shiva_mahashivratri.png",
      },
      {
        templeId,
        title: "Shravan Somvar Utsav (श्रावण सोमवार)",
        description: "Special Rudrabhishek every Monday in the holy month of Shravan. Hundreds of devotees perform jalabhishek.",
        startAt: new Date(today.getFullYear(), 7, 1, 5, 0),
        endAt: new Date(today.getFullYear(), 7, 31, 21, 0),
        isFestival: true,
        bannerUrl: "/images/shiva_shravan.png",
      },
    ],
  });
  console.log("Seeded Events.");

  // 12. Seed Live Darshan
  await prisma.liveDarshan.create({
    data: {
      templeId,
      title: "Shri Mallikarjun Temple, Nhavre Live stream (नित्य दर्शन)",
      youtubeId: "o68x-977T3U",
      isLive: true,
    },
  });

  // 13. Seed Media Items
  await prisma.mediaItem.createMany({
    data: [
      {
        templeId,
        type: MediaItemType.AUDIO,
        category: MediaCategory.AARTI,
        title: "श्री मल्लिकार्जुन आरती - Shiv Aarti",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        language: "mr",
      },
      {
        templeId,
        type: MediaItemType.TEXT,
        category: MediaCategory.STOTRA,
        title: "शिव तांडव स्तोत्रम् (Shiv Tandav Stotra)",
        url: "जटाटवीगलज्जलप्रवाहपावितस्थले, गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्‌...",
        language: "mr",
      },
      {
        templeId,
        type: MediaItemType.VIDEO,
        category: MediaCategory.HISTORY,
        title: "मूर्ती आणि मंदिराचा इतिहास (Temple Architecture & History)",
        url: "https://www.youtube.com/watch?v=o68x-977T3U",
        language: "mr",
      },
    ],
  });

  // 14. Seed SiteContent (Bilingual keys)
  const contents = [
    // English Keys
    { key: "home.hero_title", title: "Shri Mallikarjun Devasthan, Nhavre", bodyRich: "Divine Blessings of Lord Shiva from the Historic Shrine of Shirur.", locale: Locale.en },
    { key: "home.hero_subtitle", title: "Welcome to Nhavre Temple", bodyRich: "Experience peace, devotion, and community at our heritage temple. Book Abhishek, make donations, or secure accommodation easily.", locale: Locale.en },
    { key: "about.history", title: "Our Sacred Heritage", bodyRich: "Shri Mallikarjun Temple in Nhavre is a historical site dating back several centuries. Located on the banks of a holy stream in Shirur Taluka, it attracts thousands of devotees daily, especially during Shravan Somvar and Mahashivratri.", locale: Locale.en },
    { key: "about.trust", title: "Shri Mallikarjun Devasthan Trust", bodyRich: "The trust handles all temple operations, developmental projects, and charitable causes, including free daily Mahaprasad (Annadaan) for visitors and maintaining the Bhakta Niwas rooms.", locale: Locale.en },

    // Marathi Keys
    { key: "home.hero_title", title: "श्री मल्लिकार्जुन देवस्थान, न्हावरे", bodyRich: "शिरूर तालुक्यातील ऐतिहासिक देवस्थान, भगवान शिवाचा मंगलमय आशीर्वाद.", locale: Locale.mr },
    { key: "home.hero_subtitle", title: "न्हावरे मंदिरामध्ये आपले स्वागत आहे", bodyRich: "आमच्या प्राचीन मंदिरात भक्ती, शांती आणि पवित्रतेचा अनुभव घ्या. पूजा/अभिषेक बुकिंग, देणगी आणि भक्त निवास निवास व्यवस्था सोप्या पद्धतीने करा.", locale: Locale.mr },
    { key: "about.history", title: "आमचा पवित्र इतिहास", bodyRich: "न्हावरे येथील श्री मल्लिकार्जुन मंदिर हे शतकानुशतके जुने ऐतिहासिक श्रद्धास्थान आहे. शिरूर तालुक्यातील एक जागृत शिवस्थान म्हणून या मंदिराची मोठी ख्याती आहे, विशेषतः श्रावण सोमवार आणि महाशिवरात्रीला येथे भाविकांची अलोट गर्दी होते.", locale: Locale.mr },
    { key: "about.trust", title: "श्री मल्लिकार्जुन देवस्थान ट्रस्ट", bodyRich: "देवस्थान ट्रस्ट मंदिरामधील पूजा-अर्चा, विकासकामे आणि अन्नदान (महाप्रसाद) यांसारखे सामाजिक उपक्रम पार पाडते. भाविकांसाठी निवास व्यवस्थेकरिता भक्त निवास चालवले जाते.", locale: Locale.mr },
  ];

  for (const c of contents) {
    await prisma.siteContent.create({
      data: {
        ...c,
        templeId,
      },
    });
  }
  console.log("Seeded Bilingual Site Content.");

  // 15. Settings
  await prisma.setting.create({
    data: {
      templeId,
      key: "receipt_sequence_number",
      value: { current: 10012 },
    },
  });

  // 16. Audit Log
  await prisma.auditLog.create({
    data: {
      templeId,
      userId: "user_stub_admin",
      action: "SEED_DATABASE",
      entity: "Temple",
      entityId: templeId,
      meta: { message: "Database seeded successfully with initial sample records" },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
