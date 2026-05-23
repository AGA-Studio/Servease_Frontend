import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import { useAuth } from "./context/AuthContext";
import "./App.css";


function App() {
  useEffect(() => {
    const saved = localStorage.getItem("servease-theme") as
      | "light"
      | "dark"
      | null;
    const theme = saved ?? "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  const AppRouterWithGuard: React.FC = () => {
    const { isLoading } = useAuth();
    if (isLoading) return null;
    return <AppRouter />;
  };

  return (
    <AuthProvider>
      <AppRouterWithGuard />
    </AuthProvider>
  );
}

export default App;
