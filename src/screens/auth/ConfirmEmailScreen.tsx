import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ROUTES } from "../../router/routes";
import { useI18n } from "../../i18n";
import { apiPostPublic, ApiError } from "../../api/apiClient";
import "../../styles/animations.global.css";

type Status = "verifying" | "success" | "error";

const ConfirmEmailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const c = t("confirmemailscreen");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    apiPostPublic("/api/usuarios/confirm-email/", { token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMessage(err instanceof ApiError ? err.message : null);
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F6F8F8] dark:bg-[#1B244C]">
      <div className="w-full max-w-md rounded-[2rem] border border-[#E5E7EB] bg-white p-10 text-center shadow-[0_24px_60px_rgba(27,36,76,0.1)] animate-scale-in">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 bg-[#2EBCCC]/12 rounded-[22px] flex items-center justify-center mx-auto mb-6">
              <Loader2 size={30} className="text-[#2EBCCC] animate-spin" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-[#1B244C] mb-2">
              {c.verifying.title}
            </h1>
            <p className="text-[0.9375rem] text-slate-500">{c.verifying.body}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-[#2EBCCC]/12 rounded-[22px] flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 size={30} className="text-[#2EBCCC]" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-[#1B244C] mb-2">
              {c.success.title}
            </h1>
            <p className="text-[0.9375rem] text-slate-500 mb-8">{c.success.body}</p>
            <button
              onClick={() => navigate(ROUTES.AUTH, { replace: true })}
              className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] active:scale-[0.98] text-white font-extrabold text-[0.9375rem] py-4 rounded-2xl border-none cursor-pointer shadow-[0_8px_24px_#2EBCCC44] transition-[transform,background-color] duration-150 ease-out"
            >
              {c.success.cta}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-400/12 rounded-[22px] flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <XCircle size={30} className="text-red-400" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight text-[#1B244C] mb-2">
              {c.error.title}
            </h1>
            <p className="text-[0.9375rem] text-slate-500 mb-8">
              {errorMessage ?? c.error.title}
            </p>
            <button
              onClick={() => navigate(ROUTES.AUTH, { replace: true })}
              className="w-full bg-[#2EBCCC] hover:bg-[#239aaa] active:scale-[0.98] text-white font-extrabold text-[0.9375rem] py-4 rounded-2xl border-none cursor-pointer shadow-[0_8px_24px_#2EBCCC44] transition-[transform,background-color] duration-150 ease-out"
            >
              {c.error.cta}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailScreen;
