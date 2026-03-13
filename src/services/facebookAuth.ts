import { apiClient } from "./apiClient";
import type { AuthResponse } from "../@types/index";

export interface FacebookLoginPayload {
  accessToken: string;
  role?: "ORDERER" | "PICKER";
}

export const facebookAuthApi = {
  login: (payload: FacebookLoginPayload) =>
    apiClient.post<AuthResponse & { isNewUser: boolean }>(
      "/auth/facebook-login",
      payload,
    ),
};
