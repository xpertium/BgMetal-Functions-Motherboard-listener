import * as admin from "firebase-admin";

export const sendPushNotification = async (
  token: string, notification: { title: string; body: string }) => {
  try {
    const message = {
      notification,
      token,
    };
    const response = await admin.messaging().send(message);
    console.log(`Push sent to ${token}: ${response}`);
  } catch (error: any) {
    console.error("Error sending push notification:", error);

    // Si el token es inválido → desactivar
    if (
      error.code === "messaging/invalid-argument" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      console.log(`Deleting token ${token} due expired or invalid.`);
      const db = admin.firestore();
      const snapshot = await db
        .collection("deviceTokens")
        .where("token", "==", token)
        .get();

      snapshot.forEach((doc) => {
        doc.ref.update({ active: false});
      });
    }
  }
};
