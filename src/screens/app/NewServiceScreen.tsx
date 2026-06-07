// New Service Publication form: multi-step on mobile, two-column layout on desktop.
// Supports dark/light theme and i18n (en/es).

import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  Send,
  Tag,
  ChevronLeft,
  ChevronRight,
  Clock,
  UploadCloud,
} from "lucide-react";
import type { ThemeMode } from "../../theme/theme";
import { useI18n } from "../../i18n";
import "./animations.newservice.css";
import { motion } from "motion/react";

const useTheme = () => {
  const [theme] = useState<ThemeMode>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("servease-theme") as ThemeMode) || "light"
      : "light",
  );
  return { theme };
};

interface FormState {
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  budget: string;
  currency: "MXN" | "USD";
  photos: File[];
}

interface ValidationErrors {
  title?: string;
  category?: string;
  description?: string;
  location?: string;
}

const TOTAL_STEPS = 3;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function CustomDateTimePicker({
  value,
  onChange,
  isDark,
}: {
  value: string;
  onChange: (v: string) => void;
  isDark: boolean;
}) {
  const now = new Date();
  const parsed = value ? new Date(value) : null;
  const [viewYear, setViewYear] = useState(
    parsed ? parsed.getFullYear() : now.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed ? parsed.getMonth() : now.getMonth(),
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    parsed ? parsed.getDate() : null,
  );
  const [selectedHour, setSelectedHour] = useState(
    parsed ? String(parsed.getHours()).padStart(2, "0") : "09",
  );
  const [selectedMinute, setSelectedMinute] = useState(
    parsed
      ? parsed.getMinutes() < 8
        ? "00"
        : parsed.getMinutes() < 23
          ? "15"
          : parsed.getMinutes() < 38
            ? "30"
            : "45"
      : "00",
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const commit = (day: number, hour: string, minute: string) => {
    const d = new Date(
      viewYear,
      viewMonth,
      day,
      parseInt(hour),
      parseInt(minute),
    );
    const pad = (n: number) => String(n).padStart(2, "0");
    onChange(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
    );
  };

  const bg = isDark ? "#273570" : "#F8FAFC";
  const popBg = isDark ? "#1e2d5e" : "#ffffff";
  const border = isDark ? "#2d3e7a" : "#E5E7EB";
  const textColor = isDark ? "#fff" : "#000";
  const mutedColor = "#989898";
  const accentColor = "#2EBCCC";

  const displayValue = selectedDay
    ? `${MONTHS[viewMonth]} ${selectedDay}, ${viewYear}  ${selectedHour}:${selectedMinute}`
    : "";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: bg,
          border: `1.5px solid ${border}`,
          color: displayValue ? textColor : mutedColor,
          borderRadius: 10,
          padding: "10px 14px 10px 36px",
          fontSize: "0.875rem",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
        onBlur={(e) => (e.currentTarget.style.borderColor = border)}
      >
        <span>{displayValue || "Select date & time"}</span>
        <ChevronDown
          size={14}
          style={{ color: mutedColor, flexShrink: 0, marginLeft: 8 }}
        />
      </button>
      <Calendar
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: accentColor }}
      />

      {open && (
        <div
          className="ns-dropdown-open absolute z-30 mt-2 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: popBg,
            border: `1.5px solid ${border}`,
            width: "min(320px, 90vw)",
            right: 0,
          }}
        >
          <div style={{ padding: "14px 16px 8px" }}>
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else setViewMonth((m) => m - 1);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: accentColor,
                  padding: 4,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: textColor,
                }}
              >
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else setViewMonth((m) => m + 1);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: accentColor,
                  padding: 4,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: "center",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: mutedColor,
                    padding: "4px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => {
                  const isSelected = selectedDay === day;
                  const isToday =
                    now.getDate() === day &&
                    now.getMonth() === viewMonth &&
                    now.getFullYear() === viewYear;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setSelectedDay(day);
                        commit(day, selectedHour, selectedMinute);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        border:
                          isToday && !isSelected
                            ? `1.5px solid ${accentColor}`
                            : "none",
                        background: isSelected ? accentColor : "transparent",
                        color: isSelected ? "#fff" : textColor,
                        fontSize: "0.8rem",
                        fontWeight: isSelected ? 700 : 400,
                        cursor: "pointer",
                        transition: "background 0.15s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            "rgba(46,188,204,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {day}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div
            style={{
              borderTop: `1px solid ${border}`,
              padding: "10px 16px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Clock size={14} style={{ color: accentColor, flexShrink: 0 }} />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: textColor,
                minWidth: 36,
              }}
            >
              Time
            </span>
            <select
              value={selectedHour}
              onChange={(e) => {
                setSelectedHour(e.target.value);
                if (selectedDay)
                  commit(selectedDay, e.target.value, selectedMinute);
              }}
              style={{
                background: isDark ? "#273570" : "#F8FAFC",
                border: `1.5px solid ${border}`,
                color: textColor,
                borderRadius: 8,
                padding: "5px 8px",
                fontSize: "0.82rem",
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span style={{ color: mutedColor, fontWeight: 700 }}>:</span>
            <select
              value={selectedMinute}
              onChange={(e) => {
                setSelectedMinute(e.target.value);
                if (selectedDay)
                  commit(selectedDay, selectedHour, e.target.value);
              }}
              style={{
                background: isDark ? "#273570" : "#F8FAFC",
                border: `1.5px solid ${border}`,
                color: textColor,
                borderRadius: 8,
                padding: "5px 8px",
                fontSize: "0.82rem",
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginLeft: "auto",
                background: accentColor,
                border: "none",
                color: "#fff",
                borderRadius: 8,
                padding: "5px 14px",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const StepIndicator = ({
  current,
  total,
  labels,
  isDark,
}: {
  current: number;
  total: number;
  labels: string[];
  isDark: boolean;
}) => (
  <div className="flex items-center justify-center gap-0 mb-8 md:hidden">
    {Array.from({ length: total }).map((_, i) => {
      const active = i + 1 === current;
      const done = i + 1 < current;
      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: done
                  ? "#4AA825"
                  : active
                    ? "#2EBCCC"
                    : isDark
                      ? "#273570"
                      : "#E5E7EB",
                color: done || active ? "#fff" : "#989898",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className="text-[10px] font-semibold whitespace-nowrap"
              style={{ color: active ? "#2EBCCC" : "#989898" }}
            >
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className="w-10 h-0.5 mb-4 mx-1 transition-all duration-300"
              style={{
                background: done ? "#4AA825" : isDark ? "#273570" : "#E5E7EB",
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

const SectionCard = ({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) => (
  <div
    className="rounded-2xl border p-6 ns-section-reveal"
    style={{
      background: isDark ? "#1e2d5e" : "#ffffff",
      borderColor: isDark ? "#273570" : "#E5E7EB",
      borderLeft: "4px solid #2EBCCC",
    }}
  >
    <h2
      className="text-base font-bold mb-5"
      style={{ color: isDark ? "#fff" : "#000" }}
    >
      {title}
    </h2>
    {children}
  </div>
);

const InputField = ({
  label,
  children,
  error,
  isDark,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  isDark: boolean;
}) => (
  <div className="flex flex-col gap-1.5 mb-4">
    {label && (
      <label
        className="text-sm font-semibold"
        style={{ color: isDark ? "#fff" : "#000" }}
      >
        {label}
      </label>
    )}
    {children}
    {error && (
      <span className="text-xs font-medium" style={{ color: "#FF4444" }}>
        {error}
      </span>
    )}
  </div>
);

const inputStyles = (isDark: boolean, hasError?: boolean) => ({
  background: isDark ? "#273570" : "#F8FAFC",
  border: `1.5px solid ${hasError ? "#FF4444" : isDark ? "#2d3e7a" : "#E5E7EB"}`,
  color: isDark ? "#fff" : "#000",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
});

const NewServiceScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { t } = useI18n();
  const ns = t("newservice");

  const [mobileStep, setMobileStep] = useState(1);
  const [_prevStep, setPrevStep] = useState(1);
  const [stepDirection, setStepDirection] = useState<"forward" | "back">(
    "forward",
  );
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryClosing, setCategoryClosing] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        if (categoryOpen) closeCategoryDropdown();
      }
      if (
        currencyRef.current &&
        !currencyRef.current.contains(e.target as Node)
      ) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [categoryOpen, currencyOpen]);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    budget: "",
    currency: "MXN",
    photos: [],
  });

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = (step: number): boolean => {
    const e: ValidationErrors = {};
    if (step === 1) {
      if (!form.title.trim()) e.title = ns.validation.titleRequired;
      if (!form.category) e.category = ns.validation.categoryRequired;
      if (!form.description.trim())
        e.description = ns.validation.descriptionRequired;
    }
    if (step === 2) {
      if (!form.location.trim()) e.location = ns.validation.locationRequired;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (next: number, direction: "forward" | "back") => {
    setStepDirection(direction);
    setAnimatingStep(mobileStep);
    setTimeout(() => {
      setPrevStep(mobileStep);
      setMobileStep(next);
      setAnimatingStep(null);
    }, 220);
  };

  const handleNext = () => {
    if (validateStep(mobileStep))
      goToStep(Math.min(mobileStep + 1, TOTAL_STEPS), "forward");
  };

  const handleBack = () => {
    setErrors({});
    goToStep(Math.max(mobileStep - 1, 1), "back");
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...arr].slice(0, 6),
    }));
  };

  const removePhoto = (i: number) =>
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = () => {
    if (!validateStep(mobileStep)) return;
    console.log("Submit:", form);
  };

  const handleClearForm = () => {
    setForm({ title: "", category: "", description: "", location: "", date: "", budget: "", currency: "MXN", photos: [] });
    setErrors({});
    setMobileStep(1);
    setShowClearModal(false);
  };

  const closeCategoryDropdown = () => {
    setCategoryClosing(true);
    setTimeout(() => {
      setCategoryOpen(false);
      setCategoryClosing(false);
    }, 160);
  };

  const stepLabels = [ns.steps.step1, ns.steps.step2, ns.steps.step3];

  const stepAnimClass = (step: number) => {
    if (animatingStep === step) {
      return stepDirection === "forward"
        ? "ns-step-exit-left"
        : "ns-step-exit-right";
    }
    if (mobileStep === step && animatingStep === null) {
      return stepDirection === "forward"
        ? "ns-step-enter-right"
        : "ns-step-enter-left";
    }
    return "";
  };

  const isMobileStep = (step: number) =>
    mobileStep === step || animatingStep === step;

  const CategoryDropdown = (
    <InputField
      label={ns.basicInfo.categoryLabel}
      error={errors.category}
      isDark={isDark}
    >
      <div className="relative" ref={categoryRef}>
        <button
          type="button"
          onClick={() => {
            if (categoryOpen) closeCategoryDropdown();
            else setCategoryOpen(true);
          }}
          style={{
            ...inputStyles(isDark, !!errors.category),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            textAlign: "left",
            color: form.category ? (isDark ? "#fff" : "#000") : "#989898",
            border: `2px solid ${errors.category ? "#FF4444" : form.category ? "#2EBCCC" : isDark ? "#3a4f8a" : "#CBD5E1"}`,
            paddingLeft: 36,
            position: "relative",
          }}
        >
          <Tag
            size={15}
            style={{
              position: "absolute",
              left: 12,
              color: form.category ? "#2EBCCC" : "#989898",
              flexShrink: 0,
              pointerEvents: "none",
            }}
          />
          <span style={{ flex: 1 }}>{form.category || ns.basicInfo.categoryPlaceholder}</span>
          <ChevronDown
            size={16}
            style={{
              color: form.category ? "#2EBCCC" : "#989898",
              transform: categoryOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              flexShrink: 0,
            }}
          />
        </button>
        {(categoryOpen || categoryClosing) && (
          <div
            className={`absolute z-20 w-full rounded-xl overflow-hidden mt-1 shadow-xl ${categoryClosing ? "ns-dropdown-close" : "ns-dropdown-open"}`}
            style={{
              background: isDark ? "#1e2d5e" : "#fff",
              border: `1.5px solid ${isDark ? "#273570" : "#E5E7EB"}`,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {ns.categories.map((cat: string) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  set("category", cat);
                  closeCategoryDropdown();
                  setErrors((e) => ({ ...e, category: undefined }));
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color: isDark ? "#fff" : "#000",
                  background:
                    form.category === cat
                      ? "rgba(46,188,204,0.15)"
                      : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    form.category === cat
                      ? "rgba(46,188,204,0.15)"
                      : "transparent")
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </InputField>
  );

  const BudgetInput = (
    <InputField label={ns.details.budgetLabel ?? "Budget"} isDark={isDark}>
      <div className="relative flex items-center">
        <DollarSign
          size={16}
          className="absolute left-3 pointer-events-none z-10"
          style={{ color: "#2EBCCC" }}
        />
        <input
          type="number"
          placeholder={ns.details.budgetPlaceholder}
          value={form.budget}
          onChange={(e) => set("budget", e.target.value)}
          style={
            {
              ...inputStyles(isDark),
              paddingLeft: 36,
              paddingRight: 84,
              appearance: "textfield",
              MozAppearance: "textfield",
              WebkitAppearance: "none",
            } as React.CSSProperties
          }
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2EBCCC")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = isDark ? "#2d3e7a" : "#E5E7EB")
          }
        />
        <div
          className="absolute right-0 h-full flex items-center"
          style={{ paddingRight: 4 }}
        >
          <div className="relative" ref={currencyRef}>
            <button
              type="button"
              onClick={() => setCurrencyOpen((o) => !o)}
              style={{
                background: isDark ? "#1e2d5e" : "#E5E7EB",
                border: "none",
                color: isDark ? "#fff" : "#000",
                borderRadius: 7,
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              {form.currency}
              <ChevronDown
                size={11}
                style={{
                  color: "#989898",
                  transform: currencyOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>
            {currencyOpen && (
              <div
                className="absolute right-0 top-full mt-1 rounded-xl shadow-xl overflow-hidden ns-currency-slide z-30"
                style={{
                  background: isDark ? "#1e2d5e" : "#fff",
                  border: `1.5px solid ${isDark ? "#273570" : "#E5E7EB"}`,
                  minWidth: 72,
                }}
              >
                {(["MXN", "USD"] as const).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, currency: cur }));
                      setCurrencyOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      textAlign: "left",
                      background:
                        form.currency === cur
                          ? "rgba(46,188,204,0.15)"
                          : "transparent",
                      border: "none",
                      color: isDark ? "#fff" : "#000",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(46,188,204,0.10)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        form.currency === cur
                          ? "rgba(46,188,204,0.15)"
                          : "transparent")
                    }
                  >
                    {cur}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}`}</style>
    </InputField>
  );

  const BasicInfoSection = (
    <SectionCard title={ns.basicInfo.sectionTitle} isDark={isDark}>
      <InputField
        label={ns.basicInfo.titleLabel}
        error={errors.title}
        isDark={isDark}
      >
        <input
          type="text"
          placeholder={ns.basicInfo.titlePlaceholder}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          style={inputStyles(isDark, !!errors.title)}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2EBCCC")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.title
              ? "#FF4444"
              : isDark
                ? "#2d3e7a"
                : "#E5E7EB")
          }
        />
      </InputField>

      {CategoryDropdown}

      <InputField
        label={ns.basicInfo.descriptionLabel}
        error={errors.description}
        isDark={isDark}
      >
        <div className="relative">
          <textarea
            rows={5}
            placeholder={ns.basicInfo.descriptionPlaceholder}
            value={form.description}
            onChange={(e) => set("description", e.target.value.slice(0, 500))}
            className="ns-textarea-desc"
            style={{
              ...inputStyles(isDark, !!errors.description),
              resize: "vertical",
              minHeight: 110,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2EBCCC")}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.description
                ? "#FF4444"
                : isDark
                  ? "#2d3e7a"
                  : "#E5E7EB")
            }
          />
          <span
            className="absolute bottom-3 right-3 text-xs"
            style={{ color: "#989898" }}
          >
            {form.description.length}/500 {ns.basicInfo.descriptionLimit}
          </span>
        </div>
      </InputField>
    </SectionCard>
  );

  const DetailsContent = (
    <>
      <InputField
        label={ns.details.locationLabel ?? "Location"}
        error={errors.location}
        isDark={isDark}
      >
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#2EBCCC" }}
          />
          <input
            type="text"
            placeholder={ns.details.locationPlaceholder}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            style={{
              ...inputStyles(isDark, !!errors.location),
              paddingLeft: 36,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2EBCCC")}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.location
                ? "#FF4444"
                : isDark
                  ? "#2d3e7a"
                  : "#E5E7EB")
            }
          />
        </div>
      </InputField>

      <div
        className="rounded-xl overflow-hidden mb-4 relative"
        style={{ height: 140, background: isDark ? "#273570" : "#E5E7EB" }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="text-xs font-medium px-4 py-1.5 rounded-full"
            style={{
              background: isDark ? "#1B244C" : "#fff",
              color: "#989898",
            }}
          >
            Map preview
          </div>
        </div>
        <button
          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white"
          style={{ background: "#2EBCCC" }}
        >
          {ns.details.changeLocation}
        </button>
      </div>

      <InputField label={ns.details.dateLabel ?? "Date & Time"} isDark={isDark}>
        <div className="relative w-full">
          <CustomDateTimePicker
            value={form.date}
            onChange={(v) => set("date", v)}
            isDark={isDark}
          />
        </div>
      </InputField>

      {BudgetInput}
    </>
  );

  const DeletePhotoButton = ({ onDelete }: { onDelete: () => void }) => {
    const [clicking, setClicking] = useState(false);

    const handleClick = () => {
      setClicking(true);
      setTimeout(onDelete, 180);
    };

    return (
      <motion.button
        onClick={handleClick}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={clicking ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
        transition={clicking ? { duration: 0.18, ease: [0.23, 1, 0.32, 1] } : { type: "spring", duration: 0.28, bounce: 0.25 }}
        whileHover={clicking ? {} : { scale: 1.12 }}
        whileTap={clicking ? {} : { scale: 0.9 }}
        style={{
          background: "rgba(220, 38, 38, 0.88)",
          border: "none",
          borderRadius: "50%",
          width: 28,
          height: 28,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
          padding: 0,
        }}
      >
        <X size={13} color="#fff" strokeWidth={2.8} />
      </motion.button>
    );
  };

  const PhotosSection = (
    <div
      className="rounded-2xl border ns-section-reveal"
      style={{
        background: isDark ? "#1e2d5e" : "#ffffff",
        borderColor: isDark ? "#273570" : "#E5E7EB",
        borderLeft: "4px solid #2EBCCC",
        padding: "20px 24px",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-base font-bold"
          style={{ color: isDark ? "#fff" : "#000" }}
        >
          {ns.photos.sectionTitle}
        </h2>
        {form.photos.length > 0 && (
          <span className="text-xs font-semibold" style={{ color: "#989898" }}>
            {form.photos.length}/6
          </span>
        )}
      </div>

      <div
        className="relative w-full rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: isDark ? "#131d3f" : "#F0F4F8",
          border: `1px solid ${isDark ? "#273570" : "#E5E7EB"}`,
          padding: "1.5px",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: isDark ? "#1a2550" : "#F8FAFC", padding: 6 }}
        >
          <div
            className={`relative rounded-lg overflow-hidden transition-all duration-300${form.photos.length === 0 ? " ns-photo-upload-empty" : ""}`}
            style={{
              border: `1px solid ${dragOver ? "#2EBCCC" : isDark ? "#273570" : "#E5E7EB"}`,
              background: isDark ? "#1e2d5e" : "#ffffff",
              minHeight: form.photos.length === 0 ? 220 : "auto",
            }}
          >
            {dragOver && (
              <>
                <div
                  className="absolute inset-x-0 top-0 h-1/4 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(46,188,204,0.12), transparent)",
                  }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(46,188,204,0.12), transparent)",
                  }}
                />
                <div
                  className="absolute inset-y-0 left-0 w-1/4 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(46,188,204,0.12), transparent)",
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 w-1/4 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(46,188,204,0.12), transparent)",
                  }}
                />
                <div
                  className="absolute inset-[20%] rounded-lg pointer-events-none"
                  style={{
                    background: "rgba(46,188,204,0.04)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </>
            )}

            {form.photos.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-4 p-8 ns-photo-inner-empty"
                style={{ minHeight: 220 }}
              >
                <motion.div
                  animate={{ y: dragOver ? -6 : 0, scale: dragOver ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div className="relative w-16 h-16 ns-upload-icon">
                    <svg
                      fill="none"
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        stroke={isDark ? "#273570" : "#E5E7EB"}
                        cx="50"
                        cy="50"
                        r="45"
                        strokeDasharray="4 4"
                        strokeWidth="2"
                      >
                        <animateTransform
                          attributeName="transform"
                          dur="60s"
                          from="0 50 50"
                          repeatCount="indefinite"
                          to="360 50 50"
                          type="rotate"
                        />
                      </circle>
                      <path
                        fill="rgba(46,188,204,0.15)"
                        stroke="#2EBCCC"
                        d="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
                        strokeWidth="2"
                      >
                        <animate
                          attributeName="d"
                          dur="2s"
                          repeatCount="indefinite"
                          values="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z;M30 38H70C75 38 75 43 75 43V68C75 73 70 73 70 73H30C25 73 25 68 25 68V43C25 38 30 38 30 38Z;M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
                        />
                      </path>
                      <path
                        stroke="#2EBCCC"
                        d="M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35"
                        fill="none"
                        strokeWidth="2"
                      />
                      <g style={{ transform: "translateY(2px)" }}>
                        <line
                          stroke="#2EBCCC"
                          strokeLinecap="round"
                          strokeWidth="2"
                          x1="50"
                          x2="50"
                          y1="45"
                          y2="60"
                        >
                          <animate
                            attributeName="y2"
                            dur="2s"
                            repeatCount="indefinite"
                            values="60;55;60"
                          />
                        </line>
                        <polyline
                          stroke="#2EBCCC"
                          fill="none"
                          points="42,52 50,45 58,52"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <animate
                            attributeName="points"
                            dur="2s"
                            repeatCount="indefinite"
                            values="42,52 50,45 58,52;42,47 50,40 58,47;42,52 50,45 58,52"
                          />
                        </polyline>
                      </g>
                    </svg>
                  </div>
                </motion.div>

                <div className="space-y-2 text-center">
                  <h3
                    className="font-semibold text-base"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    {ns.photos.uploadTitle}
                  </h3>
                  <p className="text-xs" style={{ color: "#989898" }}>
                    {ns.photos.uploadHint}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    width: "80%",
                    padding: "10px 16px",
                    background: isDark ? "rgba(46,188,204,0.15)" : "#E8F8FA",
                    color: "#2EBCCC",
                    border: `1.5px solid rgba(46,188,204,0.3)`,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = isDark
                      ? "rgba(46,188,204,0.25)"
                      : "#d0f1f7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isDark
                      ? "rgba(46,188,204,0.15)"
                      : "#E8F8FA")
                  }
                >
                  {ns.photos.uploadButton}
                  <UploadCloud size={16} />
                </button>

                <p className="text-xs" style={{ color: "#989898" }}>
                  {ns.photos.uploadSubtitle}
                </p>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex flex-wrap gap-3 mb-4">
                  {form.photos.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="relative rounded-xl overflow-hidden group"
                      style={{ width: 80, height: 80, flexShrink: 0 }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        <DeletePhotoButton onDelete={() => removePhoto(i)} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {form.photos.length < 6 && (
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
                    style={{
                      border: `1.5px dashed ${dragOver ? "#2EBCCC" : isDark ? "#273570" : "#D1D5DB"}`,
                      background: dragOver
                        ? "rgba(46,188,204,0.06)"
                        : "transparent",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(46,188,204,0.15)" }}
                    >
                      <UploadCloud size={16} color="#2EBCCC" />
                    </div>
                    <p className="text-xs" style={{ color: "#989898" }}>
                      {ns.photos.addMoreHint}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );

  const ActionBar = ({ isLast }: { isLast: boolean }) => (
    <div className="flex gap-3 mt-6 md:hidden">
      {mobileStep > 1 && (
        <button
          onClick={handleBack}
          className="flex-1 h-11 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          style={{
            borderColor: isDark ? "#273570" : "#E5E7EB",
            color: isDark ? "#fff" : "#000",
            background: "transparent",
          }}
        >
          <ArrowLeft size={15} />
          {ns.actions.back}
        </button>
      )}
      <button
        onClick={isLast ? handleSubmit : handleNext}
        className="flex-1 h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
        style={{ background: "#2EBCCC" }}
      >
        {isLast ? (
          <>
            {ns.actions.postService}
            <Send size={15} />
          </>
        ) : (
          <>
            {ns.actions.next}
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .ns-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          --text: ${isDark ? "#ffffff" : "#000000"};
          --text-secondary: #989898;
          --divider: ${isDark ? "#273570" : "#e5e7eb"};
        }
        .post-btn-desktop:hover { background: #239aaa !important; box-shadow: 0 4px 14px rgba(46,188,204,0.45) !important; }
        .post-btn-desktop:active { transform: scale(0.97) !important; }
        @media (min-width: 768px) {
          .ns-textarea-desc { min-height: 110px !important; max-height: 320px !important; }
          .ns-photo-upload-empty { min-height: 160px !important; }
          .ns-photo-inner-empty { min-height: 160px !important; padding: 12px 16px !important; gap: 8px !important; }
          .ns-upload-icon { width: 44px !important; height: 44px !important; }
        }
      `}</style>

      <div
        className="ns-root page-enter"
        style={{
          background: "var(--main-bg)",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="w-full px-6 py-6 md:py-6 md:px-12 flex flex-col flex-1 min-h-0 overflow-y-auto"
          style={{ scrollbarWidth: "thin", maxWidth: "100vw", margin: "0 auto" }}
        >
          <div className="mb-4 md:mb-5 mt-5">
            <h1
              className="text-2xl md:text-3xl font-extrabold"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              {ns.title}
            </h1>
            <p
              className="mt-1 text-sm md:text-base"
              style={{ color: "#989898" }}
            >
              {ns.subtitle}
            </p>
          </div>

          <StepIndicator
            current={mobileStep}
            total={TOTAL_STEPS}
            labels={stepLabels}
            isDark={isDark}
          />

          <div className="md:grid md:grid-cols-[1fr_420px] md:gap-8 md:items-start flex-1">
            <div className="flex flex-col gap-6">
              <div
                className={`${!isMobileStep(1) ? "hidden md:block" : ""} ${stepAnimClass(1)}`}
              >
                {BasicInfoSection}
              </div>
              <div
                className={`${!isMobileStep(3) ? "hidden md:block" : ""} ${stepAnimClass(3)}`}
              >
                {PhotosSection}
              </div>
            </div>

            <div
              className={`${!isMobileStep(2) ? "hidden md:block" : ""} ${stepAnimClass(2)}`}
            >
              <SectionCard title={ns.details.sectionTitle} isDark={isDark}>
                {DetailsContent}
                <button
                  className="post-btn-desktop w-full h-12 rounded-xl font-bold text-white hidden md:flex items-center justify-center gap-2 mt-2 transition-colors"
                  style={{ background: "#2EBCCC" }}
                  onClick={handleSubmit}
                >
                  {ns.actions.postService}
                  <Send size={16} />
                </button>
                <button
                  onClick={() => setShowClearModal(true)}
                  className="w-full mt-3 text-sm font-semibold hidden md:flex items-center justify-center gap-1.5 rounded-xl transition-all"
                  style={{
                    color: "#989898",
                    background: "none",
                    border: "1.5px solid transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: "8px 0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FF4444";
                    e.currentTarget.style.borderColor = "rgba(255,68,68,0.25)";
                    e.currentTarget.style.background = "rgba(255,68,68,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#989898";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  {ns.actions.cancel ?? "Eliminar formulario"}
                </button>
              </SectionCard>
            </div>
          </div>

          <ActionBar isLast={mobileStep === TOTAL_STEPS} />
        </div>
      </div>

      {showClearModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowClearModal(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? "#1e2d5e" : "#fff",
              borderRadius: 18,
              padding: "28px 24px 24px",
              maxWidth: 360,
              width: "90vw",
              border: `1.5px solid ${isDark ? "#273570" : "#E5E7EB"}`,
              boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(255,68,68,0.12)" }}
            >
              <X size={18} color="#FF4444" strokeWidth={2.5} />
            </div>
            <h3 style={{ color: isDark ? "#fff" : "#000", fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>
              ¿Eliminar formulario?
            </h3>
            <p style={{ color: "#989898", fontSize: "0.875rem", margin: "0 0 20px", lineHeight: 1.55 }}>
              Se limpiarán todos los campos y las fotos. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                style={{
                  flex: 1, height: 40, borderRadius: 10,
                  border: `1.5px solid ${isDark ? "#273570" : "#E5E7EB"}`,
                  background: "transparent",
                  color: isDark ? "#fff" : "#000",
                  fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Cancelar
              </button>
              <button
                onClick={handleClearForm}
                style={{
                  flex: 1, height: 40, borderRadius: 10,
                  border: "none",
                  background: "#FF4444",
                  color: "#fff",
                  fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e03535")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#FF4444")}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default NewServiceScreen;
