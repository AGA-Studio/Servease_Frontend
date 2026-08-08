
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";
import { useAuth } from "../../context/AuthContext";
import { fetchCategorias, type Categoria } from "../../api/categoriaApi";
import {
  createPortafolioItem,
  uploadPortafolioPhoto,
} from "../../api/portafolioApi";
import { ApiError } from "../../api/apiClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    filter: "blur(2px)",
    transition: { duration: 0.2, ease: EASE },
  },
};

const PortafolioModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const { t } = useI18n();
  const pp = t("profile").provider.portfolio;
  const { user } = useAuth();
  const { isDark } = useThemeMode();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategorias()
        .then(setCategorias)
        .catch(() => setCategorias([]));
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!catOpen) return;
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [catOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user?.id) return;
    // Reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsUploading(true);
    setError(null);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadPortafolioPhoto(user.id, files[i]);
        urls.push(url);
      } catch {
        setError(pp.uploadError);
        setIsUploading(false);
        return;
      }
    }
    setFotos((prev) => [...prev, ...urls]);
    setIsUploading(false);
  };

  const removeFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      setError(pp.titleRequired);
      return;
    }
    if (categoriaId === null) {
      setError(pp.categoryRequired);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createPortafolioItem({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        id_categoria: categoriaId,
        fotos,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : pp.createError,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoria = categorias.find((c) => c.id_categoria === categoriaId);

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const inputBg = isDark ? "#273570" : "#F8FAFC";
  const border = isDark ? "#273570" : "#e5e7eb";
  const text = isDark ? "#ffffff" : "#1B244C";
  const secondary = "#989898";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="porta-overlay"
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
            background: isDark
              ? "rgba(27,36,76,0.85)"
              : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
            overscrollBehavior: "contain",
            touchAction: "none",
          }}
          onClick={onClose}
        >
          <motion.div
            key="porta-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "82vh",
              display: "flex",
              flexDirection: "column",
              background: cardBg,
              borderRadius: 20,
              padding: 24,
              boxShadow: isDark
                ? "0 24px 60px -12px rgba(0,0,0,0.5)"
                : "0 24px 60px -12px rgba(20,30,40,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                flexShrink: 0,
                borderBottom: `1px solid ${border}`,
                paddingBottom: 12,
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: text,
                }}
              >
                {pp.addTitle}
              </span>
              <motion.button
                onClick={onClose}
                aria-label="close"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: secondary,
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            <div style={{ overflowY: "auto", flex: 1, marginRight: -8, paddingRight: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: text,
                    marginBottom: 6,
                  }}
                >
                  {pp.projectTitle}
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={150}
                  placeholder={pp.titlePlaceholder}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: text,
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: text,
                    marginBottom: 6,
                  }}
                >
                  {pp.description}
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  placeholder={pp.descriptionPlaceholder}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: text,
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div ref={catRef} style={{ position: "relative" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: text,
                    marginBottom: 6,
                  }}
                >
                  {pp.category}
                </label>
                <button
                  type="button"
                  onClick={() => setCatOpen((v) => !v)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: selectedCategoria ? text : secondary,
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <span>{selectedCategoria?.nombre ?? pp.selectCategory}</span>
                  <ChevronDown size={16} />
                </button>
                {catOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 10,
                      maxHeight: 200,
                      overflowY: "auto",
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 10,
                      marginTop: 4,
                      boxShadow: isDark
                        ? "0 8px 24px rgba(0,0,0,0.4)"
                        : "0 8px 24px rgba(0,0,0,0.1)",
                    }}
                  >
                    {categorias.map((cat) => (
                      <button
                        key={cat.id_categoria}
                        type="button"
                        onClick={() => {
                          setCategoriaId(cat.id_categoria);
                          setCatOpen(false);
                        }}
                        style={{
                          width: "100%",
                          border: "none",
                          background:
                            cat.id_categoria === categoriaId
                              ? isDark
                                ? "rgba(46,188,204,0.15)"
                                : "rgba(46,188,204,0.08)"
                              : "transparent",
                          color: text,
                          padding: "10px 14px",
                          fontSize: "0.85rem",
                          fontFamily: "inherit",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: text,
                    marginBottom: 6,
                  }}
                >
                  {pp.photos}
                </label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: fotos.length > 0 ? 10 : 0,
                  }}
                >
                  {fotos.map((url, i) => (
                    <div
                      key={url}
                      style={{
                        position: "relative",
                        width: 90,
                        height: 90,
                        borderRadius: 10,
                        overflow: "hidden",
                        border: `1px solid ${border}`,
                      }}
                    >
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFoto(i)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: `1px dashed ${isUploading ? secondary : "#2EBCCC"}`,
                    background: "transparent",
                    color: isUploading ? secondary : "#2EBCCC",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: isUploading ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {isUploading ? (
                    <Loader2 size={14} color={secondary} style={{ animation: "notif-spin 0.8s linear infinite" }} />
                  ) : (
                    <Plus size={14} />
                  )}
                  {pp.addPhoto}
                </button>
              </div>

              {error && (
                <div
                  style={{
                    color: "#FF5555",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: isSubmitting ? "#239aaa" : "#2EBCCC",
                  color: "#fff",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: isSubmitting ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 4,
                  transition: "background 0.2s",
                }}
              >
                {isSubmitting && (
                  <Loader2 size={16} style={{ animation: "notif-spin 0.8s linear infinite" }} />
                )}
                {pp.create}
              </button>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortafolioModal;
