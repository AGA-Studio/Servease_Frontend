import { useEffect } from "react";
import AuthScreen from "./screens/auth/AuthScreen";
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
    <main className="min-h-screen w-full">
      <AuthScreen />
    </main>
  );
}

export default App;
