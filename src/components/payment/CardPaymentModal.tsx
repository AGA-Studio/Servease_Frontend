import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type {
  StripeCardNumberElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardCvcElementChangeEvent,
} from "@stripe/stripe-js";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "../../i18n";
import { stripePromise } from "../../lib/stripe";
import AnimatedCard, { type CardBrand, type FieldStatus } from "./AnimatedCard";

const EASE = [0.22, 1, 0.36, 1] as const;

const KNOWN_BRANDS: CardBrand[] = ["visa", "mastercard", "amex", "discover"];

function toCardBrand(brand: string): CardBrand {
  return (KNOWN_BRANDS as string[]).includes(brand) ? (brand as CardBrand) : "unknown";
}

interface FieldState {
  empty: boolean;
  complete: boolean;
  error: string | null;
}

const INITIAL_FIELD_STATE: FieldState = { empty: true, complete: false, error: null };

function fieldStatus(field: FieldState, isFocused: boolean): FieldStatus {
  if (field.error) return "error";
  if (field.complete) return "complete";
  if (!field.empty || isFocused) return "typing";
  return "empty";
}

export interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
  isDark: boolean;
  clientSecret: string | null;
  amount: string;
  currency: string;
  serviceTitle: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2, ease: EASE } },
};

const CardPaymentForm: React.FC<{
  isDark: boolean;
  clientSecret: string;
  amount: string;
  currency: string;
  serviceTitle: string;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}> = ({ isDark, clientSecret, amount, currency, serviceTitle, onClose, onPaymentConfirmed }) => {
  const { t } = useI18n();
  const cp = t("cardpaymentmodal");
  const stripe = useStripe();
  const elements = useElements();

  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [brand, setBrand] = useState<CardBrand>("unknown");
  const [numberField, setNumberField] = useState<FieldState>(INITIAL_FIELD_STATE);
  const [expiryField, setExpiryField] = useState<FieldState>(INITIAL_FIELD_STATE);
  const [cvcField, setCvcField] = useState<FieldState>(INITIAL_FIELD_STATE);
  const [focusedField, setFocusedField] = useState<"number" | "expiry" | "cvc" | null>(null);

  const cardMuted = isDark ? "#273570" : "#F8FAFB";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  const isLocked = status !== "idle";
  const allFieldsComplete = numberField.complete && expiryField.complete && cvcField.complete;

  const elementStyle = {
    base: {
      fontSize: "15px",
      color: text,
      fontFamily: "inherit",
      "::placeholder": { color: textSecondary },
    },
    invalid: { color: "#FF0000" },
  };

  const fieldBoxStyle = (field: FieldState, isFocused: boolean): React.CSSProperties => ({
    border: `1.5px solid ${field.error ? "#FF0000" : isFocused ? "#2EBCCC" : border}`,
    borderRadius: 12,
    padding: "12px 14px",
    background: isDark ? "#151c38" : "#ffffff",
    transition: "border-color 160ms ease-out, box-shadow 160ms ease-out",
    boxShadow: isFocused && !field.error ? "0 0 0 3px rgba(46,188,204,0.15)" : "none",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isLocked || !allFieldsComplete) return;

    const numberElement = elements.getElement(CardNumberElement);
    if (!numberElement) return;

    setStatus("processing");
    setSubmitError(null);

    const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: numberElement },
    });

    if (confirmError) {
      setSubmitError(confirmError.message ?? cp.genericError);
      setStatus("idle");
      return;
    }

    setStatus("success");
    setTimeout(() => {
      onPaymentConfirmed();
    }, 1400);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: text, lineHeight: 1.3, textAlign: "center" }}>
          {cp.title}
        </h3>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: textSecondary,
            lineHeight: 1.5,
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {serviceTitle}
        </p>
      </div>

      <AnimatedCard
        isDark={isDark}
        brand={brand}
        numberStatus={fieldStatus(numberField, focusedField === "number")}
        expiryStatus={fieldStatus(expiryField, focusedField === "expiry")}
        cvcStatus={fieldStatus(cvcField, focusedField === "cvc")}
        isCvcFocused={focusedField === "cvc"}
      />

      <div
        style={{
          background: cardMuted,
          borderRadius: 16,
          border: `1px solid ${border}`,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", color: textSecondary, textTransform: "uppercase" }}>
          {cp.amountLabel}
        </span>
        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: text }}>
          ${amount} <span style={{ fontSize: "0.85rem", fontWeight: 700, color: textSecondary }}>{currency}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(74,168,37,0.12)",
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.15, 1] }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ width: 30, height: 30, borderRadius: "50%", background: "#4AA825", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}
            >
              <Check size={16} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2f6b16" }}>{cp.paymentSuccess}</div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, color: text }}>
                {cp.numberLabel}
              </p>
              <div style={fieldBoxStyle(numberField, focusedField === "number")}>
                <CardNumberElement
                  options={{ style: elementStyle, showIcon: false }}
                  onChange={(event: StripeCardNumberElementChangeEvent) => {
                    setBrand(toCardBrand(event.brand));
                    setNumberField({ empty: event.empty, complete: event.complete, error: event.error?.message ?? null });
                  }}
                  onFocus={() => setFocusedField("number")}
                  onBlur={() => setFocusedField((f) => (f === "number" ? null : f))}
                />
              </div>
              <AnimatePresence>
                {numberField.error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ margin: "6px 0 0", fontSize: "0.72rem", color: "#FF0000", fontWeight: 600 }}
                  >
                    {numberField.error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, color: text }}>
                  {cp.expiryLabel}
                </p>
                <div style={fieldBoxStyle(expiryField, focusedField === "expiry")}>
                  <CardExpiryElement
                    options={{ style: elementStyle }}
                    onChange={(event: StripeCardExpiryElementChangeEvent) =>
                      setExpiryField({ empty: event.empty, complete: event.complete, error: event.error?.message ?? null })
                    }
                    onFocus={() => setFocusedField("expiry")}
                    onBlur={() => setFocusedField((f) => (f === "expiry" ? null : f))}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, color: text }}>
                  {cp.cvcLabel}
                </p>
                <div style={fieldBoxStyle(cvcField, focusedField === "cvc")}>
                  <CardCvcElement
                    options={{ style: elementStyle }}
                    onChange={(event: StripeCardCvcElementChangeEvent) =>
                      setCvcField({ empty: event.empty, complete: event.complete, error: event.error?.message ?? null })
                    }
                    onFocus={() => setFocusedField("cvc")}
                    onBlur={() => setFocusedField((f) => (f === "cvc" ? null : f))}
                  />
                </div>
              </div>
            </div>
            <AnimatePresence>
              {(expiryField.error || cvcField.error) && (
                <motion.p
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ margin: 0, fontSize: "0.72rem", color: "#FF0000", fontWeight: 600 }}
                >
                  {expiryField.error || cvcField.error}
                </motion.p>
              )}
            </AnimatePresence>

            {submitError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ margin: 0, fontSize: "0.75rem", color: "#FF0000", fontWeight: 600 }}
              >
                {submitError}
              </motion.p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: textSecondary }}>
              <ShieldCheck size={13} />
              {cp.securityNote}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                type="button"
                whileHover={isLocked ? undefined : { scale: 1.02 }}
                whileTap={isLocked ? undefined : { scale: 0.98 }}
                onClick={onClose}
                disabled={isLocked}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: `1.5px solid ${border}`,
                  background: "transparent",
                  color: textSecondary,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {cp.cancel}
              </motion.button>
              <motion.button
                type="submit"
                whileHover={isLocked || !stripe || !allFieldsComplete ? undefined : { scale: 1.02 }}
                whileTap={isLocked || !stripe || !allFieldsComplete ? undefined : { scale: 0.98 }}
                disabled={isLocked || !stripe || !allFieldsComplete}
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "#2EBCCC",
                  color: "#fff",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: isLocked || !stripe || !allFieldsComplete ? "not-allowed" : "pointer",
                  opacity: isLocked || !stripe || !allFieldsComplete ? 0.6 : 1,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(46,188,204,0.3)",
                }}
              >
                {status === "processing" ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={15} />
                  </motion.div>
                ) : null}
                {status === "processing" ? cp.processing : cp.pay}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentConfirmed,
  isDark,
  clientSecret,
  amount,
  currency,
  serviceTitle,
}) => {
  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const border = isDark ? "#273570" : "#E2E8F0";

  return createPortal(
    <AnimatePresence>
      {isOpen && clientSecret && (
        <motion.div
          key="card-payment-overlay"
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
        >
          <motion.div
            key="card-payment-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 460,
              background: cardBg,
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              border: `1px solid ${border}`,
              position: "relative",
            }}
          >
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CardPaymentForm
                isDark={isDark}
                clientSecret={clientSecret}
                amount={amount}
                currency={currency}
                serviceTitle={serviceTitle}
                onClose={onClose}
                onPaymentConfirmed={onPaymentConfirmed}
              />
            </Elements>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CardPaymentModal;
