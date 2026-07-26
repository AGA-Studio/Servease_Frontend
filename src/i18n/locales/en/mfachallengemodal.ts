export const mfachallengemodal = {
  loading: "Preparing verification...",
  verifying: "Verifying...",
  success: "Verified! Signing you in...",
  invalidCode: "Invalid or expired code.",
  invalidBackupCode: "Invalid or already used backup code.",
  noFactor: "We couldn't verify your 2FA. Try signing in again.",
  useBackupCode: "Use a backup code",
  useTotp: "Use authenticator app",
  back: "Cancel and sign in again",
  totp: {
    title: "Two-factor verification",
    body: "Enter the 6-digit code from your authenticator app.",
    codePlaceholder: "000000",
    verify: "Verify",
  },
  backup: {
    title: "Backup code",
    body: "Enter one of your single-use backup codes.",
    codePlaceholder: "XXXXX-XXXXX",
    verify: "Verify",
  },
};
