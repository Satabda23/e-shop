import { Worker } from "bullmq";
import { bullmqConnection } from "../config/bullmq-connection";
import { QUEUE_EVENTS, QUEUES } from "../constants/queue.constants";
import { sendSmsOtp } from "../services/notification/sms.service";

export const otpWorker = new Worker(
  QUEUES.OTP,
  async (job) => {
    switch (job.name) {
      case QUEUE_EVENTS.OTP.SEND_SMS:
        await sendSmsOtp({
          phone: job.data.mobile,
          otp: job.data.otp,
        });
        break;

      default:
        console.warn(`[OTP Worker] Unknown job name: ${job.name}`);
        break;
    }
  },
  {
    connection: bullmqConnection,
    concurrency: 20, // Can process 20 SMS jobs simultaneously
  }
);

otpWorker.on("completed", (job) => {
  console.log(`[OTP Worker] Job ${job.id} completed successfully`);
});

otpWorker.on("failed", (job, err) => {
  console.error(`[OTP Worker] Job ${job?.id} failed with error: ${err.message}`);
});