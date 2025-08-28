import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { handlePubSubEvent } from "./pubsub-subscriber";

// Subscriber Pub/Sub → FCM
export const sub_motherboard_sendNotification = onMessagePublished(
  "motherboard-status-updates",
  (event) => handlePubSubEvent(event.data)
);