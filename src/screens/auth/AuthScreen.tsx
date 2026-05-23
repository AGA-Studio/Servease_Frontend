import React, { useState, useCallback } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Wrench,
  Briefcase,
} from "lucide-react";
import ToastContainer from "../../components/Toast/ToastContainer";
import { useToast } from "../../components/Toast/useToast";
import type { ThemeMode } from "../../theme/theme";
import { useI18n } from "../../i18n";
import "../../styles/animations.global.css";
import "./animations.auth.css";
import ServeaseLogoDark from "../../assets/Servease-Icono-Modo-Oscuro.svg";
import ServeaseLogo from "../../assets/Servease-Icono.svg";
import { useAuth } from "../../context/AuthContext";

type AuthMode = "login" | "signup";

interface SignupData {
  firstName: string;
  lastNameP: string;
  lastNameM: string;
  email: string;
  password: string;
}

type LoginErrors = { email?: string; password?: string };
type SignupStep0Errors = {
  firstName?: string;
  lastNameP?: string;
  lastNameM?: string;
};
type SignupStep1Errors = { email?: string; password?: string };

const SunIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Spinner = () => (
  <span className="inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
);

const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("servease-theme") as ThemeMode) || "light"
      : "light",
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("servease-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
};

const DevModal: React.FC<{ onClose: () => void; theme: ThemeMode }> = ({
  onClose,
  theme,
}) => {
  const { t } = useI18n();
  const dm = t("auth").devModal;
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[10000] flex items-center justify-center p-6 animate-fade-in">
      <div
        className={`${isDark ? "bg-[#1B244C] border-[#273570]" : "bg-white border-gray-200"} border rounded-3xl p-10 max-w-[420px] w-full text-center shadow-[0_32px_80px_rgba(0,0,0,0.3)] animate-scale-in`}
      >
        <div className="w-17 h-17 bg-[#2EBCCC]/12 rounded-[22px] flex items-center justify-center mx-auto mb-6">
          <Wrench size={32} className="text-[#2EBCCC]" />
        </div>
        <h2
          className={`font-extrabold text-2xl tracking-tight mb-3 ${isDark ? "text-white" : "text-[#1B244C]"}`}
        >
          {dm.title}
        </h2>
        <p
          className={`text-[0.9375rem] leading-7 mb-8 ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {dm.body}{" "}
          <strong className={isDark ? "text-white" : "text-[#1B244C]"}>
            {dm.bodyBold}
          </strong>
          {dm.bodyEnd}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] active:scale-[0.98] text-white font-extrabold text-[0.9375rem] py-4 rounded-2xl border-none cursor-pointer shadow-[0_8px_24px_#2EBCCC44] transition-all duration-200"
        >
          {dm.confirm}
        </button>
      </div>
    </div>
  );
};

interface InputFieldProps {
  type?: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  name: string;
  focusedField: string | null;
  onFocus: () => void;
  onBlur: () => void;
  theme: ThemeMode;
  suffix?: React.ReactNode;
  badge?: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  placeholder,
  label,
  value,
  onChange,
  icon,
  name,
  focusedField,
  onFocus,
  onBlur,
  theme,
  suffix,
  badge,
  error,
}) => {
  const isDark = theme === "dark";
  const isFocused = focusedField === name;
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`text-[0.78rem] font-bold tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </label>
      <div className={hasError ? "animate-input-shake" : ""}>
        <div className="relative">
          <span
            className={`absolute left-4 top-1/2 -translate-y-1/2 flex pointer-events-none transition-colors duration-200 ${hasError ? "text-red-400" : isFocused ? "text-[#2EBCCC]" : "text-slate-400"}`}
          >
            {icon}
          </span>
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`w-full pl-12 py-4 rounded-2xl text-[0.9375rem] font-medium outline-none transition-all duration-200 placeholder:text-slate-400 ${suffix ? "pr-12" : badge ? "pr-24" : "pr-4"} ${isDark ? "bg-[#273570] text-white border border-[#273570]" : "bg-[#F8FAFC] text-black border border-[#E5E7EB]"} ${hasError ? "!border-red-400 shadow-[0_0_0_4px_rgba(248,113,113,0.15)]" : isFocused ? "!border-[#2EBCCC] shadow-[0_0_0_4px_#2EBCCC22]" : ""}`}
          />
          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
              {suffix}
            </div>
          )}
          {badge && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[0.68rem] font-bold text-slate-400 px-2 py-0.5 rounded-md pointer-events-none ${isDark ? "bg-[#1B244C]" : "bg-slate-100"}`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      {hasError && (
        <p className="text-red-400 text-[0.75rem] font-semibold mt-0.5 flex items-center gap-1.5 animate-fade-up">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

const LangToggle: React.FC<{ theme: ThemeMode }> = ({ theme }) => {
  const { locale, toggleLocale } = useI18n();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleLocale}
      className={`shrink-0 h-10 px-3 flex items-center justify-center rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105 font-extrabold text-[0.75rem] tracking-widest ${isDark ? "bg-white/8 border-[#273570] text-slate-400 hover:text-white" : "bg-[#F6F8F8] border-[#E5E7EB] text-slate-500 hover:text-black"}`}
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
};

const AuthScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const authLogo = isDark ? ServeaseLogoDark : ServeaseLogo;
  const { toasts, addToast, removeToast } = useToast();
  const { t } = useI18n();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [signupStep, setSignupStep] = useState(0);
  const [stepDirection, setStepDirection] = useState<"forward" | "back">(
    "forward",
  );
  const [fieldsVisible, setFieldsVisible] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});

  const [signupData, setSignupData] = useState<SignupData>({
    firstName: "",
    lastNameP: "",
    lastNameM: "",
    email: "",
    password: "",
  });
  const [signupStep0Errors, setSignupStep0Errors] = useState<SignupStep0Errors>(
    {},
  );
  const [signupStep1Errors, setSignupStep1Errors] = useState<SignupStep1Errors>(
    {},
  );

  const isLogin = mode === "login";
  const auth = t("auth");

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const switchMode = (next: AuthMode) => {
    setStepDirection("forward");
    setFieldsVisible(false);
    setHeaderVisible(false);
    setTimeout(() => {
      setMode(next);
      setSignupStep(0);
      setLoginData({ email: "", password: "" });
      setLoginErrors({});
      setSignupData({
        firstName: "",
        lastNameP: "",
        lastNameM: "",
        email: "",
        password: "",
      });
      setSignupStep0Errors({});
      setSignupStep1Errors({});
      setFieldsVisible(true);
      setHeaderVisible(true);
    }, 50);
  };

  const animateStep = (dir: "forward" | "back", cb: () => void) => {
    setStepDirection(dir);
    setFieldsVisible(false);
    setTimeout(() => {
      cb();
      setFieldsVisible(true);
    }, 240);
  };

  const validateLoginForm = (): boolean => {
    const errors: LoginErrors = {};
    if (!loginData.email.trim()) errors.email = auth.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email))
      errors.email = auth.errors.emailInvalid;
    if (!loginData.password) errors.password = auth.errors.passwordRequired;
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep0 = (): boolean => {
    const errors: SignupStep0Errors = {};
    if (!signupData.firstName.trim())
      errors.firstName = auth.errors.firstNameRequired;
    if (!signupData.lastNameP.trim())
      errors.lastNameP = auth.errors.lastNamePRequired;
    setSignupStep0Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep1 = (): boolean => {
    const errors: SignupStep1Errors = {};
    if (!signupData.email.trim()) errors.email = auth.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email))
      errors.email = auth.errors.emailInvalid;
    if (signupData.password.length < 6)
      errors.password = auth.errors.passwordMin;
    setSignupStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    const valid = signupStep === 0 ? validateStep0() : validateStep1();
    if (!valid) return;
    if (signupStep < auth.signup.steps.length - 1) {
      animateStep("forward", () => setSignupStep((s) => s + 1));
    } else {
      setIsLoading(true);
      const error = await signup({
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastNameP: signupData.lastNameP,
        lastNameM: signupData.lastNameM,
      });
      setIsLoading(false);
      if (error) {
        addToast("error", error);
      } else {
        navigate("/app/home", { replace: true });
      }
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setIsLoading(true);
    const error = await login(loginData.email, loginData.password);
    setIsLoading(false);
    if (error) {
      addToast("error", error);
    } else {
      navigate("/app/home", { replace: true });
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    await loginWithGoogle();
  };

  const fieldsAnimClass = fieldsVisible
    ? stepDirection === "forward"
      ? "animate-drag-in-fwd"
      : "animate-drag-in-back"
    : "opacity-0 transition-opacity duration-200";

  const headerAnimClass = headerVisible ? "animate-wheel-in" : "opacity-0";

  const primaryBtnBase =
    "flex-1 bg-[#2EBCCC] hover:bg-[#239aaa] disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] text-white font-extrabold text-[0.9375rem] py-4 px-5 rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_8px_24px_#2EBCCC44] transition-all duration-200";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        input::placeholder { color: #94a3b8; }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={theme} />
      {showDevModal && (
        <DevModal onClose={() => setShowDevModal(false)} theme={theme} />
      )}

      <div
        className={`page-enter min-h-screen w-full flex items-center justify-center p-6 transition-colors duration-400 ${isDark ? "bg-[#1B244C]" : "bg-[#F6F8F8]"}`}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-[#2EBCCC]/10 rounded-full blur-[60px]" />
          <div
            className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[60px] ${isDark ? "bg-white/5" : "bg-[#1B244C]/5"}`}
          />
        </div>

        <div
          className={`relative w-full max-w-5xl rounded-[2rem] overflow-hidden flex flex-row min-h-[680px] border transition-colors duration-400 z-10 ${isDark ? "bg-[#1B244C] border-[#273570] shadow-[0_32px_80px_rgba(0,0,0,0.4)]" : "bg-white border-[#E5E7EB] shadow-[0_24px_60px_rgba(27,36,76,0.1)]"}`}
        >
          {/* LEFT ASIDE */}
          <div className="hidden md:flex w-[45%] bg-gradient-to-br from-[#1B244C] via-[#273570] to-[#1a2d5a] p-14 flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-20 -right-16 w-72 h-72 bg-[#2EBCCC]/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-12 -left-16 w-56 h-56 bg-[#2EBCCC]/6 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-14">
                <div className="w-10 h-10 rounded-[8px] bg-cyan-500/30 flex items-center justify-center p-1.5">
                  <img
                    src={authLogo}
                    alt="Servease"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white font-extrabold text-[1.375rem] tracking-tight">
                  Servease
                </span>
              </div>
              <h2 className="text-white font-extrabold text-[2.5rem] leading-[1.2] tracking-tight mb-5">
                {auth.sidebar.tagline}{" "}
                <span className="text-[#2EBCCC]">{auth.sidebar.ease}</span>{" "}
                {auth.sidebar.taglineEnd}
              </h2>
              <p className="text-white/50 text-[0.9375rem] leading-7 max-w-[22rem]">
                {auth.sidebar.description}
              </p>
            </div>

            <div className="relative z-10">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-white/40 text-[0.7rem] font-extrabold tracking-widest uppercase mb-3">
                  {auth.sidebar.legal}
                </p>
                <p className="text-white/55 text-[0.8rem] leading-6 mb-4">
                  {auth.sidebar.legalText}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-[#2EBCCC] text-[0.78rem] font-bold underline decoration-dotted underline-offset-[3px] bg-transparent border-none cursor-pointer p-0 hover:text-white transition-colors duration-200"
                  >
                    {auth.sidebar.terms}
                  </button>
                  <span className="text-white/20 text-[0.78rem]">·</span>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-[#2EBCCC] text-[0.78rem] font-bold underline decoration-dotted underline-offset-[3px] bg-transparent border-none cursor-pointer p-0 hover:text-white transition-colors duration-200"
                  >
                    {auth.sidebar.privacy}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            className={`w-full md:w-[55%] px-10 py-12 flex flex-col justify-center transition-colors duration-400 ${isDark ? "bg-[#1B244C]" : "bg-white"}`}
          >
            <div className="max-w-[28rem] mx-auto w-full">
              <div
                className={`flex justify-between items-start mb-7 ${headerAnimClass}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-[#2EBCCC] rounded-full" />
                    <span className="text-[#2EBCCC] font-extrabold text-[0.7rem] tracking-widest uppercase">
                      {isLogin
                        ? auth.login.badge
                        : `${auth.signup.badge} — ${auth.signup.stepOf} ${signupStep + 1} ${auth.signup.of} ${auth.signup.steps.length}`}
                    </span>
                  </div>
                  <h1
                    className={`font-extrabold text-[1.875rem] tracking-tight m-0 transition-colors duration-300 ${isDark ? "text-white" : "text-black"}`}
                  >
                    {isLogin ? auth.login.title : auth.signup.steps[signupStep]}
                  </h1>
                  <p
                    className={`text-sm font-medium mt-1 m-0 ${isDark ? "text-slate-400" : "text-[#989898]"}`}
                  >
                    {isLogin
                      ? auth.login.subtitle
                      : auth.signup.subtitles[signupStep]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <LangToggle theme={theme} />
                  <button
                    onClick={toggleTheme}
                    className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border cursor-pointer transition-all duration-300 hover:rotate-[20deg] hover:scale-110 ${isDark ? "bg-white/8 border-[#273570] text-slate-400" : "bg-[#F6F8F8] border-[#E5E7EB] text-slate-500"}`}
                  >
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="flex gap-2 mb-7">
                  {auth.signup.steps.map((step, i) => (
                    <div key={i} className="flex-1">
                      <div
                        className={`h-1 rounded-full mb-1.5 transition-all duration-500 ${i <= signupStep ? "bg-[#2EBCCC]" : isDark ? "bg-[#273570]" : "bg-[#E5E7EB]"}`}
                      />
                      <span
                        className={`text-[0.7rem] font-extrabold transition-colors duration-500 ${i <= signupStep ? "text-[#2EBCCC]" : "text-slate-400"}`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!isLogin && signupStep === 0 && (
                <div
                  className={`flex gap-2 p-1.5 rounded-2xl mb-5 border ${isDark ? "bg-white/5 border-[#273570]" : "bg-[#F6F8F8] border-[#E5E7EB]"}`}
                >
                  <div
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-[#2EBCCC] ${isDark ? "bg-[#2EBCCC]/15 ring-1 ring-[#2EBCCC]/30" : "bg-white shadow-md"}`}
                  >
                    <User size={15} /> {auth.signup.roleClient}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 rounded-xl font-bold text-[0.8rem] text-slate-400 cursor-not-allowed opacity-55 select-none">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={15} /> {auth.signup.roleProvider}
                    </span>
                    <span
                      className={`text-[0.62rem] font-extrabold px-2 py-0.5 rounded-md ${isDark ? "bg-[#273570]" : "bg-slate-100"}`}
                    >
                      {auth.signup.roleProviderUnavailable}
                    </span>
                  </div>
                </div>
              )}

              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <InputField
                    label={auth.login.email}
                    type="email"
                    name="email-login"
                    placeholder={auth.login.emailPlaceholder}
                    value={loginData.email}
                    onChange={(e) => {
                      setLoginData({ ...loginData, email: e.target.value });
                      setLoginErrors((p) => ({ ...p, email: undefined }));
                    }}
                    icon={<Mail size={18} />}
                    focusedField={focusedField}
                    onFocus={() => setFocusedField("email-login")}
                    onBlur={() => setFocusedField(null)}
                    theme={theme}
                    error={loginErrors.email}
                  />
                  <InputField
                    label={auth.login.password}
                    type={showPassword ? "text" : "password"}
                    name="password-login"
                    placeholder={auth.login.passwordPlaceholder}
                    value={loginData.password}
                    onChange={(e) => {
                      setLoginData({ ...loginData, password: e.target.value });
                      setLoginErrors((p) => ({ ...p, password: undefined }));
                    }}
                    icon={<Lock size={18} />}
                    focusedField={focusedField}
                    onFocus={() => setFocusedField("password-login")}
                    onBlur={() => setFocusedField(null)}
                    theme={theme}
                    error={loginErrors.password}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                  />
                  <div className="flex justify-end pt-0.5 pb-3">
                    <button
                      type="button"
                      onClick={() =>
                        addToast("info", auth.toast.forgotPassword)
                      }
                      className="bg-transparent border-none cursor-pointer text-[#2EBCCC] hover:text-[#239aaa] font-bold text-[0.8125rem] p-0 transition-colors"
                    >
                      {auth.login.forgotPassword}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] text-white font-extrabold text-[0.9375rem] py-4 px-5 rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_8px_24px_#2EBCCC44] transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Spinner />
                        <span className="animate-pulse">
                          {auth.login.submitting}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{auth.login.submit}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div>
                  <div className={`space-y-3.5 ${fieldsAnimClass}`}>
                    {signupStep === 0 ? (
                      <>
                        <InputField
                          label={auth.signup.firstName}
                          name="firstName"
                          placeholder={auth.signup.firstNamePlaceholder}
                          value={signupData.firstName}
                          onChange={(e) => {
                            setSignupData({
                              ...signupData,
                              firstName: e.target.value,
                            });
                            setSignupStep0Errors((p) => ({
                              ...p,
                              firstName: undefined,
                            }));
                          }}
                          icon={<User size={18} />}
                          focusedField={focusedField}
                          onFocus={() => setFocusedField("firstName")}
                          onBlur={() => setFocusedField(null)}
                          theme={theme}
                          error={signupStep0Errors.firstName}
                        />
                        <InputField
                          label={auth.signup.lastNameP}
                          name="lastNameP"
                          placeholder={auth.signup.lastNamePPlaceholder}
                          value={signupData.lastNameP}
                          onChange={(e) => {
                            setSignupData({
                              ...signupData,
                              lastNameP: e.target.value,
                            });
                            setSignupStep0Errors((p) => ({
                              ...p,
                              lastNameP: undefined,
                            }));
                          }}
                          icon={<User size={18} />}
                          focusedField={focusedField}
                          onFocus={() => setFocusedField("lastNameP")}
                          onBlur={() => setFocusedField(null)}
                          theme={theme}
                          error={signupStep0Errors.lastNameP}
                        />
                        <InputField
                          label={auth.signup.lastNameM}
                          name="lastNameM"
                          placeholder={auth.signup.lastNameMPlaceholder}
                          value={signupData.lastNameM}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              lastNameM: e.target.value,
                            })
                          }
                          icon={<User size={18} />}
                          focusedField={focusedField}
                          onFocus={() => setFocusedField("lastNameM")}
                          onBlur={() => setFocusedField(null)}
                          theme={theme}
                          badge={auth.signup.optional}
                        />
                      </>
                    ) : (
                      <>
                        <InputField
                          label={auth.signup.email}
                          type="email"
                          name="email-signup"
                          placeholder={auth.signup.emailPlaceholder}
                          value={signupData.email}
                          onChange={(e) => {
                            setSignupData({
                              ...signupData,
                              email: e.target.value,
                            });
                            setSignupStep1Errors((p) => ({
                              ...p,
                              email: undefined,
                            }));
                          }}
                          icon={<Mail size={18} />}
                          focusedField={focusedField}
                          onFocus={() => setFocusedField("email-signup")}
                          onBlur={() => setFocusedField(null)}
                          theme={theme}
                          error={signupStep1Errors.email}
                        />
                        <InputField
                          label={auth.signup.password}
                          type={showPassword ? "text" : "password"}
                          name="password-signup"
                          placeholder={auth.signup.passwordPlaceholder}
                          value={signupData.password}
                          onChange={(e) => {
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            });
                            setSignupStep1Errors((p) => ({
                              ...p,
                              password: undefined,
                            }));
                          }}
                          icon={<Lock size={18} />}
                          focusedField={focusedField}
                          onFocus={() => setFocusedField("password-signup")}
                          onBlur={() => setFocusedField(null)}
                          theme={theme}
                          error={signupStep1Errors.password}
                          suffix={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          }
                        />
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    {signupStep > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          animateStep("back", () => setSignupStep((s) => s - 1))
                        }
                        disabled={isLoading}
                        className={`p-4 rounded-2xl border bg-transparent cursor-pointer flex items-center justify-center shrink-0 transition-all duration-200 hover:border-[#2EBCCC] hover:text-[#2EBCCC] disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "border-[#273570] text-slate-400" : "border-[#E5E7EB] text-slate-400"}`}
                      >
                        <ArrowLeft size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isLoading}
                      className={primaryBtnBase}
                    >
                      {isLoading ? (
                        <>
                          <Spinner />
                          <span className="animate-pulse">
                            {auth.signup.submitting}
                          </span>
                        </>
                      ) : signupStep < auth.signup.steps.length - 1 ? (
                        <>
                          <span>{auth.signup.continue}</span>
                          <ArrowRight size={18} />
                        </>
                      ) : (
                        <>
                          <span>{auth.signup.submit}</span>
                          <CheckCircle size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="my-6 flex items-center gap-3">
                <div
                  className={`flex-1 h-px ${isDark ? "bg-[#273570]" : "bg-[#CCCCCC]"}`}
                />
                <span
                  className={`text-xs font-medium whitespace-nowrap ${isDark ? "text-slate-400" : "text-[#989898]"}`}
                >
                  {isLogin
                    ? auth.login.orContinueWith
                    : auth.signup.orContinueWith}
                </span>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-[#273570]" : "bg-[#CCCCCC]"}`}
                />
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border font-bold text-[0.9rem] cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${isDark ? "bg-white/4 border-[#273570] text-white hover:bg-white/8" : "bg-white border-[#E5E7EB] text-black hover:bg-slate-50 shadow-sm"}`}
              >
                <GoogleIcon />{" "}
                {isLogin ? auth.login.google : auth.signup.google}
              </button>

              <div className="mt-7 text-center">
                <p
                  className={`text-sm font-medium m-0 ${isDark ? "text-slate-400" : "text-[#989898]"}`}
                >
                  {isLogin ? auth.login.noAccount : auth.signup.hasAccount}
                  <button
                    onClick={() => switchMode(isLogin ? "signup" : "login")}
                    className="bg-transparent border-none cursor-pointer text-[#2EBCCC] hover:text-[#239aaa] font-extrabold text-sm ml-1.5 p-0 underline decoration-dotted underline-offset-[3px] transition-colors"
                  >
                    {isLogin
                      ? auth.login.switchToSignup
                      : auth.signup.switchToLogin}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthScreen;
