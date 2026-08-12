import axios from "axios";

const BASE_URL = "https://control.msg91.com/api/v5/otp";

export async function sendWhatsappOtp(whatsappNumber: string) {
  const res = await axios.post(
    BASE_URL,
    {
      template_id: process.env.MSG91_WHATSAPP_TEMPLATE_ID,
      mobile: whatsappNumber,
      otp_channel: "whatsapp",
    },
    {
      headers: {
        authkey: process.env.MSG91_AUTH_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

export async function verifyWhatsappOtp(
  whatsappNumber: string,
  otp: string
) {
  const res = await axios.get(`${BASE_URL}/verify`, {
    params: {
      mobile: whatsappNumber,
      otp,
    },
    headers: {
      authkey: process.env.MSG91_AUTH_KEY!,
    },
  });

  return res.data.type === "success";
}