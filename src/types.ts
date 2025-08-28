export type DeviceType = "WEB" | "ANDROID" | "IOS";

export interface DeviceToken {
  userId: string;
  token: string;
  deviceType: DeviceType;
  createdAt: string;
  active: boolean;
}