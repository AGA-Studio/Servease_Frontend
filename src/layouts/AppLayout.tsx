

import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import Sidebar from "../components/sidebar/Sidebar";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import ServeaseLogoDark from "../assets/Servease-Icono-Modo-Oscuro.svg";
import ServeaseLogo from "../assets/Servease-Icono.svg";
import { useI18n } from "../i18n";
import { ROUTES } from "../router/routes";
import { useAuth } from "../context/AuthContext";
import ClientRatingModal, { type ClientRatingData } from "../components/ratingmodal/ClientRatingModal";
import CardPaymentModal from "../components/payment/CardPaymentModal";
import { useToast } from "../components/Toast/useToast";
import ToastContainer from "../components/Toast/ToastContainer";
import { useRealtimeChannel } from "../hooks/useRealtimeChannel";
import { friendlyErrorMessage } from "../utils/apiError";
import {
  calificarServicio,
  fetchAplicantes,
  fetchPagoPendiente,
  fetchPagoPendienteCliente,
  fetchPendienteCalificar,
  fetchPostDetails,
} from "../api/servicioApi";

const useTheme = () => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark"
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark")
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
};

const AppLayout: React.FC = () => {
  const isDark = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const sidebar = t("sidebar");
  const crm = t("clientratingmodal");
  const cpm = t("cardpaymentmodal");
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const isClient = user?.role === "client";

  interface CardPaymentPrompt {
    idServicio: number;
    idTransaccion: number;
    clientSecret: string;
    monto: string;
    serviceTitle: string;
  }
  const [cardPayment, setCardPayment] = useState<CardPaymentPrompt | null>(null);

  interface RatingPrompt {
    idServicio: number;
    provider: { name: string; avatarUrl?: string };
  }
  const [ratingPrompt, setRatingPrompt] = useState<RatingPrompt | null>(null);
  const [isSubmittingClientRating, setIsSubmittingClientRating] = useState(false);

  // Catches ratings pending from before this session connected (Realtime only
  // catches the transition live) — e.g. the provider completed the service
  // while the client was logged out, so no UPDATE event ever reaches them.
  useEffect(() => {
    if (!isClient || !user) return;
    let cancelled = false;
    fetchPendienteCalificar()
      .then((pendiente) => {
        if (cancelled || !pendiente) return;
        setRatingPrompt({
          idServicio: pendiente.id_servicio,
          provider: {
            name: pendiente.proveedor_nombre,
            avatarUrl: pendiente.proveedor_foto ?? undefined,
          },
        });
      })
      .catch((error) => {
        console.error("fetchPendienteCalificar failed:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [isClient, user]);

  // Same as above but for a card payment the provider already started before
  // this session connected — Realtime's INSERT sub below only catches it live.
  useEffect(() => {
    if (!isClient || !user) return;
    let cancelled = false;
    fetchPagoPendienteCliente()
      .then((pago) => {
        if (cancelled || !pago) return;
        setCardPayment({
          idServicio: pago.id_servicio,
          idTransaccion: pago.id_transaccion,
          clientSecret: pago.client_secret,
          monto: pago.monto,
          serviceTitle: pago.titulo,
        });
      })
      .catch((error) => {
        console.error("fetchPagoPendienteCliente failed:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [isClient, user]);

  // Client waiting for a card charge the provider just started — also watches
  // for the provider cancelling it mid-wait (UPDATE to 'cancelada').
  useRealtimeChannel<{
    id_transaccion: number;
    servicio_id: number;
    estado: string;
    metodo_pago: string | null;
  }>({
    table: "transaccion",
    event: "*",
    filter: user ? `cliente_id=eq.${user.id}` : undefined,
    enabled: isClient && !!user,
    onChange: (payload) => {
      const row = payload.new as {
        id_transaccion: number;
        servicio_id: number;
        estado: string;
        metodo_pago: string | null;
      };

      if (row.estado === "cancelada") {
        if (cardPayment?.idTransaccion !== row.id_transaccion) return;
        setCardPayment(null);
        addToast("info", cpm.cancelledByProvider);
        return;
      }

      if (row.metodo_pago !== "tarjeta" || row.estado !== "pendiente") return;
      Promise.all([fetchPagoPendiente(row.servicio_id), fetchPostDetails(row.servicio_id)])
        .then(([pago, details]) => {
          setCardPayment({
            idServicio: row.servicio_id,
            idTransaccion: row.id_transaccion,
            clientSecret: pago.client_secret,
            monto: pago.monto,
            serviceTitle: details.titulo,
          });
        })
        .catch((error) => {
          console.error("fetchPagoPendiente failed:", error);
        });
    },
  });

  // Client waiting for the provider to mark the service completed (blocking rating prompt).
  useRealtimeChannel<{ id_servicio: number; estado: string }>({
    table: "servicio",
    event: "UPDATE",
    filter: user ? `cliente_id=eq.${user.id}` : undefined,
    enabled: isClient && !!user,
    onChange: (payload) => {
      const row = payload.new as { id_servicio: number; estado: string };
      if (row.estado !== "completado") return;
      fetchAplicantes(row.id_servicio)
        .then((aplicantes) => {
          const aceptado = aplicantes.find((a) =>
            a.estado_solicitud.toLowerCase().includes("acept"),
          );
          setRatingPrompt({
            idServicio: row.id_servicio,
            provider: {
              name: aceptado?.nombre_proveedor ?? "",
              avatarUrl: aceptado?.url_foto_perfil ?? undefined,
            },
          });
        })
        .catch((error) => {
          console.error("fetchAplicantes failed:", error);
        });
    },
  });

  const handleClientRatingSubmit = useCallback(
    async (data: ClientRatingData) => {
      if (!ratingPrompt) return;
      setIsSubmittingClientRating(true);
      try {
        await calificarServicio(ratingPrompt.idServicio, {
          puntuacion: data.rating,
          comentario: data.comment,
        });
        addToast("success", crm.success);
        setRatingPrompt(null);
      } catch (error) {
        console.error("calificarServicio failed:", error);
        addToast("error", friendlyErrorMessage(error, crm.error));
      } finally {
        setIsSubmittingClientRating(false);
      }
    },
    [ratingPrompt, addToast, crm],
  );

  const bg     = isDark ? "#1B244C" : "#F6F8F8";
  const border = isDark ? "#273570" : "#CCCCCC";
  const headerBg = isDark ? "#1B244C" : "#FFFFFF";

  const headerLogo = isDark ? ServeaseLogoDark : ServeaseLogo;
  const isOnNewService = location.pathname === ROUTES.APP.NEW_SERVICE;

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar { display: flex !important; }
          #mobile-sidebar  { display: none !important; }
          #mobile-header   { display: none !important; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ background: bg }}>
        <Sidebar isDark={isDark} />

        <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} isDark={isDark} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header
            id="mobile-header"
            className="flex items-center gap-3 px-4 h-14 shrink-0"
            style={{ borderBottom: `1px solid ${border}`, background: headerBg }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 rounded-[10px] border-none flex items-center justify-center cursor-pointer"
              style={{ background: isDark ? "#273570" : "#F6F8F8", color: isDark ? "#FFFFFF" : "#1B244C" }}
            >
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-[7px] flex items-center justify-center p-[5px] shrink-0"
                style={{ border: "1.5px solid #2EBCCC", background: "rgba(46,188,204,0.08)" }}>
                <img src={headerLogo} alt="Servease" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-[0.95rem] truncate" style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}>
                Servease
              </span>
            </div>

            {!isOnNewService && (
              <button
                onClick={() => navigate(ROUTES.APP.NEW_SERVICE)}
                aria-label={sidebar.newService}
                className="w-9 h-9 rounded-[10px] border-none flex items-center justify-center cursor-pointer shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.93]"
                style={{ background: "#2EBCCC", color: "#FFFFFF" }}
              >
                <Plus size={19} strokeWidth={2.5} />
              </button>
            )}
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {isClient && (
        <>
          <CardPaymentModal
            isOpen={!!cardPayment}
            onClose={() => setCardPayment(null)}
            onPaymentConfirmed={() => {
              setCardPayment(null);
              addToast("success", cpm.paymentSuccess);
            }}
            isDark={isDark}
            clientSecret={cardPayment?.clientSecret ?? null}
            amount={cardPayment ? Number(cardPayment.monto).toLocaleString() : "0"}
            currency="MXN"
            serviceTitle={cardPayment?.serviceTitle ?? ""}
          />

          {/* Both are full-screen non-dismissable overlays — only ever show one.
              Payment takes priority: it blocks the provider on the other end
              and has a server-side expiry, so it shouldn't wait behind rating. */}
          {ratingPrompt && !cardPayment && (
            <ClientRatingModal
              isOpen={!!ratingPrompt}
              provider={ratingPrompt.provider}
              onSubmit={handleClientRatingSubmit}
              isSubmitting={isSubmittingClientRating}
            />
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={isDark ? "dark" : "light"} />
    </>
  );
};

export default AppLayout;