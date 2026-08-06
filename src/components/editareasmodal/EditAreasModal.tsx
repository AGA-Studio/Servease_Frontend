import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import { useWorkAreas } from "../../context/WorkAreasContext";
import { fetchCategorias, type Categoria } from "../../api/categoriaApi";
import { useCookieCached } from "../../hooks/useCookieCached";
import CustomizableModal from "../modal/CustomizableModal";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EditAreasModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const p = t("profile").provider.workAreas;
  const { areas, update } = useWorkAreas();

  const {
    data: allCategories = [],
    loading: loadingCategories,
  } = useCookieCached<Categoria[]>({
    key: "pv-categorias",
    fetcher: fetchCategorias,
    maxAgeSecs: 86400,
    enabled: isOpen,
  });

  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(areas.map((a) => a.id_categoria)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveClick = () => {
    setShowSaveConfirm(true);
  };

  const handleSave = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    try {
      await update(Array.from(selected));
      onClose();
    } catch {
      // parent context handles error re-throw; we just close on success
    } finally {
      setIsSaving(false);
    }
  };

  const checkboxStyle = (checked: boolean): React.CSSProperties => ({
    width: 22,
    height: 22,
    borderRadius: 6,
    border: `2px solid ${checked ? "#2EBCCC" : isDark ? "#3b4fb0" : "#d1d5db"}`,
    background: checked ? "#2EBCCC" : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
    flexShrink: 0,
  });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ea-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: isDark ? "rgba(27,36,76,0.85)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onClose}
        >
          <motion.div
            key="ea-panel"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              width: "100%",
              maxWidth: 440,
              maxHeight: "90vh",
              overflowY: "auto",
              background: isDark ? "#1e2d5e" : "#ffffff",
              borderRadius: 16,
              padding: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                {p.editModal.title}
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                margin: "0 0 20px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              {p.editModal.subtitle}
            </p>

            {loadingCategories ? (
              <div
                style={{
                  padding: "24px 0",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                ...
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(allCategories ?? []).map((cat) => {
                  const checked = selected.has(cat.id_categoria);
                  return (
                    <motion.button
                      key={cat.id_categoria}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggle(cat.id_categoria)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: `1.5px solid ${checked ? "rgba(46,188,204,0.3)" : isDark ? "#2d3e7a" : "#E5E7EB"}`,
                        background: checked
                          ? isDark ? "rgba(46,188,204,0.1)" : "rgba(46,188,204,0.06)"
                          : isDark ? "#253168" : "#F8FAFC",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={checkboxStyle(checked)}>
                        {checked && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: isDark ? "#fff" : "#000",
                        }}
                      >
                        {cat.nombre}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 24,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: `1.5px solid ${isDark ? "#3b4fb0" : "#E5E7EB"}`,
                  background: "transparent",
                  color: isDark ? "#fff" : "#000",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {p.editModal.cancel}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveClick}
                disabled={isSaving}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "#2EBCCC",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: isSaving ? "default" : "pointer",
                  opacity: isSaving ? 0.6 : 1,
                  fontFamily: "inherit",
                }}
              >
                {isSaving ? "..." : p.editModal.save}
              </motion.button>
            </div>
          </motion.div>

          <CustomizableModal
            isOpen={showSaveConfirm}
            onClose={() => setShowSaveConfirm(false)}
            onConfirm={handleSave}
            title={p.editModal.confirmSave.title}
            subtitle={p.editModal.confirmSave.message}
            confirmText={p.editModal.confirmSave.confirm}
            cancelText={p.editModal.cancel}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default EditAreasModal;
