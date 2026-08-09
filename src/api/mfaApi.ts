import { apiPost } from "./apiClient";
import { supabase } from "../lib/supabase";

export interface MfaEnrollResponse {
  id: string;
  type: "totp";
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export interface MfaChallengeResponse {
  id: string;
  expires_at: number;
}

export interface MfaBackupCodesResponse {
  codes: string[];
}

export async function mfaEnroll(): Promise<MfaEnrollResponse> {
  return apiPost<MfaEnrollResponse>("/api/usuarios/mfa/enroll/", {
    factor_type: "totp",
    friendly_name: `totp-${Date.now()}`,
  });
}

export async function mfaChallenge(factorId: string): Promise<MfaChallengeResponse> {
  return apiPost<MfaChallengeResponse>(
    `/api/usuarios/mfa/${factorId}/challenge/`,
    {},
  );
}

export interface MfaVerifyResponse {
  access_token: string;
  refresh_token: string;
}

export async function mfaVerify(
  factorId: string,
  challengeId: string,
  code: string,
): Promise<MfaVerifyResponse> {
  return apiPost<MfaVerifyResponse>(`/api/usuarios/mfa/${factorId}/verify/`, {
    challenge_id: challengeId,
    code,
  });
}

export async function hasMfaEnabled(): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return false;
  return data.totp.some((factor) => factor.status === "verified");
}

export async function generateBackupCodes(): Promise<string[]> {
  const res = await apiPost<MfaBackupCodesResponse>(
    "/api/usuarios/mfa/backup-codes/generate/",
    {},
  );
  return res.codes;
}

export async function verifyBackupCode(code: string): Promise<number> {
  const res = await apiPost<{ detail: string; remaining: number }>(
    "/api/usuarios/mfa/backup-codes/verify/",
    { code },
  );
  return res.remaining;
}
