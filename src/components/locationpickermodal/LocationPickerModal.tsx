import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, LocateFixed, Send, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";

let iconsPatched = false;
function ensureLeafletIcons() {
  if (iconsPatched) return;
  iconsPatched = true;
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
    ._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = "© OpenStreetMap";
const DEFAULT_CENTER: [number, number] = [23.6345, -102.5528]; // México (fallback si no hay permiso de geolocalización)

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (lat: number, lon: number) => void | Promise<void>;
  isSending?: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, scale: 0.94, y: 16, transition: { duration: 0.18 } },
};

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSend,
  isSending = false,
}) => {
  ensureLeafletIcons();
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const d = t("messagesscreen");

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const setMarkerAt = (latlng: [number, number], recenter: boolean) => {
    setPosition(latlng);
    if (!mapInstanceRef.current) return;
    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { draggable: true }).addTo(
        mapInstanceRef.current,
      );
      markerRef.current.on("dragend", () => {
        const p = markerRef.current!.getLatLng();
        setPosition([p.lat, p.lng]);
      });
    } else {
      markerRef.current.setLatLng(latlng);
    }
    if (recenter) mapInstanceRef.current.setView(latlng, 16);
  };

  const locateDevice = () => {
    if (!("geolocation" in navigator)) {
      setLocationError(true);
      return;
    }
    setIsLocating(true);
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setMarkerAt([pos.coords.latitude, pos.coords.longitude], true);
      },
      () => {
        setIsLocating(false);
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // Init map on open
  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      DEFAULT_CENTER,
      5,
    );
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      setMarkerAt([e.latlng.lat, e.latlng.lng], false);
    });
    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);

    locateDevice();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset local state when the modal closes so the next open starts fresh.
  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      setLocationError(false);
    }
  }, [isOpen]);

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  const handleSend = async () => {
    if (!position || isSending) return;
    await onSend(position[0], position[1]);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="location-picker-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(27,36,76,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            key="location-picker-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              background: cardBg,
              borderRadius: 24,
              border: `1px solid ${border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px 14px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: text }}>
                  {d.locationPickerTitle}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", fontWeight: 500, color: textSecondary }}>
                  {d.locationPickerSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ background: "transparent", border: "none", color: textSecondary, cursor: "pointer", padding: 4, display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: "relative", height: 320 }}>
              <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

              <button
                type="button"
                onClick={locateDevice}
                disabled={isLocating}
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  zIndex: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: isDark ? "#1e2d5e" : "#fff",
                  color: "#2EBCCC",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: isLocating ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                }}
              >
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                {d.useCurrentLocation}
              </button>
            </div>

            <div style={{ padding: 20 }}>
              {isLocating && (
                <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: textSecondary }}>
                  {d.locatingDevice}
                </p>
              )}
              {locationError && !position && (
                <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "#ef4444" }}>
                  {d.locationPermissionDenied}
                </p>
              )}

              <motion.button
                type="button"
                whileHover={{ scale: position && !isSending ? 1.01 : 1 }}
                whileTap={{ scale: position && !isSending ? 0.98 : 1 }}
                onClick={handleSend}
                disabled={!position || isSending}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 0",
                  borderRadius: 16,
                  background: "#2EBCCC",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  border: "none",
                  cursor: !position || isSending ? "not-allowed" : "pointer",
                  opacity: !position || isSending ? 0.6 : 1,
                  fontFamily: "inherit",
                }}
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>{d.sendLocationButton}</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default LocationPickerModal;
