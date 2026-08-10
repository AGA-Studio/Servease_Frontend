

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Star, Check, ArrowLeft, Users } from "lucide-react";
import { useI18n } from "../../i18n";
import { useCurrency } from "../../context/CurrencyContext";
import { postoffers } from "../../i18n/locales/en/postoffers";
import EmptyState from "../../components/emptystate/EmptyState";

type PostOffersStrings = typeof postoffers;
import { ROUTES, buildProviderProfileViewPath } from "../../router/routes";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import CustomizableModal from "../../components/modal/CustomizableModal";
import ClientCounterModal from "../../components/counteroffermodal/ClientCounterModal";
import Avatar from "../../components/avatar/Avatar";
import {
  acceptPostulacion,
  crearOferta,
  fetchAplicantes,
  fetchPostDetails,
  rejectPostulacion,
  undoRejectPostulacion,
  type Aplicante,
  type PostDetails,
} from "../../api/servicioApi";
import { ApiError } from "../../api/apiClient";
import { useCachedResource } from "../../hooks/useCachedResource";

const EASE = [0.22, 1, 0.36, 1] as const;

type ApplicantStatus = "new" | "countered" | "declined" | "accepted";
type Tab = "all" | "pending" | "countered" | "declined";

interface Applicant {
  id: number;
  proveedorId: string;
  name: string;
  avatar: string;
  rating: string;
  reviews: number;
  jobs: number;
  message: string;
  bid: number;
  status: ApplicantStatus;
  counterAmount: number | null;
  lastOfferBy: "you" | "provider" | null;
  previousOfferAmount: number | null;
  moneda: string | null;
  // Si la contraparte (proveedor) ya aceptó el monto de la última oferta,
  // sin que la postulación en sí esté aceptada todavía.
  offerAccepted: boolean;
}

function getCurrentAsk(a: Applicant): number {
  return a.status === "countered" ? (a.counterAmount ?? a.bid) : a.bid;
}

function mapEstadoSolicitud(estado: string | null, hasOferta: boolean): ApplicantStatus {
  const e = (estado ?? "").toLowerCase();
  if (e.includes("acept")) return "accepted";
  if (e.includes("rechaz") || e.includes("declin")) return "declined";
  if (hasOferta || e.includes("contra")) return "countered";
  return "new";
}

function aplicanteToApplicant(a: Aplicante): Applicant {
  return {
    id: a.id_postulacion,
    proveedorId: a.proveedor_id,
    name: a.nombre_proveedor,
    avatar: a.url_foto_perfil ?? "",
    rating: a.rating.toFixed(1),
    reviews: a.num_reviews,
    jobs: a.trabajos_completados,
    message: a.mensaje_proveedor,
    bid: Number(a.precio_propuesto),
    status: mapEstadoSolicitud(a.estado_solicitud, !!a.ultima_oferta),
    counterAmount: a.presupuesto_acordado ? Number(a.presupuesto_acordado) : null,
    lastOfferBy: a.ultima_oferta ? (a.ultima_oferta.emisor === "cliente" ? "you" : "provider") : null,
    previousOfferAmount: a.penultima_oferta_monto ? Number(a.penultima_oferta_monto) : null,
    moneda: a.moneda,
    offerAccepted: a.ultima_oferta?.aceptacion ?? false,
  };
}

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
  onAccept,
  onReject,
  onOpenCounter,
  onCancelCounter,
  onUndoDecline,
  po,
}: {
  applicant: Applicant;
  index: number;
  onAccept: () => void;
  onReject: () => void;
  onOpenCounter: () => void;
  onCancelCounter: () => void;
  onUndoDecline: () => void;
  po: PostOffersStrings;
}) => {
  const a = applicant;
  const navigate = useNavigate();
  const { formatFixedMoney } = useCurrency();
  // "countered" cubre "yo mandé la última oferta, espero al proveedor",
  // "el proveedor contraofertó, me toca responder", y "el proveedor ya
  // aceptó el precio de mi oferta, solo falta que yo confirme" — todos
  // menos el primero deben poder aceptar/rechazar/contraofertar de nuevo.
  const isYourTurn =
    a.status === "new" ||
    (a.status === "countered" && (a.lastOfferBy === "provider" || a.offerAccepted));
  const isWaitingView = a.status === "countered" && a.lastOfferBy === "you" && !a.offerAccepted;
  const isAcceptedView = a.status === "accepted";
  const isDeclinedView = a.status === "declined";
  const cardOpacity = a.status === "declined" ? 0.7 : 1;
  const currentAsk = getCurrentAsk(a);

  return (
    <>
      {}
      <motion.div
        layout
        className="po-card-desktop"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: cardOpacity, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: EASE } }}
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
          <Avatar
            photoUrl={a.avatar}
            name={a.name}
            size={64}
            style={{ boxShadow: "0 0 0 3px var(--sidebar-bg), 0 0 0 4px var(--divider)" }}
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
            onClick={(e) => { e.preventDefault(); navigate(buildProviderProfileViewPath(a.proveedorId)); }}
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

          {isYourTurn && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 14 }}>
              <div style={{ display: "flex", gap: 26 }}>
                {a.status === "countered" && (
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                      {po.previousBid}
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-secondary)", textDecoration: "line-through" }}>{formatFixedMoney(a.previousOfferAmount ?? a.bid, a.moneda)}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: a.status === "countered" ? "#2EBCCC" : "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                    {a.status === "countered"
                      ? `${po.lastOffer.label} · ${a.lastOfferBy === "provider" ? a.name.split(" ")[0] : po.lastOffer.you}`
                      : po.providerBid}
                  </div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>{formatFixedMoney(currentAsk, a.moneda)}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                {a.offerAccepted && (
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#4AA825" }}>
                    {po.offerAcceptedNotice.replace("{name}", a.name.split(" ")[0])}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255,68,68,0.08)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReject}
                    style={rejectBtnStyle}
                  >
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
            </div>
          )}

          {isWaitingView && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 14 }}>
              <div style={{ display: "flex", gap: 26 }}>
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                    {po.previousBid}
                  </div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-secondary)", textDecoration: "line-through" }}>{formatFixedMoney(a.previousOfferAmount ?? a.bid, a.moneda)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "#2EBCCC", textTransform: "uppercase", marginBottom: 4 }}>
                    {po.lastOffer.label} · {po.lastOffer.you}
                  </div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>{formatFixedMoney(a.counterAmount ?? 0, a.moneda)}</div>
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
                {po.acceptedMessage.replace("{name}", a.name).replace("{bid}", formatFixedMoney(a.bid, a.moneda))}
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

      {}
      <motion.div
        layout
        className="po-card-mobile"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: cardOpacity, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: EASE } }}
        transition={{ duration: 0.4, delay: index * 0.06, ease: EASE }}
        style={{
          display: "none",
          flexDirection: "column",
          gap: 14,
          background: "var(--sidebar-bg)",
          border: "1px solid var(--divider)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 2px 10px rgba(0,0,0,0.035)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Avatar
            photoUrl={a.avatar}
            name={a.name}
            size={48}
            style={{ boxShadow: "0 0 0 2px var(--sidebar-bg), 0 0 0 3px #2EBCCC" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.name}
              </span>
              <Badge status={a.status} po={po} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4 }}>
              <Star size={13} fill="#FFB200" color="#FFB200" />
              <span style={{ fontWeight: 700, color: "var(--text)" }}>{a.rating}</span>
              <span>({a.reviews} {po.reviews})</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div
            style={{
              flex: 1,
              background: "var(--input-bg)",
              borderRadius: 10,
              padding: "9px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.76rem",
              color: "var(--text-secondary)",
            }}
          >
            <span>{po.jobsCompleted}</span>
            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.86rem" }}>{a.jobs}</span>
          </div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate(buildProviderProfileViewPath(a.proveedorId)); }}
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#2EBCCC",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {po.seeProfile} <span>→</span>
          </a>
        </div>

        <div style={{ height: 1, background: "var(--divider)" }} />

        <div>
          <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 6 }}>
            {po.proposalMessage}
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.55, color: "var(--text)" }}>
            {a.message}
          </p>
        </div>

        {isYourTurn && (
          <>
            {a.status === "countered" ? (
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                    {po.previousBid}
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-secondary)", textDecoration: "line-through" }}>{formatFixedMoney(a.previousOfferAmount ?? a.bid, a.moneda)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.06em", color: "#2EBCCC", textTransform: "uppercase", marginBottom: 4 }}>
                    {po.lastOffer.label} · {a.lastOfferBy === "provider" ? a.name.split(" ")[0] : po.lastOffer.you}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>{formatFixedMoney(currentAsk, a.moneda)}</div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                  {po.providerBid}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>{formatFixedMoney(currentAsk, a.moneda)}</div>
              </div>
            )}
            {a.offerAccepted && (
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4AA825" }}>
                {po.offerAcceptedNotice.replace("{name}", a.name.split(" ")[0])}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAccept}
              style={{ ...acceptBtnStyle, width: "100%", textAlign: "center" }}
            >
              {po.accept}
            </motion.button>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={onReject} style={{ ...mobileOutlineBtnStyle, ...rejectMobileBtnStyle, flex: 1 }}>
                {po.reject}
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={onOpenCounter} style={{ ...counterBtnStyle, flex: 1, textAlign: "center" }}>
                {po.counterOffer}
              </motion.button>
            </div>
          </>
        )}

        {isWaitingView && (
          <>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                  {po.previousBid}
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-secondary)", textDecoration: "line-through" }}>{formatFixedMoney(a.previousOfferAmount ?? a.bid, a.moneda)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.06em", color: "#2EBCCC", textTransform: "uppercase", marginBottom: 4 }}>
                  {po.lastOffer.label} · {po.lastOffer.you}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>{formatFixedMoney(a.counterAmount ?? 0, a.moneda)}</div>
              </div>
            </div>
            <div style={{ background: "rgba(255,178,0,0.14)", color: "#8a5a00", fontWeight: 700, fontSize: "0.8rem", padding: "12px 16px", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFB200", display: "inline-block", flexShrink: 0 }}
              />
              {po.waitingForResponse}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onCancelCounter} style={{ ...mobileOutlineBtnStyle, width: "100%" }}>
              {po.cancelCounter}
            </motion.button>
          </>
        )}

        {isAcceptedView && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(74,168,37,0.12)", borderRadius: 12, padding: "14px 16px" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.15, 1] }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ width: 28, height: 28, borderRadius: "50%", background: "#4AA825", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}
            >
              <Check size={14} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2f6b16" }}>
              {po.acceptedMessage.replace("{name}", a.name).replace("{bid}", formatFixedMoney(a.bid, a.moneda))}
            </div>
          </motion.div>
        )}

        {isDeclinedView && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>{po.declinedMessage}</div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onUndoDecline} style={{ ...mobileOutlineBtnStyle, width: "100%" }}>
              {po.undo}
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
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

const rejectBtnStyle: React.CSSProperties = {
  ...ghostBtnStyle,
  color: "#FF4444",
  borderRadius: 9,
};

const rejectMobileBtnStyle: React.CSSProperties = {
  border: "1.5px solid rgba(255,68,68,0.4)",
  color: "#FF4444",
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

const mobileOutlineBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1.5px solid var(--divider)",
  color: "var(--text)",
  fontWeight: 700,
  fontSize: "0.85rem",
  padding: "12px 16px",
  borderRadius: 11,
  cursor: "pointer",
  fontFamily: "inherit",
  textAlign: "center",
};

const PostOffersScreen: React.FC = () => {
  const isDark = useTheme();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const po = t("postoffers");
  const sb = t("sidebar");
  const { toasts, addToast, removeToast } = useToast();
  const { formatFixedMoney } = useCurrency();

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [counterApplicant, setCounterApplicant] = useState<Applicant | null>(null);
  const [isCounterSubmitting, setIsCounterSubmitting] = useState(false);
  const [counterError, setCounterError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    type: "accept" | "reject" | "cancelCounter" | "undoDecline";
    applicant: Applicant;
  } | null>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);

  const {
    data: post,
    isLoading: isLoadingPost,
    error: postErrorObj,
  } = useCachedResource<PostDetails>(
    postId ? `post-details:${postId}` : null,
    () => fetchPostDetails(postId!),
  );

  useEffect(() => {
    if (postErrorObj) {
      console.error("fetchPostDetails failed:", postErrorObj);
      addToast("error", po.errors.postFailed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postErrorObj]);

  const {
    data: applicantsRaw,
    isLoading: isLoadingApplicants,
    error: applicantsErrorObj,
  } = useCachedResource<Aplicante[]>(
    postId ? `aplicantes:${postId}` : null,
    () => fetchAplicantes(postId!),
  );

  useEffect(() => {
    if (applicantsErrorObj) {
      console.error("fetchAplicantes failed:", applicantsErrorObj);
      addToast("error", po.errors.applicantsFailed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantsErrorObj]);

  // Copia local editable: applicantsRaw viene del cache (instantáneo en
  // revisitas) y se sincroniza aquí; las acciones (aceptar/rechazar/
  // contraofertar) mutan esta copia de forma optimista sin tener que
  // reconstruir la forma cruda de Aplicante.
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  useEffect(() => {
    if (applicantsRaw) setApplicants(applicantsRaw.map(aplicanteToApplicant));
  }, [applicantsRaw]);

  const notifyActionUnavailable = () => addToast("info", po.actionUnavailable);

  const handleSendCounter = async (data: { newBid: number; message: string }) => {
    if (!counterApplicant) return;
    setIsCounterSubmitting(true);
    setCounterError(null);
    try {
      await crearOferta({
        id_postulacion: counterApplicant.id,
        monto: data.newBid,
        comentario: data.message || undefined,
      });
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === counterApplicant.id
            ? {
                ...a,
                status: "countered" as const,
                counterAmount: data.newBid,
                lastOfferBy: "you" as const,
                previousOfferAmount: a.counterAmount ?? a.bid,
                offerAccepted: false,
              }
            : a,
        ),
      );
      addToast("success", po.success.countered.replace("{name}", counterApplicant.name));
      setCounterApplicant(null);
    } catch (error) {
      console.error("crearOferta failed:", error);
      const isFriendlyDetail =
        error instanceof ApiError && !/^Request failed: \d+$/.test(error.message);
      setCounterError(isFriendlyDetail ? (error as ApiError).message : po.errors.counterFailed);
    } finally {
      setIsCounterSubmitting(false);
    }
  };

  if (!isLoadingPost && !post) {
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
        <ToastContainer toasts={toasts} onRemove={removeToast} theme={isDark ? "dark" : "light"} />
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

  const handleConfirmedAction = async () => {
    if (!confirmState) return;
    const { type, applicant } = confirmState;

    if (type === "cancelCounter") {
      setConfirmState(null);
      notifyActionUnavailable();
      return;
    }

    setIsConfirmSubmitting(true);
    try {
      if (type === "accept") {
        await acceptPostulacion(applicant.id);
        setApplicants((prev) =>
          prev.map((a) => {
            if (a.id === applicant.id) return { ...a, status: "accepted" as const };
            if (a.status === "new" || a.status === "countered") {
              return { ...a, status: "declined" as const };
            }
            return a;
          }),
        );
        addToast("success", po.success.accepted.replace("{name}", applicant.name));
      } else if (type === "reject") {
        await rejectPostulacion(applicant.id);
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicant.id ? { ...a, status: "declined" as const } : a)),
        );
        addToast("success", po.success.rejected.replace("{name}", applicant.name));
      } else {
        await undoRejectPostulacion(applicant.id);
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicant.id ? { ...a, status: "new" as const } : a)),
        );
        addToast("success", po.success.undone.replace("{name}", applicant.name));
      }
    } catch (error) {
      console.error(`postulacion ${type} failed:`, error);
      const fallback =
        type === "accept"
          ? po.errors.acceptFailed
          : type === "reject"
            ? po.errors.rejectFailed
            : po.errors.undoFailed;
      const isFriendlyDetail =
        error instanceof ApiError && !/^Request failed: \d+$/.test(error.message);
      addToast("error", isFriendlyDetail ? (error as ApiError).message : fallback);
    } finally {
      setIsConfirmSubmitting(false);
      setConfirmState(null);
    }
  };

  return (
    <div className="page-enter po-page" style={{ padding: "36px 40px 64px", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`
        @media (max-width: 720px) {
          .po-page { padding: 20px 16px 40px !important; }
          .po-title { font-size: 1.35rem !important; }

          .po-tabs {
            width: 100% !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .po-tabs::-webkit-scrollbar { display: none; }
          .po-tabs button { padding: 9px 14px !important; font-size: 0.8rem !important; }

          .po-card-desktop { display: none !important; }
          .po-card-mobile { display: flex !important; }
        }
      `}</style>

      <Breadcrumbs
        items={[
          { label: sb.myPost, to: ROUTES.APP.MY_POST },
          ...(post ? [{ label: post.titulo }] : []),
        ]}
        backTo={ROUTES.APP.MY_POST}
      />

      {isLoadingPost ? (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
          style={{
            height: 30,
            width: "45%",
            borderRadius: 8,
            background: isDark ? "#273570" : "#e5e7eb",
            margin: "0 0 8px",
          }}
        />
      ) : (
        <motion.h1
          className="po-title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{
            margin: "0 0 8px",
            fontSize: "1.85rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {post?.titulo}
        </motion.h1>
      )}
      <p style={{ margin: "0 0 26px", fontSize: "0.92rem", color: "var(--text-secondary)" }}>
        {po.subtitle}
      </p>

      <div className="po-tabs" style={{ display: "flex", gap: 6, background: "var(--input-bg)", padding: 5, borderRadius: 14, width: "fit-content", marginBottom: 28, flexWrap: "wrap" }}>
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
              flexShrink: 0,
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
          {isLoadingApplicants ? (
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.6, 1],
                  delay: i * 0.1,
                }}
                style={{
                  height: 160,
                  borderRadius: 20,
                  background: isDark ? "#1e2d5e" : "#ffffff",
                  border: "1px solid var(--divider)",
                }}
              />
            ))
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={32} color="#2EBCCC" />}
              isDark={isDark}
              title={po.empty}
              subtitle={po.emptySubtitle}
            />
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((a, i) => (
                <ApplicantCard
                  key={a.id}
                  applicant={a}
                  index={i}
                  po={po}
                  onAccept={() => setConfirmState({ type: "accept", applicant: a })}
                  onReject={() => setConfirmState({ type: "reject", applicant: a })}
                  onUndoDecline={() => setConfirmState({ type: "undoDecline", applicant: a })}
                  onOpenCounter={() => {
                    setCounterError(null);
                    setCounterApplicant(a);
                  }}
                  onCancelCounter={() => setConfirmState({ type: "cancelCounter", applicant: a })}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={isDark ? "dark" : "light"} />

      {confirmState && (() => {
        const copyByType = {
          accept: { ...po.confirmAccept, variant: "success" as const },
          reject: { ...po.confirmReject, variant: "warning" as const },
          cancelCounter: { ...po.confirmCancelCounter, variant: "warning" as const },
          undoDecline: { ...po.confirmUndoDecline, variant: "feature" as const },
        };
        const copy = copyByType[confirmState.type];
        return (
          <CustomizableModal
            isOpen
            variant={copy.variant}
            title={copy.title}
            subtitle={copy.message
              .replace("{name}", confirmState.applicant.name)
              .replace(
                "{bid}",
                formatFixedMoney(getCurrentAsk(confirmState.applicant), confirmState.applicant.moneda),
              )}
            confirmText={copy.confirm}
            cancelText={po.cancel}
            isSubmitting={isConfirmSubmitting}
            onConfirm={handleConfirmedAction}
            onClose={() => !isConfirmSubmitting && setConfirmState(null)}
          />
        );
      })()}

      <ClientCounterModal
        key={counterApplicant?.id ?? "none"}
        isOpen={!!counterApplicant}
        applicant={{
          name: counterApplicant?.name ?? "",
          avatarUrl: counterApplicant?.avatar,
          originalBid: counterApplicant ? getCurrentAsk(counterApplicant) : 0,
        }}
        isSubmitting={isCounterSubmitting}
        errorMessage={counterError}
        onClose={() => {
          if (isCounterSubmitting) return;
          setCounterError(null);
          setCounterApplicant(null);
        }}
        onSubmit={handleSendCounter}
      />
    </div>
  );
};

export default PostOffersScreen;
