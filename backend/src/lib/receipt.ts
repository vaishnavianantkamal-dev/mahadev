import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { db } from "./db";

export async function generateReceiptNo(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Find or create sequence
  let seqSetting = await db.setting.findFirst({
    where: { key: "receipt_sequence_number" }
  });
  
  let currentVal = 10015; // Starting sequence
  if (seqSetting) {
    const val = seqSetting.value as { current: number };
    currentVal = val.current + 1;
    await db.setting.update({
      where: { id: seqSetting.id },
      data: { value: { current: currentVal } }
    });
  } else {
    // get seeded temple
    const temple = await db.temple.findFirst({ select: { id: true } });
    if (temple) {
      await db.setting.create({
        data: {
          templeId: temple.id,
          key: "receipt_sequence_number",
          value: { current: currentVal }
        }
      });
    }
  }
  
  return `MMD-${year}-${currentVal}`;
}

export async function generateReceiptPdf(
  receiptNo: string,
  donorName: string,
  phone: string,
  amount: number,
  purpose: string,
  date: Date
): Promise<Buffer> {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  
  // Add a blank page to the document (A5 sized landscape: 595 x 420 points)
  const page = pdfDoc.addPage([550, 360]);
  
  // Get fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Draw border
  page.drawRectangle({
    x: 15,
    y: 15,
    width: 520,
    height: 330,
    borderWidth: 2,
    borderColor: rgb(0.54, 0.18, 0.07), // maroon #8a2e13
    color: rgb(0.98, 0.97, 0.94), // bg-cream #fbf6ec
  });
  
  // Draw header logo frame
  page.drawText("SHRIMAL LIKARJUN DEVASTHAN", {
    x: 120,
    y: 305,
    size: 18,
    font: boldFont,
    color: rgb(0.54, 0.18, 0.07),
  });
  
  page.drawText("Nhavre, Taluka Shirur, District Pune, Maharashtra - 412211", {
    x: 130,
    y: 288,
    size: 9,
    font: font,
    color: rgb(0.16, 0.09, 0.06),
  });
  
  // Separator Line
  page.drawLine({
    start: { x: 30, y: 275 },
    end: { x: 520, y: 275 },
    thickness: 1,
    color: rgb(0.92, 0.86, 0.78),
  });
  
  // Metadata row
  page.drawText(`Receipt No: ${receiptNo}`, { x: 40, y: 250, size: 10, font: boldFont });
  page.drawText(`Date: ${date.toLocaleDateString("en-IN")}`, { x: 400, y: 250, size: 10, font: font });
  
  // Detail details
  page.drawText("Donor Name:", { x: 40, y: 210, size: 10, font: boldFont });
  page.drawText(donorName, { x: 150, y: 210, size: 10, font: font });
  
  page.drawText("Phone Number:", { x: 40, y: 185, size: 10, font: boldFont });
  page.drawText(phone, { x: 150, y: 185, size: 10, font: font });
  
  page.drawText("Contribution Purpose:", { x: 40, y: 160, size: 10, font: boldFont });
  page.drawText(purpose || "General Development / Annadaan", { x: 150, y: 160, size: 10, font: font });
  
  // Amount block with box
  page.drawRectangle({
    x: 40,
    y: 100,
    width: 250,
    height: 35,
    borderWidth: 1,
    borderColor: rgb(0.76, 0.35, 0.13), // saffron
    color: rgb(0.97, 0.92, 0.86),
  });

  const formattedAmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  page.drawText(`Amount Paid: ${formattedAmt}`, {
    x: 50,
    y: 112,
    size: 11,
    font: boldFont,
    color: rgb(0.54, 0.18, 0.07),
  });
  
  // Signatures
  page.drawText("Authorized Trustee", { x: 400, y: 100, size: 10, font: boldFont, color: rgb(0.54, 0.18, 0.07) });
  page.drawText("Shri Mallikarjun Devasthan Trust", { x: 370, y: 85, size: 8, font: font, color: rgb(0.16, 0.09, 0.06) });

  // Divider line
  page.drawLine({
    start: { x: 30, y: 70 },
    end: { x: 520, y: 70 },
    thickness: 0.5,
    color: rgb(0.92, 0.86, 0.78),
  });

  // Footer terms
  page.drawText("This is an official computer-generated e-receipt. May Lord Shiva bless you and your family.", {
    x: 50,
    y: 45,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
