import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Copy, Check, X, Loader2, Download, KeyRound } from "lucide-react";
import { useI18n } from "../../i18n";
import { mfaEnroll, mfaChallenge, mfaVerify, generateBackupCodes } from "../../api/mfaApi";
import { ApiError } from "../../api/apiClient";

const EASE = [0.23, 1, 0.32, 1] as const;
const CODE_LENGTH = 6;

interface Props {
  isDark: boolean;
  onClose: () => void;
  onEnabled: () => void;
}

type Stage =
  | "loading"
  | "scan"
  | "verifying"
  | "backupCodes"
  | "success"
  | "enrollError";

const TwoFactorSetupModal: React.FC<Props> = ({ isDark, onClose, onEnabled }) => {
  const { t } = useI18n();
  const m = t("mfasetupmodal");

  const [stage, setStage] = useState<Stage>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesConfirmed, setBackupCodesConfirmed] = useState(false);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);
  const hasStartedRef = useRef(false);

  const startEnroll = async () => {
    setStage("loading");
    setError(null);
    try {
      const enrolled = await mfaEnroll();
      const challenge = await mfaChallenge(enrolled.id);
      setFactorId(enrolled.id);
      setQrCode(
        `data:image/svg+xml;utf8,${encodeURIComponent(enrolled.totp.qr_code)}`,
      );
      setSecret(enrolled.totp.secret);
      setChallengeId(challenge.id);
      setStage("scan");
    } catch {
      setStage("enrollError");
    }
  };

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startEnroll();
  }, []);

  const refreshChallenge = async () => {
    if (!factorId) return;
    setError(null);
    try {
      const challenge = await mfaChallenge(factorId);
      setChallengeId(challenge.id);
      setCode("");
    } catch {
      setError(m.scan.invalidCode);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage === "verifying" || !factorId || !challengeId) return;
    if (code.length !== CODE_LENGTH) return;

    setError(null);
    setStage("verifying");
    try {
      await mfaVerify(factorId, challengeId, code);
      setCode("");
      setStage("backupCodes");
      const codes = await generateBackupCodes();
      setBackupCodes(codes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : m.scan.invalidCode);
      setStage("scan");
    }
  };

  const handleCopySecret = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setBackupCodesCopied(true);
    setTimeout(() => setBackupCodesCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n") + "\n"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "servease-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
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
        className="rounded-3xl p-8 max-w-[440px] w-full shadow-[0_32px_80px_rgba(0,0,0,0.3)] relative"
      >
        {stage !== "backupCodes" && (
          <button
            onClick={onClose}
            aria-label={m.close}
            className="absolute right-5 top-5 bg-transparent border-none cursor-pointer p-1 rounded-lg"
            style={{ color: textSecondary }}
          >
            <X size={18} />
          </button>
        )}

        <AnimatePresence mode="wait">
          {stage === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 size={30} className="animate-spin mx-auto mb-4" style={{ color: "#2EBCCC" }} />
              <p style={{ color: textSecondary }} className="text-sm">
                {m.scan.title}
              </p>
            </motion.div>
          )}

          {stage === "enrollError" && (
            <motion.div
              key="enroll-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <p className="text-sm text-red-400 font-medium mb-5">{m.scan.enrollError}</p>
              <button
                onClick={startEnroll}
                className="bg-[#2EBCCC] hover:bg-[#239aaa] text-white font-bold text-sm px-5 py-3 rounded-xl border-none cursor-pointer transition-colors"
              >
                {m.scan.newCode}
              </button>
            </motion.div>
          )}

          {(stage === "scan" || stage === "verifying") && (
            <motion.div
              key="scan"
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
                {m.scan.title}
              </h2>
              <p className="text-sm leading-6 mb-5" style={{ color: textSecondary }}>
                {m.scan.body}
              </p>

              {qrCode && (
                <div className="bg-white rounded-2xl p-4 flex items-center justify-center mb-4">
                  <img src={qrCode} alt="QR" className="w-40 h-40" />
                </div>
              )}

              {secret && (
                <div className="mb-5">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: textSecondary }}>
                    {m.scan.secretLabel}
                  </p>
                  <div
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: inputBg, border: `1px solid ${borderColor}` }}
                  >
                    <code className="text-xs font-mono break-all" style={{ color: textPrimary }}>
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="shrink-0 flex items-center gap-1 text-xs font-bold bg-transparent border-none cursor-pointer"
                      style={{ color: "#2EBCCC" }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? m.scan.copied : m.scan.copy}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerify} className="flex flex-col gap-3">
                <div>
                  <label
                    htmlFor="mfa-code"
                    className="block text-xs font-bold mb-1.5"
                    style={{ color: textPrimary }}
                  >
                    {m.scan.codeLabel}
                  </label>
                  <input
                    id="mfa-code"
                    name="mfa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={m.scan.codePlaceholder}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
                    }
                    maxLength={CODE_LENGTH}
                    disabled={stage === "verifying"}
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] outline-none border"
                    style={{
                      background: inputBg,
                      borderColor: error ? "#EF4444" : borderColor,
                      color: textPrimary,
                      transition: "border-color 180ms ease",
                    }}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-medium m-0" role="alert">
                    {error}{" "}
                    <button
                      type="button"
                      onClick={refreshChallenge}
                      className="underline bg-transparent border-none cursor-pointer p-0 text-red-500 font-medium"
                    >
                      {m.scan.newCode}
                    </button>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={stage === "verifying" || code.length !== CODE_LENGTH}
                  className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-colors"
                >
                  {stage === "verifying" ? m.scan.verifying : m.scan.verify}
                </button>
              </form>
            </motion.div>
          )}

          {stage === "backupCodes" && (
            <motion.div
              key="backup-codes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(255,178,0,0.12)" }}
              >
                <KeyRound size={26} style={{ color: "#FFB200" }} />
              </div>
              <h2 className="font-extrabold text-xl tracking-tight mb-2" style={{ color: textPrimary }}>
                {m.backupCodes.title}
              </h2>
              <p className="text-sm leading-6 mb-5" style={{ color: textSecondary }}>
                {m.backupCodes.body}
              </p>

              {backupCodes.length === 0 ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={24} className="animate-spin" style={{ color: "#2EBCCC" }} />
                </div>
              ) : (
                <>
                  <div
                    className="grid grid-cols-2 gap-2 p-4 rounded-2xl mb-4"
                    style={{ background: inputBg, border: `1px solid ${borderColor}` }}
                  >
                    {backupCodes.map((c) => (
                      <code
                        key={c}
                        className="text-xs font-mono text-center py-1.5"
                        style={{ color: textPrimary }}
                      >
                        {c}
                      </code>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-5">
                    <button
                      type="button"
                      onClick={handleCopyBackupCodes}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border cursor-pointer"
                      style={{ borderColor, color: textPrimary, background: "transparent" }}
                    >
                      {backupCodesCopied ? <Check size={14} /> : <Copy size={14} />}
                      {backupCodesCopied ? m.scan.copied : m.backupCodes.copyAll}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadBackupCodes}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border cursor-pointer"
                      style={{ borderColor, color: textPrimary, background: "transparent" }}
                    >
                      <Download size={14} />
                      {m.backupCodes.download}
                    </button>
                  </div>

                  <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupCodesConfirmed}
                      onChange={(e) => setBackupCodesConfirmed(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-xs leading-5" style={{ color: textSecondary }}>
                      {m.backupCodes.confirm}
                    </span>
                  </label>

                  <button
                    onClick={() => setStage("success")}
                    disabled={!backupCodesConfirmed}
                    className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-colors"
                  >
                    {m.backupCodes.continue}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="text-center py-2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(46,188,204,0.12)" }}
              >
                <ShieldCheck size={30} style={{ color: "#2EBCCC" }} />
              </motion.div>
              <h2 className="font-extrabold text-xl tracking-tight mb-2" style={{ color: textPrimary }}>
                {m.success.title}
              </h2>
              <p className="text-sm leading-6 mb-7" style={{ color: textSecondary }}>
                {m.success.body}
              </p>
              <button
                onClick={onEnabled}
                className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] active:scale-[0.98] text-white font-extrabold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-[transform,background-color] duration-150"
              >
                {m.success.close}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TwoFactorSetupModal;
