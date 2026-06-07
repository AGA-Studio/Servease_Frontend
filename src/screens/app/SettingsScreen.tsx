// Settings screen with tabs for account, appearance, privacy, and legal. Supports dark mode and bilingual content.

import { useState, useEffect } from "react";
import {
  User,
  Palette,
  Shield,
  FileText,
  Sun,
  Moon,
  Check,
  ExternalLink,
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

  const card = isDark ? "#0f1a3e" : "#FFFFFF";
  const border = isDark ? "#273570" : "#E5E7EB";
  const textPrimary = isDark ? "#FFFFFF" : "#1B244C";
  const textSecondary = "#989898";
  const inputBg = isDark ? "#273570" : "#F8FAFC";
  const mainBg = isDark ? "#1B244C" : "#F6F8F8";

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: s.tabs.account, icon: <User size={16} /> },
    {
      key: "appearance",
      label: s.tabs.appearance,
      icon: <Palette size={16} />,
    },
    { key: "privacy", label: s.tabs.privacy, icon: <Shield size={16} /> },
    { key: "legal", label: s.tabs.legal, icon: <FileText size={16} /> },
  ];

  const inputClass =
    "w-full px-4 py-3 rounded-[10px] text-sm outline-none transition-all duration-200 border";

  const SectionCard: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{ background: card, border: `1px solid ${border}` }}
    >
      {children}
    </div>
  );

  const Row: React.FC<{ children: React.ReactNode; last?: boolean }> = ({
    children,
    last,
  }) => (
    <div
      className="px-6 py-5"
      style={{ borderBottom: last ? "none" : `1px solid ${border}` }}
    >
      {children}
    </div>
  );

  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p
      className="text-xs font-semibold mb-2 uppercase tracking-wider"
      style={{ color: textSecondary }}
    >
      {children}
    </p>
  );

  const renderAccount = () => (
    <div className="page-enter flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>
          {s.account.title}
        </h2>
        <p className="text-sm" style={{ color: textSecondary }}>
          {s.account.subtitle}
        </p>
      </div>

      <SectionCard>
        <Row>
          <Label>{s.account.email}</Label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={s.account.emailPlaceholder}
            className={inputClass}
            style={{
              background: inputBg,
              borderColor: border,
              color: textPrimary,
            }}
          />
        </Row>
        <Row>
          <Label>{s.account.currentPassword}</Label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={s.account.passwordPlaceholder}
            className={inputClass}
            style={{
              background: inputBg,
              borderColor: border,
              color: textPrimary,
            }}
          />
        </Row>
        <Row>
          <Label>{s.account.newPassword}</Label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={s.account.passwordPlaceholder}
            className={inputClass}
            style={{
              background: inputBg,
              borderColor: border,
              color: textPrimary,
            }}
          />
        </Row>
        <Row last>
          <Label>{s.account.confirmPassword}</Label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={s.account.passwordPlaceholder}
            className={inputClass}
            style={{
              background: inputBg,
              borderColor: border,
              color: textPrimary,
            }}
          />
        </Row>
      </SectionCard>

      <SectionCard>
        <Row last>
          <Label>{s.account.role}</Label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #2EBCCC, #1B244C)",
                }}
              >
                {user?.firstName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: textPrimary }}
                >
                  {user?.role === "provider"
                    ? s.account.roleProvider
                    : s.account.roleClient}
                </p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  {user?.email}
                </p>
              </div>
            </div>
            {user?.role !== "provider" && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] cursor-not-allowed"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(27,36,76,0.04)",
                  border: `1px solid ${border}`,
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: textSecondary }}
                >
                  {s.account.roleChangeComing}
                </span>
              </div>
            )}
          </div>
          {user?.role !== "provider" && (
            <p
              className="text-xs mt-3 leading-relaxed"
              style={{ color: textSecondary }}
            >
              {s.account.roleChangeHint}
            </p>
          )}
        </Row>
      </SectionCard>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] text-sm font-bold text-white transition-all duration-200 self-start"
        style={{ background: saved ? "#4AA825" : "#2EBCCC", minWidth: 160 }}
      >
        {saved ? (
          <>
            <Check size={16} />
            {s.toast.saved}
          </>
        ) : saving ? (
          s.account.saving
        ) : (
          s.account.save
        )}
      </button>
    </div>
  );

  const renderAppearance = () => (
    <div className="page-enter flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>
          {s.appearance.title}
        </h2>
        <p className="text-sm" style={{ color: textSecondary }}>
          {s.appearance.subtitle}
        </p>
      </div>

      <SectionCard>
        <Row>
          <Label>{s.appearance.theme}</Label>
          <div className="flex gap-3">
            {(["light", "dark"] as const).map((mode) => {
              const isSelected = currentTheme === mode;
              return (
                <button
                  key={mode}
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-semibold transition-all duration-200 border"
                  style={{
                    background: isSelected ? "#2EBCCC" : inputBg,
                    borderColor: isSelected ? "#2EBCCC" : border,
                    color: isSelected ? "#FFFFFF" : textSecondary,
                  }}
                >
                  {mode === "light" ? <Sun size={15} /> : <Moon size={15} />}
                  {mode === "light"
                    ? s.appearance.themeLight
                    : s.appearance.themeDark}
                </button>
              );
            })}
          </div>
        </Row>
        <Row last>
          <Label>{s.appearance.language}</Label>
          <div className="flex gap-3">
            {(["es", "en"] as const).map((lang) => {
              const isSelected = locale === lang;
              return (
                <button
                  key={lang}
                  onClick={() => {
                    if (locale !== lang) toggleLocale();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-semibold transition-all duration-200 border"
                  style={{
                    background: isSelected ? "#2EBCCC" : inputBg,
                    borderColor: isSelected ? "#2EBCCC" : border,
                    color: isSelected ? "#FFFFFF" : textSecondary,
                  }}
                >
                  {lang === "es"
                    ? s.appearance.languageEs
                    : s.appearance.languageEn}
                </button>
              );
            })}
          </div>
        </Row>
      </SectionCard>
    </div>
  );

  const renderPrivacy = () => (
    <div className="page-enter flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>
          {s.privacy.title}
        </h2>
        <p className="text-sm" style={{ color: textSecondary }}>
          {s.privacy.subtitle}
        </p>
      </div>

      <SectionCard>
        <Row>
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: textPrimary }}
              >
                {s.privacy.twoFactor}
              </p>
              <p className="text-xs" style={{ color: textSecondary }}>
                {s.privacy.twoFactorDesc}
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(255,178,0,0.12)", color: "#FFB200" }}
            >
              {s.privacy.twoFactorComing}
            </span>
          </div>
        </Row>
        <Row last>
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: textPrimary }}
              >
                {s.privacy.sessions}
              </p>
              <p className="text-xs" style={{ color: textSecondary }}>
                {s.privacy.sessionsDesc}
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-[10px] text-xs font-bold transition-all duration-200 border"
              style={{
                borderColor: border,
                color: textPrimary,
                background: inputBg,
              }}
            >
              {s.privacy.sessionsBtn}
            </button>
          </div>
        </Row>
      </SectionCard>

      <SectionCard>
        <Row last>
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#FF0000" }}
              >
                {s.privacy.deleteAccount}
              </p>
              <p className="text-xs" style={{ color: textSecondary }}>
                {s.privacy.deleteAccountDesc}
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-[10px] text-xs font-bold transition-all duration-200"
              style={{
                background: "rgba(255,0,0,0.08)",
                color: "#FF0000",
                border: "1px solid rgba(255,0,0,0.2)",
              }}
            >
              {s.privacy.deleteAccountBtn}
            </button>
          </div>
        </Row>
      </SectionCard>
    </div>
  );

  const renderLegal = () => (
    <div className="page-enter flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>
          {s.legal.title}
        </h2>
        <p className="text-sm" style={{ color: textSecondary }}>
          {s.legal.subtitle}
        </p>
      </div>

      <SectionCard>
        <Row>
          <button
            onClick={() => navigate(ROUTES.TERMS)}
            className="w-full flex items-center justify-between group"
          >
            <div className="text-left">
              <p
                className="text-sm font-semibold mb-1 transition-colors duration-200 group-hover:text-[#2EBCCC]"
                style={{ color: textPrimary }}
              >
                {s.legal.terms}
              </p>
              <p className="text-xs" style={{ color: textSecondary }}>
                {s.legal.termsDesc}
              </p>
            </div>
            <ExternalLink
              size={15}
              style={{ color: textSecondary }}
              className="shrink-0 ml-4 transition-colors duration-200 group-hover:text-[#2EBCCC]"
            />
          </button>
        </Row>
        <Row last>
          <button
            onClick={() => navigate(ROUTES.PRIVACY)}
            className="w-full flex items-center justify-between group"
          >
            <div className="text-left">
              <p
                className="text-sm font-semibold mb-1 transition-colors duration-200 group-hover:text-[#2EBCCC]"
                style={{ color: textPrimary }}
              >
                {s.legal.privacy}
              </p>
              <p className="text-xs" style={{ color: textSecondary }}>
                {s.legal.privacyDesc}
              </p>
            </div>
            <ExternalLink
              size={15}
              style={{ color: textSecondary }}
              className="shrink-0 ml-4 transition-colors duration-200 group-hover:text-[#2EBCCC]"
            />
          </button>
        </Row>
      </SectionCard>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return renderAccount();
      case "appearance":
        return renderAppearance();
      case "privacy":
        return renderPrivacy();
      case "legal":
        return renderLegal();
    }
  };

  return (
    <div
      className="page-enter flex h-full min-h-screen"
      style={{ background: mainBg }}
    >
      <div
        className="w-[220px] shrink-0 flex flex-col py-8 px-4 gap-1 border-r relative"
        style={{ borderColor: border, background: card }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest px-3 mb-3"
          style={{ color: textSecondary }}
        >
          {s.title}
        </p>
        <div className="relative">
          {(() => {
            const activeIdx = tabs.findIndex((t) => t.key === activeTab);
            return (
              <>
                {activeIdx >= 0 && (
                  <div
                    className="absolute left-0 right-0 rounded-[10px] pointer-events-none z-0"
                    style={{
                      height: 40,
                      background: "#2EBCCC",
                      top: `${activeIdx * 42}px`,
                      transition: "top 0.35s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                )}
                <div className="relative z-10 flex flex-col gap-[2px]">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-sm font-semibold text-left transition-colors duration-200 border-none h-[40px]"
                        style={{
                          background: "transparent",
                          color: isActive ? "#FFFFFF" : textSecondary,
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-8">
        <div className="max-w-[560px]" key={activeTab}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
