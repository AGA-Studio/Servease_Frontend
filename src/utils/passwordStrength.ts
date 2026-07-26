export type PasswordStrength = "weak" | "fair" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

export const PASSWORD_STRENGTH_COLOR: Record<PasswordStrength, string> = {
  weak: "#EF4444",
  fair: "#FFB200",
  strong: "#4AA825",
};

export const PASSWORD_STRENGTH_WIDTH: Record<PasswordStrength, string> = {
  weak: "33%",
  fair: "66%",
  strong: "100%",
};
