import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Maximize2, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useThemeMode } from "../../theme/useThemeMode";

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

interface LocationMapProps {
  lat: number | null | undefined;
  lon: number | null | undefined;
  label?: string;
  placeholder?: string;
  height?: number | string;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  overlay?: React.ReactNode;
}

const LocationMap: React.FC<LocationMapProps> = ({
  lat,
  lon,
  label,
  placeholder,
  height = 160,
  zoom = 15,
  className,
  style,
  overlay,
}) => {
  ensureLeafletIcons();
  const { isDark } = useThemeMode();
  const instanceId = useId();
  const hasCoords = lat != null && lon != null;

  const [expanded, setExpanded] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewMapRef = useRef<L.Map | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const expandedMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!hasCoords || !previewRef.current) return;
    const center: [number, number] = [lat as number, lon as number];
    if (!previewMapRef.current) {
      previewMapRef.current = L.map(previewRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false,
      }).setView(center, zoom);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(
        previewMapRef.current,
      );
      L.marker(center).addTo(previewMapRef.current);
    } else {
      previewMapRef.current.setView(center, zoom);
    }
  }, [hasCoords, lat, lon, zoom]);

  useEffect(() => {
    return () => {
      previewMapRef.current?.remove();
      previewMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!expanded || !hasCoords || !expandedRef.current) return;
    const center: [number, number] = [lat as number, lon as number];
    const map = L.map(expandedRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      attributionControl: true,
    }).setView(center, zoom);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    L.marker(center).addTo(map);
    expandedMapRef.current = map;
    const resizeTimer = setTimeout(() => map.invalidateSize(), 260);
    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      expandedMapRef.current = null;
    };
  }, [expanded, hasCoords, lat, lon, zoom]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  const layoutId = `location-map-${instanceId}`;

  return (
    <>
      <motion.div
        layoutId={hasCoords ? layoutId : undefined}
        className={`relative overflow-hidden ${className ?? ""}`}
        style={{
          height,
          borderRadius: 12,
          background: isDark ? "#273570" : "#E5E7EB",
          cursor: hasCoords ? "pointer" : "default",
          ...style,
        }}
        onClick={() => hasCoords && setExpanded(true)}
      >
        <div
          ref={previewRef}
          className="w-full h-full"
          style={{ display: hasCoords ? "block" : "none", pointerEvents: "none" }}
        />
        {!hasCoords && (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="text-xs font-medium px-4 py-1.5 rounded-full"
              style={{
                background: isDark ? "#1B244C" : "#fff",
                color: "#989898",
              }}
            >
              {placeholder ?? "Ubicación no disponible"}
            </div>
          </div>
        )}
        {hasCoords && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              background: "rgba(27,36,76,0.7)",
              border: "none",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
            aria-label="Expandir mapa"
          >
            <Maximize2 size={14} color="#fff" />
          </button>
        )}
        {overlay}
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {expanded && hasCoords && (
            <motion.div
              key="location-map-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                background: "rgba(10,15,40,0.65)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => setExpanded(false)}
            >
              <motion.div
                layoutId={layoutId}
                transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(920px, 92vw)",
                  height: "min(640px, 85vh)",
                  borderRadius: 20,
                  overflow: "hidden",
                  position: "relative",
                  background: isDark ? "#1e2d5e" : "#fff",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                }}
              >
                <div ref={expandedRef} className="w-full h-full" />

                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="absolute top-3 right-3 flex items-center justify-center rounded-full"
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(27,36,76,0.85)",
                    border: "none",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  aria-label="Cerrar mapa"
                >
                  <X size={16} color="#fff" />
                </button>

                {label && (
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: isDark ? "rgba(30,45,94,0.92)" : "rgba(255,255,255,0.95)",
                      color: isDark ? "#fff" : "#1B244C",
                      zIndex: 10,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    {label}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default LocationMap;
