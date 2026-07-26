import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { mfaChallenge, mfaVerify, verifyBackupCode } from "../../api/mfaApi";
import { ApiError } from "../../api/apiClient";

const EASE = [0.23, 1, 0.32, 1] as const;
const CODE_LENGTH = 6;

interface Props {
  isDark: boolean;
  onDone: () => void;
}

type Mode = "totp" | "backup";
type Status = "loading" | "ready" | "submitting" | "success" | "error";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MfaChallengeModal: React.FC<Props> = ({ isDark, onDone }) => {
  const { t } = useI18n();
  const m = t("mfachallengemodal");
  const { completeMfaLogin, cancelMfaLogin } = useAuth();

  const [status, setStatus] = useState<Status>("loading");
  const [mode, setMode] = useState<Mode>("totp");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const hasStartedRef = useRef(false);

  const startChallenge = async () => {
    setStatus("loading");
    setError(null);
    try {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp.find((f) => f.status === "verified");
      if (listError || !factor) {
        setStatus("error");
        setError(m.noFactor);
        return;
      }
      const challenge = await mfaChallenge(factor.id);
      setFactorId(factor.id);
      setChallengeId(challenge.id);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError(m.noFactor);
    }
  };

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startChallenge();
  }, []);

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || !factorId || !challengeId) return;
    if (code.length !== CODE_LENGTH) return;

    setError(null);
    setStatus("submitting");
    try {
      const session = await mfaVerify(factorId, challengeId, code);
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      setStatus("success");
      await sleep(600);
      const err = await completeMfaLogin();
      if (err) {
        setError(err);
        setStatus("ready");
        return;
      }
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : m.invalidCode);
      setCode("");
      setStatus("ready");
    }
  };

  const handleVerifyBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || !backupCode.trim()) return;

    setError(null);
    setStatus("submitting");
    try {
      await verifyBackupCode(backupCode.trim());
      setStatus("success");
      await sleep(600);
      const err = await completeMfaLogin();
      if (err) {
        setError(err);
        setStatus("ready");
        return;
      }
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : m.invalidBackupCode);
      setBackupCode("");
      setStatus("ready");
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    await cancelMfaLogin();
    onDone();
  };

  const cardBg = isDark ? "#0F1A3E" : "#FFFFFF";
  const textPrimary = isDark ? "#FFFFFF" : "#1B244C";
  const textSecondary = "#989898";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";
  const inputBg = isDark ? "rgba(39,53,112,0.6)" : "rgba(248,250,252,0.8)";

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[10000] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{ background: cardBg, border: `1px solid ${borderColor}` }}
        className="rounded-3xl p-8 max-w-[420px] w-full shadow-[0_32px_80px_rgba(0,0,0,0.3)]"
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 size={30} className="animate-spin mx-auto mb-4" style={{ color: "#2EBCCC" }} />
              <p style={{ color: textSecondary }} className="text-sm">
                {m.loading}
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(74,168,37,0.14)" }}
              >
                <CheckCircle2 size={30} style={{ color: "#4AA825" }} />
              </motion.div>
              <p className="text-sm font-bold" style={{ color: textPrimary }}>
                {m.success}
              </p>
            </motion.div>
          )}

          {status === "error" && !factorId && (
            <motion.div
              key="no-factor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <p className="text-sm text-red-400 font-medium mb-5">{error}</p>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-[#2EBCCC] hover:bg-[#239aaa] disabled:opacity-60 text-white font-bold text-sm px-5 py-3 rounded-xl border-none cursor-pointer transition-colors"
              >
                {m.back}
              </button>
            </motion.div>
          )}

          {(status === "ready" || status === "submitting") && factorId && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(46,188,204,0.12)" }}
              >
                <ShieldCheck size={26} style={{ color: "#2EBCCC" }} />
              </div>
              <h2 className="font-extrabold text-xl tracking-tight mb-2" style={{ color: textPrimary }}>
                {mode === "totp" ? m.totp.title : m.backup.title}
              </h2>
              <p className="text-sm leading-6 mb-6" style={{ color: textSecondary }}>
                {mode === "totp" ? m.totp.body : m.backup.body}
              </p>

              {mode === "totp" ? (
                <form onSubmit={handleVerifyTotp} className="flex flex-col gap-3">
                  <input
                    id="mfa-challenge-code"
                    name="mfa-challenge-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={m.totp.codePlaceholder}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
                    }
                    maxLength={CODE_LENGTH}
                    disabled={status === "submitting"}
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] outline-none border"
                    style={{
                      background: inputBg,
                      borderColor: error ? "#EF4444" : borderColor,
                      color: textPrimary,
                      transition: "border-color 180ms ease",
                    }}
                  />

                  {error && (
                    <p className="text-xs text-red-500 font-medium m-0" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting" || code.length !== CODE_LENGTH}
                    className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-colors"
                  >
                    {status === "submitting" ? m.verifying : m.totp.verify}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyBackup} className="flex flex-col gap-3">
                  <input
                    id="mfa-backup-code"
                    name="mfa-backup-code"
                    autoComplete="off"
                    placeholder={m.backup.codePlaceholder}
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    disabled={status === "submitting"}
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl text-center text-lg font-mono font-bold tracking-widest outline-none border"
                    style={{
                      background: inputBg,
                      borderColor: error ? "#EF4444" : borderColor,
                      color: textPrimary,
                      transition: "border-color 180ms ease",
                    }}
                  />

                  {error && (
                    <p className="text-xs text-red-500 font-medium m-0" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting" || !backupCode.trim()}
                    className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-colors"
                  >
                    {status === "submitting" ? m.verifying : m.backup.verify}
                  </button>
                </form>
              )}

              <div className="flex items-center justify-between mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "totp" ? "backup" : "totp");
                    setError(null);
                    setCode("");
                    setBackupCode("");
                  }}
                  className="text-xs font-bold bg-transparent border-none cursor-pointer"
                  style={{ color: "#2EBCCC" }}
                >
                  {mode === "totp" ? m.useBackupCode : m.useTotp}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs font-bold bg-transparent border-none cursor-pointer disabled:opacity-60"
                  style={{ color: textSecondary }}
                >
                  {m.back}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MfaChallengeModal;
