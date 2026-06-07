import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../router/routes";

const PrivacyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/" : ROUTES.AUTH);
    }
  };

  return (
    <div className="page-enter min-h-screen bg-[var(--main-bg)] text-[var(--text)] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#2EBCCC] font-bold mb-8 bg-transparent border-none cursor-pointer p-0 hover:text-[#239aaa] transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)] mb-8">Last updated: May 2025</p>
        <div className="prose max-w-none text-[var(--text)] space-y-4 leading-7">
          <p>
            Content coming soon. The full privacy policy document will be available here once uploaded.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;