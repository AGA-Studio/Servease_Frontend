export const resetpasswordscreen = {
  waiting: {
    title: "Verifying link...",
    body: "This will only take a moment.",
  },
  form: {
    title: "Create your new password",
    body: "Choose a secure password for your account.",
    newPasswordLabel: "New password",
    newPasswordPlaceholder: "At least 8 characters",
    confirmPasswordLabel: "Confirm new password",
    confirmPasswordPlaceholder: "Repeat your new password",
    submit: "Save password",
    submitting: "Saving...",
    tooShort: "Password must be at least 8 characters.",
    mismatch: "Passwords don't match.",
    strength: {
      weak: "Weak",
      fair: "Fair",
      strong: "Strong",
    },
  },
  success: {
    title: "Password updated!",
    body: "You can now sign in with your new password.",
    cta: "Go to sign in",
  },
  error: {
    title: "Invalid or expired link",
    invalidLink: "Request a new reset email and try again.",
    cta: "Go to sign in",
  },
};
