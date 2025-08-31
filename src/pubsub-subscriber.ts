import * as admin from "firebase-admin";
import { MessagePublishedData } from "firebase-functions/v2/pubsub";
import { sendPushNotification } from "./fcm-service";
admin.initializeApp();

export const handlePubSubEvent = async (event: MessagePublishedData<any>) => {
  try {
    const data = event.message.json as {
      eventId: string;
      imageId: string;
      userId: string;
      oldStatus: string;
      newStatus: string;
      createdAt: string;
      updatedAt: string;
    };

    if (!data.userId) {
      console.error("No userId in PubSub message:", data);
      return;
    }

    console.log(`Handling status update for userId=${data.userId}, docId=${data.imageId}`);
    console.log("Evento recibido:", data);

    const db = admin.firestore();

    // Buscar tokens del usuario
    const tokensSnapshot = await db
      .collection("deviceTokens")
      .where("userId", "==", data.userId)
      .where("active", "==", true)
      .get();


    if (tokensSnapshot.empty) {
      console.log(`No tokens found for userId: ${data.userId}`);
      return;
    }

    const promises = tokensSnapshot.docs.map(async (doc) => {
      const tokenData = doc.data();
      const token = tokenData.token;
      const deviceType = tokenData.deviceType;

      const templateDoc = await db
        .collection("notificationTemplates")
        .doc(deviceType)
        .get();

      if (!templateDoc.exists) {
        console.warn(`No template found for deviceType: ${deviceType}`);
        return;
      }

      const template = templateDoc.data();
      const notification = {
        title: template?.title || "Status Update",
        body: template?.body?.replace("{status}", data.newStatus),
      };

      return sendPushNotification(token, notification);
    });

    await Promise.all(promises);
    console.log("Notifications sent successfully.");
  } catch (error) {
    console.error("Error handling PubSub event:", error);
  }
};