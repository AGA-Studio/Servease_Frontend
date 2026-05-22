import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
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

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
