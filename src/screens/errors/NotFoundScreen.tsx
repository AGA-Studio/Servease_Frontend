import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowLeft, Home, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../router/routes";
import { useI18n } from "../../i18n";
import ServiceModel3D from "./components/ServiceModel3D";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const NotFoundScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useI18n();
  const copy = t("notfoundscreen");
  const shouldReduceMotion = useReducedMotion();

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

  const defaultRoute = isAuthenticated
    ? user?.role === "admin"
      ? ROUTES.ADMIN.DASHBOARD
      : user?.role === "provider"
        ? ROUTES.APP.DASHBOARD
        : ROUTES.APP.HOME
    : ROUTES.AUTH;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(defaultRoute);
    }
  };

  const bgGradient = isDark
    ? "radial-gradient(circle at 18% 15%, rgba(46,188,204,0.16), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,178,0,0.10), transparent 50%), #131A38"
    : "radial-gradient(circle at 18% 15%, rgba(46,188,204,0.14), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,178,0,0.10), transparent 50%), #F6F8F8";
  const textColor = isDark ? "#FFFFFF" : "#1B244C";
  const mutedColor = isDark ? "#94a3b8" : "#5b6478";
  const eyebrowBg = isDark ? "rgba(46,188,204,0.14)" : "rgba(46,188,204,0.12)";
  const eyebrowBorder = isDark ? "rgba(46,188,204,0.35)" : "rgba(46,188,204,0.3)";

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.09, delayChildren: 0.05 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: EASE_OUT },
    },
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: bgGradient,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!shouldReduceMotion && (
        <>
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: "-8%",
              right: "-6%",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(46,188,204,0.22), transparent 70%)",
              filter: "blur(10px)",
              animation: "servease-float-a 9s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "-8%",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,178,0,0.14), transparent 70%)",
              filter: "blur(10px)",
              animation: "servease-float-b 11s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        </>
      )}
      <style>{`
        @keyframes servease-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-24px, 28px) scale(1.06); }
        }
        @keyframes servease-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(26px, -20px) scale(1.05); }
        }
      `}</style>

      <div className="notfound-layout" style={{ position: "relative", zIndex: 1 }}>
        <div className="notfound-canvas-wrap">
          <span
            aria-hidden
            className="notfound-404-text"
            style={{
              color: isDark ? "rgba(255,255,255,0.06)" : "rgba(27,36,76,0.07)",
              WebkitTextStroke: isDark ? "1.5px rgba(46,188,204,0.18)" : "1.5px rgba(46,188,204,0.22)",
            }}
          >
            404
          </span>
          <ServiceModel3D className="notfound-model" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="notfound-copy"
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px 24px 56px",
          }}
        >
          <motion.span
            variants={item}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: eyebrowBg,
              border: `1px solid ${eyebrowBorder}`,
              color: "#2EBCCC",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.3,
              marginBottom: 20,
            }}
          >
            <Search size={14} strokeWidth={2.5} />
            {copy.eyebrow}
          </motion.span>

          <motion.h1
            variants={item}
            style={{
              fontSize: "clamp(28px, 4.2vw, 42px)",
              fontWeight: 800,
              color: textColor,
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 14,
            }}
          >
            {copy.title}
          </motion.h1>

          <motion.p
            variants={item}
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: mutedColor,
              margin: 0,
              marginBottom: 32,
              maxWidth: 480,
            }}
          >
            {copy.body}
          </motion.p>

          <motion.div
            variants={item}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}
          >
            <button
              onClick={handleBack}
              className="notfound-btn notfound-btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                borderRadius: 12,
                border: "none",
                background: "#2EBCCC",
                color: "#0B1030",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
              {copy.back}
            </button>

            <button
              onClick={() => navigate(defaultRoute)}
              className="notfound-btn notfound-btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                borderRadius: 12,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.16)" : "rgba(27,36,76,0.16)"}`,
                background: "transparent",
                color: textColor,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              <Home size={18} strokeWidth={2.5} />
              {copy.home}
            </button>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .notfound-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .notfound-canvas-wrap {
          width: 100%;
          height: clamp(340px, 52vh, 560px);
          position: relative;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notfound-model {
          transform: translateY(8%);
        }
        .notfound-404-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(120px, 26vw, 300px);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -4px;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }
        .notfound-copy {
          flex: 1;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          max-width: 640px;
          margin: 0 auto;
        }
        .notfound-btn {
          transition: transform 160ms ${`cubic-bezier(${EASE_OUT.join(",")})`}, box-shadow 160ms ease-out, border-color 160ms ease-out, background 160ms ease-out;
        }
        .notfound-btn:active {
          transform: scale(0.97);
        }
        @media (hover: hover) and (pointer: fine) {
          .notfound-btn-primary:hover {
            box-shadow: 0 10px 24px rgba(46,188,204,0.35);
            transform: translateY(-2px);
          }
          .notfound-btn-secondary:hover {
            border-color: #2EBCCC;
            transform: translateY(-2px);
          }
        }
        @media (min-width: 900px) {
          .notfound-layout {
            flex-direction: row-reverse;
            align-items: center;
          }
          .notfound-canvas-wrap {
            width: 52%;
            height: 100dvh;
          }
          .notfound-404-text {
            font-size: clamp(160px, 20vw, 340px);
          }
          .notfound-copy {
            width: 48%;
            align-items: flex-start;
            text-align: left;
            padding: 24px 48px 24px 64px !important;
            max-width: none;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFoundScreen;
