import { otpQueue } from "../../queues/otp.queue";
import { QUEUE_EVENTS } from "../../constants/queue.constants";

export const otpService = {
  async sendOtp(mobile: string, otp: string) {
    await otpQueue.add(QUEUE_EVENTS.OTP.SEND_SMS, {
      mobile,
      otp,
    });
    return true;
  },
};