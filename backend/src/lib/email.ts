export interface EmailReceiptOptions {
  to: string;
  donorName: string;
  receiptNo: string;
  amount: number;
  purpose: string;
  pdfBuffer?: Buffer;
}

export async function sendReceiptEmail(
  options: EmailReceiptOptions
): Promise<{ success: boolean; error?: string }> {
  const isStub = process.env.DEV_STUB_INTEGRATIONS === "true";
  
  if (isStub) {
    console.log(`[STUB EMAIL] Sending e-receipt email to ${options.to}:`);
    console.log(`Donor: ${options.donorName}, Receipt No: ${options.receiptNo}, Amount: ₹${options.amount}, Purpose: ${options.purpose}`);
    if (options.pdfBuffer) {
      console.log(`[STUB EMAIL] Attachment included (PDF length: ${options.pdfBuffer.length} bytes)`);
    }
    return { success: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "info@shrimallikarjun.org";

  if (!apiKey) {
    console.warn("Resend API key missing, logging output instead.");
    return { success: false, error: "Resend API key missing" };
  }

  try {
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ecddc7; border-radius: 12px; background-color: #fbf6ec;">
        <h2 style="color: #8a2e13; text-align: center;">Shri Mallikarjun Devasthan, Nhavre</h2>
        <p>Dear ${options.donorName},</p>
        <p>Thank you for your generous contribution. We have successfully received your donation. Below are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #ecddc7;">
            <td style="padding: 8px; font-weight: bold;">Receipt Number:</td>
            <td style="padding: 8px;">${options.receiptNo}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ecddc7;">
            <td style="padding: 8px; font-weight: bold;">Donation Amount:</td>
            <td style="padding: 8px;">₹${new Intl.NumberFormat("en-IN").format(options.amount)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ecddc7;">
            <td style="padding: 8px; font-weight: bold;">Purpose:</td>
            <td style="padding: 8px;">${options.purpose}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ecddc7;">
            <td style="padding: 8px; font-weight: bold;">Date:</td>
            <td style="padding: 8px;">${new Date().toLocaleDateString("en-IN")}</td>
          </tr>
        </table>
        <p>Your official e-receipt PDF is attached to this email. May Lord Shiva bless you and your family.</p>
        <hr style="border: 0; border-top: 1px solid #ecddc7; margin-top: 30px;" />
        <p style="font-size: 10px; color: gray; text-align: center;">Shri Mallikarjun Devasthan Trust, Nhavre, Taluka Shirur, Pune</p>
      </div>
    `;

    const attachments: any[] = [];
    if (options.pdfBuffer) {
      attachments.push({
        filename: `receipt_${options.receiptNo}.pdf`,
        content: options.pdfBuffer.toString("base64"),
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Shri Mallikarjun Devasthan <${fromEmail}>`,
        to: options.to,
        subject: `Donation Receipt #${options.receiptNo} - Shri Mallikarjun Devasthan`,
        html: emailBody,
        attachments,
      }),
    });

    const data = await res.json();
    if (res.ok && data.id) {
      return { success: true };
    } else {
      return { success: false, error: data.message || "Resend API Error" };
    }
  } catch (error: any) {
    console.error("Email delivery failed:", error);
    return { success: false, error: error.message };
  }
}
