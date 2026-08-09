import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { I18nProvider } from "./i18n";
import { CurrencyProvider } from "./context/CurrencyContext";

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </I18nProvider>,
);
