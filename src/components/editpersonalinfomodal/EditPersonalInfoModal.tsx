// Modal para editar la información personal del cliente (PATCH
// /api/usuarios/auth/personal-info/): nombre, apellidos, celular y bio.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import { updatePersonalInfo, type UserProfile } from "../../api/userApi";
import { ApiError } from "../../api/apiClient";
import {
  BIO_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  hasUnsafeMarkup,
  isValidPhone,
  sanitizeText,
  stripControlChars,
} from "../../utils/validation";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FormErrors {
  nombre?: string;
  apellido_pa?: string;
  celular?: string;
  descripcion_perfil?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaved: (updated: UserProfile) => void;
  onError: (message: string) => void;
}

const EditPersonalInfoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSaved,
  onError,
}) => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const p = t("profile").client;

  const [nombre, setNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [apellidoPa, setApellidoPa] = useState("");
  const [apellidoMa, setApellidoMa] = useState("");
  const [celular, setCelular] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !profile) return;

    function resetForm(p: UserProfile) {
      setNombre(p.nombre);
      setSegundoNombre(p.segundo_nombre ?? "");
      setApellidoPa(p.apellido_paterno);
      setApellidoMa(p.apellido_materno ?? "");
      setCelular(p.celular ?? "");
      setBio(p.descripcion_perfil ?? "");
      setErrors({});
    }

    resetForm(profile);
  }, [isOpen, profile]);

  if (!profile) return null;

  const validate = (): boolean => {
    const e: FormErrors = {};
    const cleanNombre = sanitizeText(nombre, NAME_MAX_LENGTH);
    const cleanApellidoPa = sanitizeText(apellidoPa, NAME_MAX_LENGTH);
    const cleanBio = sanitizeText(bio, BIO_MAX_LENGTH);

    if (!cleanNombre) e.nombre = p.editModal.validation.nameRequired;
    else if (hasUnsafeMarkup(nombre)) e.nombre = p.editModal.validation.nameUnsafe;

    if (!cleanApellidoPa) e.apellido_pa = p.editModal.validation.lastNamePRequired;
    else if (hasUnsafeMarkup(apellidoPa))
      e.apellido_pa = p.editModal.validation.lastNamePUnsafe;

    if (!isValidPhone(celular)) e.celular = p.editModal.validation.phoneInvalid;

    if (cleanBio && hasUnsafeMarkup(bio))
      e.descripcion_perfil = p.editModal.validation.bioUnsafe;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const updated = await updatePersonalInfo({
        nombre: sanitizeText(nombre, NAME_MAX_LENGTH),
        segundo_nombre: sanitizeText(segundoNombre, NAME_MAX_LENGTH),
        apellido_pa: sanitizeText(apellidoPa, NAME_MAX_LENGTH),
        apellido_ma: sanitizeText(apellidoMa, NAME_MAX_LENGTH),
        celular: celular.trim(),
        descripcion_perfil: sanitizeText(bio, BIO_MAX_LENGTH),
      });
      onSaved(updated);
      onClose();
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : p.errors.profileUpdateFailed,
      );
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: 6,
    color: isDark ? "#fff" : "#000",
  };

  const errorTextStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "#FF4444",
    margin: "4px 0 0",
  };

  // Portal a document.body: si el modal se queda dentro del árbol de la
  // pantalla, cualquier ancestro con transform activo (ej. la animación de
  // entrada de página, .page-enter) crea un containing block nuevo y
  // "position: fixed" deja de anclarse al viewport — el modal se movería
  // con el scroll de esa pantalla en vez de quedarse fijo.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="epi-overlay"
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
            key="epi-panel"
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

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{p.editModal.nameLabel}</label>
                  <input
                    type="text"
                    value={nombre}
                    maxLength={NAME_MAX_LENGTH}
                    onChange={(e) =>
                      setNombre(
                        stripControlChars(e.target.value).slice(0, NAME_MAX_LENGTH),
                      )
                    }
                    style={inputStyle(!!errors.nombre)}
                  />
                  {errors.nombre && <p style={errorTextStyle}>{errors.nombre}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{p.editModal.secondNameLabel}</label>
                  <input
                    type="text"
                    value={segundoNombre}
                    maxLength={NAME_MAX_LENGTH}
                    onChange={(e) =>
                      setSegundoNombre(
                        stripControlChars(e.target.value).slice(0, NAME_MAX_LENGTH),
                      )
                    }
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{p.editModal.lastNamePLabel}</label>
                  <input
                    type="text"
                    value={apellidoPa}
                    maxLength={NAME_MAX_LENGTH}
                    onChange={(e) =>
                      setApellidoPa(
                        stripControlChars(e.target.value).slice(0, NAME_MAX_LENGTH),
                      )
                    }
                    style={inputStyle(!!errors.apellido_pa)}
                  />
                  {errors.apellido_pa && (
                    <p style={errorTextStyle}>{errors.apellido_pa}</p>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{p.editModal.lastNameMLabel}</label>
                  <input
                    type="text"
                    value={apellidoMa}
                    maxLength={NAME_MAX_LENGTH}
                    onChange={(e) =>
                      setApellidoMa(
                        stripControlChars(e.target.value).slice(0, NAME_MAX_LENGTH),
                      )
                    }
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{p.editModal.phoneLabel}</label>
                <input
                  type="tel"
                  value={celular}
                  maxLength={PHONE_MAX_LENGTH}
                  onChange={(e) =>
                    setCelular(
                      stripControlChars(e.target.value).slice(0, PHONE_MAX_LENGTH),
                    )
                  }
                  style={inputStyle(!!errors.celular)}
                />
                {errors.celular && <p style={errorTextStyle}>{errors.celular}</p>}
              </div>

              <div>
                <label style={labelStyle}>{p.editModal.bioLabel}</label>
                <textarea
                  rows={4}
                  value={bio}
                  maxLength={BIO_MAX_LENGTH}
                  onChange={(e) =>
                    setBio(
                      stripControlChars(e.target.value).slice(0, BIO_MAX_LENGTH),
                    )
                  }
                  style={{ ...inputStyle(!!errors.descripcion_perfil), resize: "vertical" }}
                />
                {errors.descripcion_perfil && (
                  <p style={errorTextStyle}>{errors.descripcion_perfil}</p>
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
                {p.editModal.cancel}
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
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
                {p.editModal.save}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default EditPersonalInfoModal;
