import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../router/routes";
import { useI18n } from "../../i18n";

const PrivacyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const legal = t("common").legal;

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

  return (
    <div className={`min-h-screen p-6 md:p-12 transition-colors duration-400 ${isDark ? "bg-[#1B244C] text-white" : "bg-[#F6F8F8] text-[#1B244C]"}`}>
      <div className="max-w-3xl mx-auto animate-fade-up">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#2EBCCC] font-bold mb-8 bg-transparent border-none cursor-pointer p-0 hover:text-[#239aaa] transition-colors"
        >
          <ArrowLeft size={18} />
          {legal.back}
        </button>
        
        <div className={`p-8 md:p-12 rounded-[2rem] border shadow-sm transition-colors duration-400 ${isDark ? "bg-[#273570] border-[#3b4b8a]" : "bg-white border-[#E5E7EB]"}`}>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
            {legal.privacy.title}
          </h1>
          <p className={`mb-8 font-medium ${isDark ? "text-slate-400" : "text-[#989898]"}`}>
            {legal.lastUpdated}
          </p>
          
          <div className={`space-y-6 leading-7 text-[0.95rem] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {legal.privacy.content.map((paragraph, idx) => (
              <p key={idx} className={idx === legal.privacy.content.length - 1 ? "italic opacity-70" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;