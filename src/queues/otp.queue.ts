import { Queue } from "bullmq";
import { bullmqConnection } from "../config/bullmq-connection";
import { QUEUES } from "../constants/queue.constants";

export const otpQueue = new Queue(QUEUES.OTP, {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3, // Auto-retry up to 3 times on network failure
    removeOnComplete: 1000,
    removeOnFail: 5000,
    backoff: {
      type: "exponential",
      delay: 2000, // Waits 2s, then 4s, then 8s before retrying
    },
  },
});