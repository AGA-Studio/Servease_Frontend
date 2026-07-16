// Post Offers screen: lets a Client review, accept, reject, or counter-offer
// applications submitted by providers on one of their posted services.

import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Star, Check, ArrowLeft } from "lucide-react";
import { useI18n } from "../../i18n";
import type { postoffers as PostOffersStrings } from "../../i18n/locales/en/postoffers";
import { ROUTES } from "../../router/routes";
import { MOCK_POSTS, type MyPost } from "../../data/mockPosts";
import Breadcrumbs from "../../components/Breadcrumbs";

const EASE = [0.22, 1, 0.36, 1] as const;

type ApplicantStatus = "new" | "countered" | "declined" | "accepted";
type Tab = "all" | "pending" | "countered" | "declined";

interface Applicant {
  id: number;
  name: string;
  avatar: string;
  rating: string;
  reviews: number;
  jobs: number;
  message: string;
  bid: number;
  status: ApplicantStatus;
  counterAmount: number | null;
  counterDraft: string;
}

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 1,
    name: "Sara Jimenez",
    avatar: "https://i.pravatar.cc/128?img=47",
    rating: "4.9",
    reviews: 124,
    jobs: 42,
    message:
      "Hello! I would like to offer my services, I have 5 years of experience and I have worked with many clients on the platform. I am available to start immediately.",
    bid: 800,
    status: "new",
    counterAmount: null,
    counterDraft: "",
  },
  {
    id: 2,
    name: "Pedro Navarro",
    avatar: "https://i.pravatar.cc/128?img=52",
    rating: "4.9",
    reviews: 124,
    jobs: 42,
    message:
      "Hello! I would like to offer my services, I have 5 years of experience and I have worked with many clients on the platform. I am available to start immediately.",
    bid: 800,
    status: "countered",
    counterAmount: 600,
    counterDraft: "",
  },
  {
    id: 3,
    name: "Carlos Ruiz",
    avatar: "https://i.pravatar.cc/128?img=33",
    rating: "4.7",
    reviews: 89,
    jobs: 31,
    message:
      "Available today and can bring my own parts. I specialize in emergency repairs and can be there within the hour.",
    bid: 750,
    status: "new",
    counterAmount: null,
    counterDraft: "",
  },
  {
    id: 4,
    name: "Luis Fernandez",
    avatar: "https://i.pravatar.cc/128?img=15",
    rating: "5.0",
    reviews: 210,
    jobs: 88,
    message:
      "Licensed professional with 10+ years in residential emergencies. Happy to send references from recent jobs nearby.",
    bid: 900,
    status: "declined",
    counterAmount: null,
    counterDraft: "",
  },
  {
    id: 5,
    name: "Ana Torres",
    avatar: "https://i.pravatar.cc/128?img=48",
    rating: "4.8",
    reviews: 156,
    jobs: 64,
    message:
      "I can be on-site within 30 minutes. Includes a free diagnostic and 90-day warranty on the repair.",
    bid: 700,
    status: "new",
    counterAmount: null,
    counterDraft: "",
  },
];

const useTheme = () => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );
  useMemo(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark"),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
};

const Badge = ({ status, po }: { status: ApplicantStatus; po: PostOffersStrings }) => {
  const map: Record<ApplicantStatus, { text: string; bg: string; color: string }> = {
    new: { text: po.badge.new, bg: "rgba(46,188,204,0.14)", color: "#1f7c8c" },
    countered: { text: po.badge.countered, bg: "rgba(255,178,0,0.16)", color: "#8a5a00" },
    declined: { text: po.badge.declined, bg: "rgba(255,0,0,0.10)", color: "#a02020" },
    accepted: { text: po.badge.accepted, bg: "rgba(74,168,37,0.16)", color: "#2f6b16" },
  };
  const s = map[status];
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        padding: "6px 12px",
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.text}
    </span>
  );
};

const ApplicantCard = ({
  applicant,
  index,
  isCounterFormOpen,
  onAccept,
  onReject,
  onOpenCounter,
  onCancelDraft,
  onCounterDraftChange,
  onSubmitCounter,
  onCancelCounter,
  onUndoDecline,
  po,
}: {
  applicant: Applicant;
  index: number;
  isCounterFormOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
  onOpenCounter: () => void;
  onCancelDraft: () => void;
  onCounterDraftChange: (v: string) => void;
  onSubmitCounter: () => void;
  onCancelCounter: () => void;
  onUndoDecline: () => void;
  po: PostOffersStrings;
}) => {
  const a = applicant;
  const isBidView = !isCounterFormOpen && a.status === "new";
  const isCounteredView = !isCounterFormOpen && a.status === "countered";
  const isAcceptedView = a.status === "accepted";
  const isDeclinedView = a.status === "declined";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: a.status === "declined" ? 0.7 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: EASE }}
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1px 1fr",
        gap: 28,
        background: "var(--sidebar-bg)",
        border: "1px solid var(--divider)",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 2px 10px rgba(0,0,0,0.035)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <img
          src={a.avatar}
          alt={a.name}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 0 0 3px var(--sidebar-bg), 0 0 0 4px var(--divider)",
          }}
        />
        <div style={{ fontSize: "1.03rem", fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
          {a.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.84rem", color: "var(--text-secondary)" }}>
          <Star size={13} fill="#FFB200" color="#FFB200" />
          <span style={{ fontWeight: 700, color: "var(--text)" }}>{a.rating}</span>
          <span>({a.reviews} {po.reviews})</span>
        </div>
        <div
          style={{
            background: "var(--input-bg)",
            borderRadius: 10,
            padding: "9px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          <span>{po.jobsCompleted}</span>
          <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.88rem" }}>{a.jobs}</span>
        </div>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            fontSize: "0.84rem",
            fontWeight: 600,
            color: "#2EBCCC",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 2,
          }}
        >
          {po.seeProfile} <span>→</span>
        </a>
      </div>

      <div style={{ background: "var(--divider)" }} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            {po.proposalMessage}
          </span>
          <Badge status={a.status} po={po} />
        </div>
        <p style={{ margin: "10px 0 0", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)" }}>
          {a.message}
        </p>

        {isBidView && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                {po.providerBid}
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>${a.bid}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onReject} style={ghostBtnStyle}>
                {po.reject}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={onOpenCounter} style={counterBtnStyle}>
                {po.counterOffer}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.96 }} onClick={onAccept} style={acceptBtnStyle}>
                {po.accept}
              </motion.button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isCounterFormOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: "auto" }}
              exit={{ opacity: 0, scale: 0.96, height: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{
                marginTop: 18,
                background: "var(--input-bg)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "flex-end",
                gap: 14,
                flexWrap: "wrap",
                overflow: "hidden",
              }}
            >
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 6 }}>
                  {po.yourCounterOffer}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--sidebar-bg)", border: "1.5px solid var(--divider)", borderRadius: 10, padding: "6px 12px", width: 140 }}>
                  <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>$</span>
                  <input
                    type="number"
                    value={a.counterDraft}
                    onChange={(e) => onCounterDraftChange(e.target.value)}
                    style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.05rem", fontWeight: 700, width: "100%", color: "var(--text)", fontFamily: "inherit" }}
                  />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onCancelDraft} style={ghostBtnStyle}>
                {po.cancel}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={onSubmitCounter} style={{ ...acceptBtnStyle, background: "var(--primary)", marginLeft: "auto" }}>
                {po.sendCounter}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {isCounteredView && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", gap: 26 }}>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                  {po.originalBid}
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-secondary)", textDecoration: "line-through" }}>${a.bid}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "#2EBCCC", textTransform: "uppercase", marginBottom: 4 }}>
                  {po.yourCounter}
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>${a.counterAmount}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onCancelCounter} style={ghostBtnStyle}>
                {po.cancelCounter}
              </motion.button>
              <div style={{ background: "rgba(255,178,0,0.14)", color: "#8a5a00", fontWeight: 700, fontSize: "0.82rem", padding: "12px 18px", borderRadius: 11, display: "flex", alignItems: "center", gap: 8 }}>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFB200", display: "inline-block" }}
                />
                {po.waitingForResponse}
              </div>
            </div>
          </div>
        )}

        {isAcceptedView && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, background: "rgba(74,168,37,0.12)", borderRadius: 12, padding: "16px 18px" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.15, 1] }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ width: 30, height: 30, borderRadius: "50%", background: "#4AA825", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}
            >
              <Check size={16} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2f6b16" }}>
              {po.acceptedMessage.replace("{name}", a.name).replace("{bid}", String(a.bid))}
            </div>
          </motion.div>
        )}

        {isDeclinedView && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
            <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-secondary)" }}>{po.declinedMessage}</div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onUndoDecline} style={{ background: "none", border: "1.5px solid var(--divider)", color: "var(--text)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit" }}>
              {po.undo}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ghostBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "12px 6px",
  fontFamily: "inherit",
};

const counterBtnStyle: React.CSSProperties = {
  background: "var(--sidebar-bg)",
  border: "1.5px solid #2EBCCC",
  color: "#2EBCCC",
  fontWeight: 700,
  fontSize: "0.85rem",
  padding: "12px 20px",
  borderRadius: 11,
  cursor: "pointer",
  fontFamily: "inherit",
};

const acceptBtnStyle: React.CSSProperties = {
  background: "#2EBCCC",
  border: "none",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.85rem",
  padding: "12px 22px",
  borderRadius: 11,
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 6px 16px rgba(46,188,204,0.35)",
};

const PostOffersScreen: React.FC = () => {
  useTheme();
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const po = t("postoffers");
  const sb = t("sidebar");

  const statePost = (location.state as { post?: MyPost } | null)?.post;
  const post = statePost ?? MOCK_POSTS.find((p) => p.id === postId);

  const [applicants, setApplicants] = useState<Applicant[]>(MOCK_APPLICANTS);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [openCounterId, setOpenCounterId] = useState<number | null>(null);

  if (!post) {
    return (
      <div className="page-enter" style={{ padding: "44px 56px", maxWidth: 900 }}>
        <Breadcrumbs items={[{ label: sb.myPost, to: ROUTES.APP.MY_POST }]} backTo={ROUTES.APP.MY_POST} />
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", margin: "8px 0" }}>
          {po.notFound.title}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>{po.notFound.subtitle}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(ROUTES.APP.MY_POST)}
          style={{ ...acceptBtnStyle, display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <ArrowLeft size={16} /> {po.notFound.back}
        </motion.button>
      </div>
    );
  }

  const counts = {
    all: applicants.length,
    pending: applicants.filter((a) => a.status === "new").length,
    countered: applicants.filter((a) => a.status === "countered").length,
    declined: applicants.filter((a) => a.status === "declined").length,
  };

  const tabDefs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: po.tabs.all, count: counts.all },
    { key: "pending", label: po.tabs.pending, count: counts.pending },
    { key: "countered", label: po.tabs.countered, count: counts.countered },
    { key: "declined", label: po.tabs.declined, count: counts.declined },
  ];

  const filtered = applicants.filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return a.status === "new";
    if (activeTab === "countered") return a.status === "countered";
    if (activeTab === "declined") return a.status === "declined";
    return true;
  });

  const updateApplicant = (id: number, patch: Partial<Applicant>) => {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  return (
    <div className="page-enter" style={{ padding: "36px 40px 64px", maxWidth: 1200, margin: "0 auto" }}>
      <Breadcrumbs
        items={[
          { label: sb.myPost, to: ROUTES.APP.MY_POST },
          { label: post.title },
        ]}
        backTo={ROUTES.APP.MY_POST}
      />

      <h1 style={{ margin: "0 0 8px", fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
        {post.title}
      </h1>
      <p style={{ margin: "0 0 26px", fontSize: "0.92rem", color: "var(--text-secondary)" }}>
        {po.subtitle}
      </p>

      <div style={{ display: "flex", gap: 6, background: "var(--input-bg)", padding: 5, borderRadius: 14, width: "fit-content", marginBottom: 28, flexWrap: "wrap" }}>
        {tabDefs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              position: "relative",
              padding: "10px 18px",
              borderRadius: 11,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              fontFamily: "inherit",
              background: "transparent",
              color: activeTab === tab.key ? "var(--text)" : "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            {activeTab === tab.key && (
              <motion.span
                layoutId="po-tab-active-bg"
                transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 11,
                  background: "var(--sidebar-bg)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
            )}
            <span style={{ position: "relative" }}>
              {tab.label} ({tab.count})
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {po.empty}
            </div>
          ) : (
            filtered.map((a, i) => (
              <ApplicantCard
                key={a.id}
                applicant={a}
                index={i}
                po={po}
                isCounterFormOpen={openCounterId === a.id}
                onAccept={() => updateApplicant(a.id, { status: "accepted" })}
                onReject={() => updateApplicant(a.id, { status: "declined" })}
                onUndoDecline={() => updateApplicant(a.id, { status: "new" })}
                onOpenCounter={() => {
                  setOpenCounterId(a.id);
                  updateApplicant(a.id, { counterDraft: String(Math.max(0, a.bid - 150)) });
                }}
                onCancelDraft={() => setOpenCounterId(null)}
                onCounterDraftChange={(v) => updateApplicant(a.id, { counterDraft: v })}
                onSubmitCounter={() => {
                  setOpenCounterId(null);
                  updateApplicant(a.id, {
                    status: "countered",
                    counterAmount: Number(a.counterDraft) || a.bid,
                  });
                }}
                onCancelCounter={() => updateApplicant(a.id, { status: "new", counterAmount: null })}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PostOffersScreen;
