import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../router/routes";
import { useI18n } from "../../i18n";

const TermsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const legal = t("common").legal;
  const data = legal.terms;

  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/" : ROUTES.AUTH);
    }
  };

  const bg = isDark ? "#1B244C" : "#F6F8F8";
  const cardBg = isDark ? "#273570" : "#FFFFFF";
  const cardBorder = isDark ? "#3b4b8a" : "#E5E7EB";
  const textColor = isDark ? "#FFFFFF" : "#1B244C";
  const muted = isDark ? "#94a3b8" : "#64748b";
  const headingBorder = isDark ? "rgba(46,188,204,0.2)" : "rgba(46,188,204,0.15)";

  const cl = legal.contactLabels;

  const renderContent = (items: any[]) => {
    return items.map((item, idx) => {
      if (typeof item === "string") {
        return (
          <p key={idx} className="mb-3 last:mb-0">
            {item}
          </p>
        );
      }
      if (Array.isArray(item)) {
        return (
          <ul key={idx} className="list-disc pl-6 mb-3 space-y-1">
            {item.map((li: string, i: number) => (
              <li key={i}>{li}</li>
            ))}
          </ul>
        );
      }
      if (item.sh) {
        return (
          <h4 key={idx} className="font-bold mt-4 mb-2" style={{ color: textColor }}>
            {item.sh}
          </h4>
        );
      }
      if (item.b !== undefined && item.v) {
        return (
          <p key={idx} className={`mb-3 last:mb-0 ${item.b ? "font-semibold" : ""}`} style={{ color: item.b ? textColor : muted }}>
            {item.v}
          </p>
        );
      }
      if (item.i && item.v) {
        return (
          <p key={idx} className="mb-3 last:mb-0 italic" style={{ color: muted }}>
            {item.v}
          </p>
        );
      }
      if (item.contact) {
        return (
          <div key={idx} className="mb-3">
            <p>{cl.email} <a href={`mailto:${item.email}`} className="font-semibold" style={{ color: "#2EBCCC" }}>{item.email}</a></p>
            <p>{cl.institution} {item.institution}</p>
            <p>{cl.city} {item.city}</p>
          </div>
        );
      }
      if (item.emailText && item.v) {
        const parts = item.v.split("{email}");
        return (
          <p key={idx} className="mb-3 last:mb-0">
            {parts[0]}
            <a href={`mailto:${item.emailText}`} className="font-semibold" style={{ color: "#2EBCCC" }}>
              {item.emailText}
            </a>
            {parts[1]}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: bg, color: textColor }}>
      <div className="max-w-3xl mx-auto" style={{ animation: "fadeUp 0.4s cubic-bezier(0.23,1,0.32,1)" }}>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 font-bold mb-8 bg-transparent border-none cursor-pointer p-0"
          style={{ color: "#2EBCCC", transition: "color 200ms cubic-bezier(0.23,1,0.32,1)" }}
        >
          <ArrowLeft size={18} />
          {legal.back}
        </button>

        <div className="p-8 md:p-12 rounded-[2rem] shadow-sm" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="text-center mb-10 pb-8" style={{ borderBottom: `1px solid ${headingBorder}` }}>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">SERVEASE</h1>
            <p className="text-sm font-semibold" style={{ color: "#2EBCCC" }}>{data.subtitle}</p>
            <p className="text-xs italic mt-1" style={{ color: muted }}>{data.tagline}</p>
          </div>

          <h2 className="text-xl font-extrabold mb-2 text-center">{data.title}</h2>
          <p className="text-xs text-center mb-10" style={{ color: muted }}>{data.version}</p>

          <div className="space-y-8 leading-7 text-[0.95rem]" style={{ color: muted }}>
            {data.sections.map((section: any, idx: number) => (
              <section key={idx}>
                <h3 className="text-base font-extrabold mb-3" style={{ color: textColor }}>
                  {section.h}
                </h3>
                {renderContent(section.c)}
              </section>
            ))}
          </div>

          <p className="text-center text-xs font-semibold mt-10 pt-6" style={{ color: muted, borderTop: `1px solid ${headingBorder}` }}>
            {data.footer}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TermsScreen;
