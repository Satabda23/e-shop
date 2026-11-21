export const QUEUES = {
  OTP: "otp-queue",
  ORDER_PROCESSING: "order-queue",
  NOTIFICATION: "notification-queue",
};

export const QUEUE_EVENTS = {
  OTP: {
    SEND_SMS: "otp.send-sms",
    SEND_WHATSAPP: "otp.send-whatsapp",
    SEND_EMAIL: "otp.send-email",
  },
  ORDER: {
    CONFIRMATION: "order.confirmation",
  },
} as const;