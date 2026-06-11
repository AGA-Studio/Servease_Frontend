import { useState, useEffect, useCallback } from "react";
import {
  User,
  Palette,
  Shield,
  FileText,
  Sun,
  Moon,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  BadgeCheck,
  Smartphone,
  Trash2,
  Fingerprint,
  Globe,
  Paintbrush,
  ArrowRight,
  UserCircle,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../router/routes";

type Tab = "account" | "appearance" | "privacy" | "legal";

const useTheme = () => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark"),
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);
  return isDark;
};

const SettingsScreen: React.FC = () => {
  const { t, locale, toggleLocale } = useI18n();
  const s = t("settings");
  const isDark = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const currentTheme = document.documentElement.getAttribute("data-theme") as
    | "light"
    | "dark";

  const toggleTheme = () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("servease-theme", next);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  const textPrimary = isDark ? "#FFFFFF" : "#1B244C";
  const textSecondary = "#989898";
  const cardBg = isDark
    ? "rgba(15, 26, 62, 0.7)"
    : "rgba(255, 255, 255, 0.7)";
  const glassBorder = isDark
    ? "rgba(46, 188, 204, 0.12)"
    : "rgba(27, 36, 76, 0.08)";
  const inputBg = isDark
    ? "rgba(39, 53, 112, 0.6)"
    : "rgba(248, 250, 252, 0.8)";

  const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

  const press = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.dataset.origTransform = el.style.transform || "none";
    el.style.transform = `${el.dataset.origTransform} scale(0.97)`;
  }, []);

  const release = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = e.currentTarget.dataset.origTransform || "none";
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: s.tabs.account, icon: <User size={16} /> },
    { key: "appearance", label: s.tabs.appearance, icon: <Palette size={16} /> },
    { key: "privacy", label: s.tabs.privacy, icon: <Shield size={16} /> },
    { key: "legal", label: s.tabs.legal, icon: <FileText size={16} /> },
  ];

  const glassCard: React.CSSProperties = {
    background: cardBg,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${glassBorder}`,
    borderRadius: "20px",
  };

  const btnTransition = `transform 160ms ${easeOut}, background 200ms ${easeOut}, box-shadow 200ms ${easeOut}, color 200ms ${easeOut}`;

  const inputTransition = `border-color 200ms ${easeOut}, box-shadow 200ms ${easeOut}`;

  return (
    <div
      className="min-h-screen"
      style={{
        background: isDark
          ? "linear-gradient(160deg, #0a0f2a 0%, #1B244C 50%, #0f1a3e 100%)"
          : "linear-gradient(160deg, #f0f4f8 0%, #F6F8F8 50%, #eef2f6 100%)",
      }}
    >
      {/* --- TOP GLASS HEADER --- */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: isDark
            ? "rgba(10, 15, 42, 0.88)"
            : "rgba(246, 248, 248, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${glassBorder}`,
        }}
      >
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-5">
          {/* Title row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#2EBCCC" }}
                />
                <span
                  className="text-[0.68rem] font-extrabold tracking-widest uppercase"
                  style={{ color: "#2EBCCC" }}
                >
                  {s.badge}
                </span>
              </div>
              <h1
                className="text-[1.875rem] font-extrabold tracking-tight leading-tight"
                style={{ color: textPrimary }}
              >
                {s.title}
              </h1>
              <p
                className="text-sm mt-1 font-medium"
                style={{ color: textSecondary }}
              >
                {user?.firstName
                  ? `${user.firstName}${user.lastnameP ? ` ${user.lastnameP}` : ""} · ${user?.email ?? ""}`
                  : s.subtitle}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 mt-0.5"
              style={{
                background: "linear-gradient(135deg, #2EBCCC, #1B244C)",
                boxShadow: "0 4px 20px rgba(46,188,204,0.25)",
              }}
            >
              {user?.firstName?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>

          {/* Segment control */}
          <div
            className="flex p-1 rounded-2xl"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(27,36,76,0.04)",
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  onMouseDown={press}
                  onMouseUp={release}
                  onMouseLeave={release}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold border-none cursor-pointer"
                  style={{
                    background: isActive ? "#2EBCCC" : "transparent",
                    color: isActive ? "#FFFFFF" : textSecondary,
                    boxShadow: isActive
                      ? "0 4px 12px rgba(46,188,204,0.3)"
                      : "none",
                    transform: isActive ? "scale(1)" : "scale(0.98)",
                    transition: btnTransition,
                  }}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-3xl mx-auto px-5 pt-8 pb-20">
        <div
          key={activeTab}
          style={{
            animation: `fadeUp 250ms ${easeOut}`,
          }}
        >
          {/* ========== ACCOUNT ========== */}
          {activeTab === "account" && (
            <div className="flex flex-col gap-6">
              {/* Profile hero */}
              <div
                style={{
                  ...glassCard,
                  background: isDark
                    ? "linear-gradient(135deg, rgba(46,188,204,0.15), rgba(27,36,76,0.3))"
                    : "linear-gradient(135deg, rgba(46,188,204,0.08), rgba(27,36,76,0.04))",
                  borderRadius: "20px",
                }}
              >
                <div className="px-6 py-6 flex items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #2EBCCC, #1B244C)",
                      boxShadow: "0 8px 24px rgba(46,188,204,0.25)",
                    }}
                  >
                    {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-lg font-bold truncate"
                      style={{ color: textPrimary }}
                    >
                      {user?.firstName
                        ? `${user.firstName} ${user.lastnameP ?? ""}`
                        : "User"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-1">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shrink-0"
                        style={{
                          background:
                            user?.role === "provider"
                              ? "rgba(46,188,204,0.12)"
                              : "rgba(255,178,0,0.12)",
                          color:
                            user?.role === "provider" ? "#2EBCCC" : "#FFB200",
                        }}
                      >
                        <BadgeCheck size={12} />
                        {user?.role === "provider"
                          ? s.account.roleProvider
                          : s.account.roleClient}
                      </span>
                      <span
                        className="text-[11px] font-medium min-w-0 break-all"
                        style={{ color: textSecondary }}
                      >
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account info card */}
              <div style={glassCard}>
                <div className="px-6 py-5 border-b" style={{ borderColor: glassBorder }}>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5"
                    style={{ color: textSecondary }}
                  >
                    <Mail size={13} className="inline mr-1.5 -mt-0.5" />
                    {s.account.email}
                  </p>
                  <div className="relative group">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={s.account.emailPlaceholder}
                      className="w-full px-4 py-4 rounded-2xl text-sm font-medium outline-none border"
                      style={{
                        background: inputBg,
                        borderColor: glassBorder,
                        color: textPrimary,
                        transition: inputTransition,
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#2EBCCC")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = glassBorder)
                      }
                    />
                  </div>
                </div>

                <div className="px-6 py-5">
                  <button
                    onClick={() => setChangingPassword(!changingPassword)}
                    onMouseDown={press}
                    onMouseUp={release}
                    onMouseLeave={release}
                    className="flex items-center justify-between w-full text-left border-none bg-transparent cursor-pointer"
                    style={{
                      transition: btnTransition,
                    }}
                  >
                    <div>
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5"
                        style={{ color: textSecondary }}
                      >
                        <Lock size={13} className="inline mr-1.5 -mt-0.5" />
                        {s.account.password}
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: textPrimary }}
                      >
                        ••••••••
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                      style={{
                        background: "rgba(46,188,204,0.08)",
                        color: "#2EBCCC",
                        transition: btnTransition,
                      }}
                    >
                      {changingPassword ? "Cancel" : s.account.changePassword}
                      <ChevronRight
                        size={14}
                        style={{
                          transform: changingPassword
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: `transform 300ms ${easeOut}`,
                        }}
                      />
                    </div>
                  </button>

                  {changingPassword && (
                    <div
                      className="mt-5 space-y-4 overflow-hidden"
                      style={{
                        animation: `fadeUp 250ms ${easeOut}`,
                      }}
                    >
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder={s.account.currentPassword}
                          className="w-full px-4 py-4 rounded-2xl text-sm font-medium outline-none border pr-12"
                          style={{
                            background: inputBg,
                            borderColor: glassBorder,
                            color: textPrimary,
                            transition: inputTransition,
                          }}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#2EBCCC")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = glassBorder)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-0 flex items-center"
                          style={{ color: textSecondary }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={s.account.newPassword}
                        className="w-full px-4 py-4 rounded-2xl text-sm font-medium outline-none border"
                        style={{
                          background: inputBg,
                          borderColor: glassBorder,
                          color: textPrimary,
                          transition: inputTransition,
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "#2EBCCC")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = glassBorder)
                        }
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={s.account.confirmPassword}
                        className="w-full px-4 py-4 rounded-2xl text-sm font-medium outline-none border"
                        style={{
                          background: inputBg,
                          borderColor: glassBorder,
                          color: textPrimary,
                          transition: inputTransition,
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "#2EBCCC")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = glassBorder)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Role card */}
              <div style={glassCard}>
                <div className="px-6 py-5">
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
                    style={{ color: textSecondary }}
                  >
                    <UserCircle size={13} className="inline mr-1.5 -mt-0.5" />
                    {s.account.role}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: textPrimary }}
                      >
                        {user?.role === "provider"
                          ? s.account.roleProvider
                          : s.account.roleClient}
                      </p>
                      {user?.role !== "provider" && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: textSecondary }}
                        >
                          {s.account.roleChangeHint}
                        </p>
                      )}
                    </div>
                    {user?.role !== "provider" && (
                      <span
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 ml-4"
                        style={{
                          background: "rgba(255,178,0,0.1)",
                          color: "#FFB200",
                          border: "1px solid rgba(255,178,0,0.15)",
                        }}
                      >
                        {s.account.roleChangeComing}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                onMouseDown={press}
                onMouseUp={release}
                onMouseLeave={release}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  background: saved
                    ? "linear-gradient(135deg, #4AA825, #3D8C1E)"
                    : "linear-gradient(135deg, #2EBCCC, #2399A8)",
                  boxShadow: saved
                    ? "0 8px 32px rgba(74,168,37,0.3)"
                    : "0 8px 32px rgba(46,188,204,0.25)",
                  opacity: saving ? 0.7 : 1,
                  transition: `transform 160ms ${easeOut}, opacity 200ms ${easeOut}, box-shadow 200ms ${easeOut}`,
                }}
              >
                {saved ? (
                  <>
                    <Check size={18} />
                    {s.toast.saved}
                  </>
                ) : saving ? (
                  <span style={{ opacity: 0.6 }}>{s.account.saving}</span>
                ) : (
                  <>
                    {s.account.save}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========== APPEARANCE ========== */}
          {activeTab === "appearance" && (
            <div className="flex flex-col gap-6">
              <div style={glassCard}>
                <div className="px-6 py-5 border-b" style={{ borderColor: glassBorder }}>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
                    style={{ color: textSecondary }}
                  >
                    <Paintbrush size={13} className="inline mr-1.5 -mt-0.5" />
                    {s.appearance.theme}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["light", "dark"] as const).map((mode) => {
                      const isSelected = currentTheme === mode;
                      return (
                        <button
                          key={mode}
                          onClick={toggleTheme}
                          onMouseDown={press}
                          onMouseUp={release}
                          onMouseLeave={release}
                          className="flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-bold border cursor-pointer"
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, #2EBCCC, #2399A8)"
                              : inputBg,
                            borderColor: isSelected ? "#2EBCCC" : glassBorder,
                            color: isSelected ? "#FFFFFF" : textSecondary,
                            boxShadow: isSelected
                              ? "0 4px 16px rgba(46,188,204,0.25)"
                              : "none",
                            transform: isSelected ? "scale(1)" : "scale(0.98)",
                            transition: btnTransition,
                          }}
                        >
                          {mode === "light" ? (
                            <Sun size={18} />
                          ) : (
                            <Moon size={18} />
                          )}
                          {mode === "light"
                            ? s.appearance.themeLight
                            : s.appearance.themeDark}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
                    style={{ color: textSecondary }}
                  >
                    <Globe size={13} className="inline mr-1.5 -mt-0.5" />
                    {s.appearance.language}
                  </p>
                  <div className="flex flex-col gap-2">
                    {(["es", "en"] as const).map((lang) => {
                      const isSelected = locale === lang;
                      return (
                        <button
                          key={lang}
                          onClick={() => {
                            if (locale !== lang) toggleLocale();
                          }}
                          onMouseDown={press}
                          onMouseUp={release}
                          onMouseLeave={release}
                          className="flex items-center justify-between w-full px-5 py-4 rounded-2xl text-sm font-bold border cursor-pointer"
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, #2EBCCC, #2399A8)"
                              : inputBg,
                            borderColor: isSelected ? "#2EBCCC" : glassBorder,
                            color: isSelected ? "#FFFFFF" : textPrimary,
                            boxShadow: isSelected
                              ? "0 4px 16px rgba(46,188,204,0.25)"
                              : "none",
                            transition: btnTransition,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                              style={{
                                background: isSelected
                                  ? "rgba(255,255,255,0.2)"
                                  : isDark
                                    ? "rgba(255,255,255,0.06)"
                                    : "rgba(27,36,76,0.06)",
                                color: isSelected
                                  ? "#FFFFFF"
                                  : textSecondary,
                              }}
                            >
                              {lang === "es" ? "ES" : "EN"}
                            </div>
                            <span>
                              {lang === "es"
                                ? s.appearance.languageEs
                                : s.appearance.languageEn}
                            </span>
                          </div>
                          {isSelected && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{
                                background: "rgba(255,255,255,0.25)",
                              }}
                            >
                              <Check size={14} color="#FFFFFF" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== PRIVACY ========== */}
          {activeTab === "privacy" && (
            <div className="flex flex-col gap-6">
              <div style={glassCard}>
                <div
                  className="px-4 py-4 sm:px-6 sm:py-5 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: glassBorder }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(255,178,0,0.1)",
                      }}
                    >
                      <Fingerprint size={18} style={{ color: "#FFB200" }} />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: textPrimary }}
                      >
                        {s.privacy.twoFactor}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: textSecondary }}
                      >
                        {s.privacy.twoFactorDesc}
                      </p>
                    </div>
                  </div>
                  <span
                    className="self-end sm:self-auto px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 sm:ml-4"
                    style={{
                      background: "rgba(255,178,0,0.1)",
                      color: "#FFB200",
                    }}
                  >
                    {s.privacy.twoFactorComing}
                  </span>
                </div>

                <div
                  className="px-4 py-4 sm:px-6 sm:py-5 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: glassBorder }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(46,188,204,0.1)",
                      }}
                    >
                      <Smartphone size={18} style={{ color: "#2EBCCC" }} />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: textPrimary }}
                      >
                        {s.privacy.sessions}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: textSecondary }}
                      >
                        {s.privacy.sessionsDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    onMouseDown={press}
                    onMouseUp={release}
                    onMouseLeave={release}
                    className="self-end sm:self-auto px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer shrink-0 sm:ml-4"
                    style={{
                      borderColor: glassBorder,
                      color: textPrimary,
                      background: inputBg,
                      transition: btnTransition,
                    }}
                  >
                    {s.privacy.sessionsBtn}
                  </button>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(255,0,0,0.08)",
                      }}
                    >
                      <Trash2 size={18} color="#FF0000" />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#FF0000" }}
                      >
                        {s.privacy.deleteAccount}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: textSecondary }}
                      >
                        {s.privacy.deleteAccountDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    onMouseDown={press}
                    onMouseUp={release}
                    onMouseLeave={release}
                    className="self-end sm:self-auto px-4 py-2 rounded-xl text-xs font-bold shrink-0 sm:ml-4 cursor-pointer"
                    style={{
                      background: "rgba(255,0,0,0.08)",
                      color: "#FF0000",
                      border: "1px solid rgba(255,0,0,0.15)",
                      transition: btnTransition,
                    }}
                  >
                    {s.privacy.deleteAccountBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========== LEGAL ========== */}
          {activeTab === "legal" && (
            <div className="flex flex-col gap-6">
              <div style={glassCard}>
                <button
                  onClick={() => navigate(ROUTES.TERMS)}
                  onMouseDown={press}
                  onMouseUp={release}
                  onMouseLeave={release}
                  className="w-full px-6 py-5 flex items-center justify-between cursor-pointer"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${glassBorder}`,
                    transition: btnTransition,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(46,188,204,0.1)",
                      }}
                    >
                      <FileText size={18} style={{ color: "#2EBCCC" }} />
                    </div>
                    <div className="text-left">
                      <p
                        className="text-sm font-bold"
                        style={{ color: textPrimary }}
                      >
                        {s.legal.terms}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: textSecondary }}
                      >
                        {s.legal.termsDesc}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl"
                    style={{
                      background: "rgba(46,188,204,0)",
                      transition: btnTransition,
                    }}
                  >
                    <ChevronRight
                      size={18}
                      style={{ color: textSecondary }}
                    />
                  </div>
                </button>

                <button
                  onClick={() => navigate(ROUTES.PRIVACY)}
                  onMouseDown={press}
                  onMouseUp={release}
                  onMouseLeave={release}
                  className="w-full px-6 py-5 flex items-center justify-between cursor-pointer"
                  style={{
                    background: "transparent",
                    border: "none",
                    transition: btnTransition,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(46,188,204,0.1)",
                      }}
                    >
                      <Shield size={18} style={{ color: "#2EBCCC" }} />
                    </div>
                    <div className="text-left">
                      <p
                        className="text-sm font-bold"
                        style={{ color: textPrimary }}
                      >
                        {s.legal.privacy}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: textSecondary }}
                      >
                        {s.legal.privacyDesc}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl"
                    style={{
                      background: "rgba(46,188,204,0)",
                      transition: btnTransition,
                    }}
                  >
                    <ChevronRight
                      size={18}
                      style={{ color: textSecondary }}
                    />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* keyframes injection */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsScreen;
