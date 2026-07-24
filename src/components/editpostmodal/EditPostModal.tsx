// Modal to edit a client's own service post (title, description, price,
// category). Only usable while the post is still "abierto" (backend rule).

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import ConfirmModal from "../confirmmodal/ConfirmModal";
import { fetchCategorias, type Categoria } from "../../api/categoriaApi";
import {
  editServicio,
  type PostDetails,
  type ServicioResponse,
} from "../../api/servicioApi";
import { ApiError } from "../../api/apiClient";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  hasUnsafeMarkup,
  isValidPrice,
  sanitizeText,
  stripControlChars,
} from "../../utils/validation";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FormErrors {
  titulo?: string;
  descripcion?: string;
  precio_inicial?: string;
  categoria?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  post: PostDetails | null;
  onSaved: (updated: ServicioResponse) => void;
  onError: (message: string) => void;
}

const EditPostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  post,
  onSaved,
  onError,
}) => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const mp = t("myposts");

  const [titulo, setTitulo] = useState(post?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(post?.descripcion ?? "");
  const [precio, setPrecio] = useState(
    post ? String(Number(post.precio_inicial)) : "",
  );
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasError, setCategoriasError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !post) return;

    fetchCategorias()
      .then((list) => {
        setCategorias(list);
        const match = list.find((c) => c.nombre === post.categoria);
        setCategoriaId(match?.id_categoria ?? null);
      })
      .catch(() => setCategoriasError(true));
  }, [isOpen, post]);

  if (!post) return null;

  const validate = (): boolean => {
    const e: FormErrors = {};
    const cleanTitulo = sanitizeText(titulo, TITLE_MAX_LENGTH);
    const cleanDescripcion = sanitizeText(descripcion, DESCRIPTION_MAX_LENGTH);

    if (!cleanTitulo) e.titulo = mp.editModal.validation.titleRequired;
    else if (hasUnsafeMarkup(titulo)) e.titulo = mp.editModal.validation.titleUnsafe;

    if (!cleanDescripcion) e.descripcion = mp.editModal.validation.descriptionRequired;
    else if (hasUnsafeMarkup(descripcion))
      e.descripcion = mp.editModal.validation.descriptionUnsafe;

    if (!isValidPrice(precio)) e.precio_inicial = mp.editModal.validation.priceInvalid;

    if (categoriaId === null) e.categoria = mp.editModal.validation.categoryRequired;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveClick = () => {
    if (validate()) setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (categoriaId === null) return;
    setIsConfirmOpen(false);
    setIsSaving(true);
    try {
      const updated = await editServicio(post.id_servicio, {
        titulo: sanitizeText(titulo, TITLE_MAX_LENGTH),
        descripcion: sanitizeText(descripcion, DESCRIPTION_MAX_LENGTH),
        precio_inicial: Number(precio).toFixed(2),
        id_categoria: categoriaId,
      });
      onSaved(updated);
      onClose();
    } catch (error) {
      onError(error instanceof ApiError ? error.message : mp.errors.editFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: isDark ? "#273570" : "#F8FAFC",
    border: `1.5px solid ${hasError ? "#FF4444" : isDark ? "#2d3e7a" : "#E5E7EB"}`,
    color: isDark ? "#fff" : "#000",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "0.875rem",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  });

  const errorTextStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "#FF4444",
    margin: "4px 0 0",
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="epm-overlay"
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
              background: isDark
                ? "rgba(27,36,76,0.85)"
                : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(6px)",
            }}
            onClick={onClose}
          >
            <motion.div
              key="epm-panel"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{
                width: "100%",
                maxWidth: 480,
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
                  marginBottom: 20,
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
                  {mp.editModal.title}
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

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: 6,
                      color: isDark ? "#fff" : "#000",
                    }}
                  >
                    {mp.editModal.titleLabel}
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    maxLength={TITLE_MAX_LENGTH}
                    onChange={(e) =>
                      setTitulo(
                        stripControlChars(e.target.value).slice(
                          0,
                          TITLE_MAX_LENGTH,
                        ),
                      )
                    }
                    style={inputStyle(!!errors.titulo)}
                  />
                  {errors.titulo && <p style={errorTextStyle}>{errors.titulo}</p>}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: 6,
                      color: isDark ? "#fff" : "#000",
                    }}
                  >
                    {mp.editModal.descriptionLabel}
                  </label>
                  <textarea
                    rows={4}
                    value={descripcion}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    onChange={(e) =>
                      setDescripcion(
                        stripControlChars(e.target.value).slice(
                          0,
                          DESCRIPTION_MAX_LENGTH,
                        ),
                      )
                    }
                    style={{ ...inputStyle(!!errors.descripcion), resize: "vertical" }}
                  />
                  {errors.descripcion && (
                    <p style={errorTextStyle}>{errors.descripcion}</p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: 6,
                      color: isDark ? "#fff" : "#000",
                    }}
                  >
                    {mp.editModal.categoryLabel}
                  </label>
                  {categoriasError ? (
                    <p style={{ fontSize: "0.8rem", color: "#FF4444", margin: 0 }}>
                      {mp.editModal.categoryUnavailable}
                    </p>
                  ) : (
                    <select
                      value={categoriaId ?? ""}
                      onChange={(e) => setCategoriaId(Number(e.target.value))}
                      style={inputStyle(!!errors.categoria)}
                    >
                      <option value="" disabled>
                        {mp.editModal.categoryLabel}
                      </option>
                      {categorias.map((c) => (
                        <option key={c.id_categoria} value={c.id_categoria}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.categoria && (
                    <p style={errorTextStyle}>{errors.categoria}</p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: 6,
                      color: isDark ? "#fff" : "#000",
                    }}
                  >
                    {mp.editModal.priceLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(stripControlChars(e.target.value))}
                    style={inputStyle(!!errors.precio_inicial)}
                  />
                  {errors.precio_inicial && (
                    <p style={errorTextStyle}>{errors.precio_inicial}</p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
                    background: "transparent",
                    color: isDark ? "#fff" : "#000",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {mp.editModal.cancel}
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "#2EBCCC",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: isSaving ? "default" : "pointer",
                    opacity: isSaving ? 0.7 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {mp.editModal.save}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmOpen}
        isDark={isDark}
        title={mp.editModal.confirmTitle}
        message={mp.editModal.confirmMessage}
        confirmLabel={mp.editModal.confirmSave}
        cancelLabel={mp.editModal.confirmCancel}
        onConfirm={handleConfirmSave}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default EditPostModal;
