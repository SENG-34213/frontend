import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type CommunicationSettings = {
  userId: string;
  readReceiptsEnabled: boolean;
  lastSeenVisible: boolean;
  profilePhotoVisible: boolean;
  groupNotificationsEnabled: boolean;
  directNotificationsEnabled: boolean;
};

export type CommunicationSettingsUpdate = Partial<Omit<CommunicationSettings, "userId">>;

export async function getCommunicationSettings(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<CommunicationSettings>>(
    "/api/communication/settings",
    { signal },
  );
  return response.data as CommunicationSettings;
}

export async function updateCommunicationSettings(payload: CommunicationSettingsUpdate) {
  const response = await apiRequest<ApiResponse<CommunicationSettings>>(
    "/api/communication/settings",
    { method: "PATCH", body: payload },
  );
  return response.data as CommunicationSettings;
}
