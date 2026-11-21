import axios from "axios";

interface SendSmsOtpParams {
  phone: string;
  otp: number | string;
}

export const sendSmsOtp = async ({ phone, otp }: SendSmsOtpParams) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  // Local fallback: if MSG91 is not set, log directly to terminal
  if (!authKey || !templateId) {
    console.log(`\n========================================`);
    console.log(`[DEV SMS GATEWAY] Phone: ${phone} | OTP: ${otp}`);
    console.log(`========================================\n`);
    return { status: "success", mode: "dev_log" };
  }

  try {
    const url = "https://control.msg91.com/api/v5/flow";

    const response = await axios.post(
      url,
      {
        template_id: templateId,
        short_url: "0",
        recipients: [
          {
            mobiles: `91${phone}`,
            number: String(otp),
          },
        ],
      },
      {
        headers: {
          authkey: authKey,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log(`[MSG91] SMS OTP successfully dispatched to ${phone}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "[MSG91] Error sending SMS OTP:",
      error.response?.data || error.message
    );
    throw error;
  }
};