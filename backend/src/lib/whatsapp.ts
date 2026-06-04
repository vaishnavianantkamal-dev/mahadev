export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const isStub = process.env.DEV_STUB_INTEGRATIONS === "true";
  
  // Format destination number: strip spaces, dashes, make sure it has 91 prefix
  let formattedPhone = to.replace(/[\s\-\+]/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = "91" + formattedPhone;
  }

  if (isStub) {
    console.log(`[STUB WHATSAPP] Sending message to +${formattedPhone}:`);
    console.log(`----------------------------------------`);
    console.log(text);
    console.log(`----------------------------------------`);
    return { success: true, messageId: `msg_mock_${Math.random().toString(36).substr(2, 9)}` };
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("WhatsApp integrations keys not configured, logging output instead.");
    return { success: false, error: "WhatsApp API keys missing" };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: { body: text },
      }),
    });

    const data = await res.json();
    if (res.ok && data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    } else {
      return { success: false, error: data.error?.message || "Meta API Error" };
    }
  } catch (error: any) {
    console.error("WhatsApp delivery failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  variables: string[],
  languageCode = "mr"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const isStub = process.env.DEV_STUB_INTEGRATIONS === "true";

  let formattedPhone = to.replace(/[\s\-\+]/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = "91" + formattedPhone;
  }

  if (isStub) {
    console.log(`[STUB WHATSAPP TEMPLATE] Sending template [${templateName}] (lang: ${languageCode}) to +${formattedPhone}:`);
    console.log(`Variables:`, variables);
    return { success: true, messageId: `tmpl_mock_${Math.random().toString(36).substr(2, 9)}` };
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { success: false, error: "WhatsApp API credentials missing" };
  }

  try {
    const parameters = variables.map((v) => ({
      type: "text",
      text: v,
    }));

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters,
            },
          ],
        },
      }),
    });

    const data = await res.json();
    if (res.ok && data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    } else {
      return { success: false, error: data.error?.message || "Meta Template API Error" };
    }
  } catch (error: any) {
    console.error("WhatsApp template delivery failed:", error);
    return { success: false, error: error.message };
  }
}
