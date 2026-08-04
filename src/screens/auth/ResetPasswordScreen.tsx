import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ROUTES } from "../../router/routes";
import { useI18n } from "../../i18n";
import { supabase } from "../../lib/supabase";
import {
  getPasswordStrength,
  PASSWORD_STRENGTH_COLOR,
  PASSWORD_STRENGTH_WIDTH,
} from "../../utils/passwordStrength";
import "../../styles/animations.global.css";

type Status = "waitingLink" | "form" | "submitting" | "success" | "error";

const EASE = [0.23, 1, 0.32, 1] as const;
const MAX_PASSWORD_LENGTH = 72;

const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const r = t("resetpasswordscreen");

  const [status, setStatus] = useState<Status>("waitingLink");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = useMemo(
    () => (password ? getPasswordStrength(password) : null),
    [password],
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("form");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus((prev) => (prev === "waitingLink" ? "form" : prev));
    });

    const timeout = setTimeout(() => {
      setStatus((prev) => {
        if (prev !== "waitingLink") return prev;
        setErrorMessage(r.error.invalidLink);
        return "error";
      });
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };

  }, []);

  useEffect(() => {
    if (status === "error") {
      supabase.auth.signOut().catch(() => {});
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (password.length < 8) {
      setErrorMessage(r.form.tooShort);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(r.form.mismatch);
      return;
    }

    setErrorMessage(null);
    setStatus("submitting");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMessage(error.message);
      setStatus("form");
      return;
    }

    await supabase.auth.signOut();
    setPassword("");
    setConfirmPassword("");
    setStatus("success");
  };

  const inputBaseClass =
    "w-full px-4 py-3.5 rounded-2xl text-sm font-medium outline-none border border-[#E5E7EB] bg-white text-[#1B244C] placeholder:text-slate-400";
  const inputTransition = { transition: "border-color 180ms ease, box-shadow 180ms ease" };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F6F8F8] dark:bg-[#1B244C]">
      <div className="w-full max-w-md rounded-[2rem] border border-[#E5E7EB] bg-white p-10 text-center shadow-[0_24px_60px_rgba(27,36,76,0.1)] animate-scale-in overflow-hidden">
        <AnimatePresence mode="wait">
          {status === "waitingLink" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <div className="w-16 h-16 bg-[#2EBCCC]/12 rounded-[22px] flex items-center justify-center mx-auto mb-6">
                <Loader2 size={30} className="text-[#2EBCCC] animate-spin" />
              </div>
              <h1 className="font-extrabold text-2xl tracking-tight text-[#1B244C] mb-2">
                {r.waiting.title}
              </h1>
              <p className="text-[0.9375rem] text-slate-500">{r.waiting.body}</p>
            </motion.div>
          )}

          {(status === "form" || status === "submitting") && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="w-16 h-16 bg-[#2EBCCC]/12 rounded-[22px] flex items-center justify-center mx-auto mb-6"
              >
                <KeyRound size={28} className="text-[#2EBCCC]" />
              </motion.div>
              <h1 className="font-extrabold text-2xl tracking-tight text-[#1B244C] mb-2">
                {r.form.title}
              </h1>
              <p className="text-[0.9375rem] text-slate-500 mb-6">{r.form.body}</p>

              <form
                onSubmit={handleSubmit}
                className="text-left flex flex-col gap-4"
                autoComplete="off"
              >
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-bold text-[#1B244C] mb-1.5 ml-1"
                  >
                    {r.form.newPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={r.form.newPasswordPlaceholder}
                      maxLength={MAX_PASSWORD_LENGTH}
                      autoComplete="new-password"
                      className={`${inputBaseClass} pr-12 focus:border-[#2EBCCC] focus:shadow-[0_0_0_4px_rgba(46,188,204,0.12)]`}
                      style={inputTransition}
                      disabled={status === "submitting"}
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-0 flex items-center text-slate-400"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {password.length > 0 && strength && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-1">
                          <div className="flex-1 h-1 rounded-full bg-[#E5E7EB] overflow-hidden">
                            <div
                              style={{
                                width: PASSWORD_STRENGTH_WIDTH[strength],
                                background: PASSWORD_STRENGTH_COLOR[strength],
                                transition: "width 220ms ease-out, background-color 220ms ease-out",
                              }}
                              className="h-full rounded-full"
                            />
                          </div>
                          <span
                            style={{ color: PASSWORD_STRENGTH_COLOR[strength] }}
                            className="text-[11px] font-bold shrink-0"
                          >
                            {r.form.strength[strength]}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-bold text-[#1B244C] mb-1.5 ml-1"
                  >
                    {r.form.confirmPasswordLabel}
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={r.form.confirmPasswordPlaceholder}
                    maxLength={MAX_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    className={`${inputBaseClass} focus:border-[#2EBCCC] focus:shadow-[0_0_0_4px_rgba(46,188,204,0.12)]`}
                    style={inputTransition}
                    disabled={status === "submitting"}
                    required
                  />
                </div>

                <AnimatePresence>
                  {errorMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      className="text-sm text-red-500 font-medium m-0"
                      role="alert"
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={status === "submitting"}
                  whileTap={status === "submitting" ? undefined : { scale: 0.97 }}
                  className="w-full bg-[#2EBCCC] text-white font-extrabold text-[0.9375rem] py-4 rounded-2xl border-none cursor-pointer shadow-[0_8px_24px_#2EBCCC44] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ transition: "transform 160ms ease-out, background-color 160ms ease-out" }}
                  onMouseEnter={(e) => {
                    if (status !== "submitting") e.currentTarget.style.backgroundColor = "#239aaa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2EBCCC";
                  }}
                >
                  {status === "submitting" ? r.form.submitting : r.form.submit}
                </motion.button>
              </form>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="w-16 h-16 bg-[#2EBCCC]/12 rounded-[22px] flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 size={30} className="text-[#2EBCCC]" />
              </motion.div>
              <h1 className="font-extrabold text-2xl tracking-tight text-[#1B244C] mb-2">
                {r.success.title}
              </h1>
              <p className="text-[0.9375rem] text-slate-500 mb-8">{r.success.body}</p>
              <motion.button
                onClick={() => navigate(ROUTES.AUTH, { replace: true })}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] text-white font-extrabold text-[0.9375rem] py-4 rounded-2xl border-none cursor-pointer shadow-[0_8px_24px_#2EBCCC44] transition-colors duration-150"
              >
                {r.success.cta}
              </motion.button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="w-16 h-16 bg-red-400/12 rounded-[22px] flex items-center justify-center mx-auto mb-6"
              >
                <XCircle size={30} className="text-red-400" />
              </motion.div>
              <h1 className="font-extrabold text-2xl tracking-tight text-[#1B244C] mb-2">
                {r.error.title}
              </h1>
              <p className="text-[0.9375rem] text-slate-500 mb-8">
                {errorMessage ?? r.error.invalidLink}
              </p>
              <motion.button
                onClick={() => navigate(ROUTES.AUTH, { replace: true })}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] text-white font-extrabold text-[0.9375rem] py-4 rounded-2xl border-none cursor-pointer shadow-[0_8px_24px_#2EBCCC44] transition-colors duration-150"
              >
                {r.error.cta}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
