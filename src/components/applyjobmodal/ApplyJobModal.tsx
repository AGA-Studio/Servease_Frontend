// Modal for providers to submit a proposal / counter-offer for a job.

import { useState } from "react";
import { X, ArrowRight, CheckCircle2, Circle, Info } from "lucide-react";
import { useI18n } from "../../i18n";

export interface ApplyJobData {
  option: "accept" | "counter";
  price: number;
  coverLetter: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  clientPrice: number;
  onSubmit?: (data: ApplyJobData) => void;
  isSubmitting?: boolean;
}

const ApplyJobModal: React.FC<Props> = ({
  isOpen,
  onClose,
  jobTitle,
  clientPrice,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useI18n();
  const d = t("applyjobmodal");

  const [option, setOption] = useState<"accept" | "counter">("counter");
  const [counterOffer, setCounterOffer] = useState<string>(
    String(clientPrice + 30),
  );
  const [coverLetter, setCoverLetter] = useState("");

  if (!isOpen) return null;

  const formattedPrice = clientPrice.toFixed(2);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(27,36,76,0.95)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "24px 28px",
            background: "#1B244C",
            color: "#fff",
            borderRadius: "16px 16px 0 0",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              padding: 4,
              borderRadius: 8,
            }}
          >
            <X size={20} />
          </button>
          <h2
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 800,
            }}
          >
            {d.title}
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {d.subtitle.replace("{title}", jobTitle)}
          </p>
        </div>

        <div
          style={{
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: "0.78rem",
                fontWeight: 800,
                color: "#989898",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {d.priceProposal}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => setOption("accept")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: 14,
                  borderRadius: 12,
                  border:
                    option === "accept"
                      ? "2px solid #2EBCCC"
                      : "1px solid #e5e7eb",
                  background:
                    option === "accept"
                      ? "rgba(46,188,204,0.08)"
                      : "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                {option === "accept" ? (
                  <CheckCircle2 size={18} color="#2EBCCC" />
                ) : (
                  <Circle size={18} color="#989898" />
                )}
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#1B244C",
                    }}
                  >
                    {d.options.acceptClientPrice}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.75rem",
                      color: "#989898",
                    }}
                  >
                    {d.options.submitAt} ${formattedPrice}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setOption("counter")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: 14,
                  borderRadius: 12,
                  border:
                    option === "counter"
                      ? "2px solid #2EBCCC"
                      : "1px solid #e5e7eb",
                  background:
                    option === "counter"
                      ? "rgba(46,188,204,0.08)"
                      : "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                {option === "counter" ? (
                  <CheckCircle2 size={18} color="#2EBCCC" />
                ) : (
                  <Circle size={18} color="#989898" />
                )}
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#2EBCCC",
                    }}
                  >
                    {d.options.counterOffer}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.75rem",
                      color: "#2EBCCC",
                    }}
                  >
                    {d.options.negotiatePrice}
                  </p>
                </div>
              </button>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#1B244C",
                }}
              >
                {d.counterOffer.label}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#989898",
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(e.target.value)}
                  disabled={option === "accept"}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#1B244C",
                    fontFamily: "inherit",
                    background: "transparent",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#989898",
                    fontWeight: 600,
                  }}
                >
                  {d.counterOffer.currency}
                </span>
              </div>
              <p
                style={{
                  margin: "10px 0 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.72rem",
                  color: "#989898",
                }}
              >
                <Info size={12} />
                {d.counterOffer.feeNotice}
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: "#989898",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {d.coverLetter.label}
              </h3>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#989898",
                }}
              >
                {d.coverLetter.hint}
              </span>
            </div>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder={d.coverLetter.placeholder}
              rows={5}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#1B244C",
                fontSize: "0.85rem",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: "16px 28px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: "#989898",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {d.actions.cancel}
          </button>
          <button
            onClick={() =>
              onSubmit?.({
                option,
                price:
                  option === "accept"
                    ? clientPrice
                    : parseFloat(counterOffer) || clientPrice,
                coverLetter,
              })
            }
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: isSubmitting ? "#b0b0b0" : "#2EBCCC",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.2s",
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = "#239aaa";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = "#2EBCCC";
            }}
          >
            {option === "accept"
              ? d.actions.submitProposal
              : d.actions.submitCounterOffer}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobModal;
