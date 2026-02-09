import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { NotificationProvider } from "./components/NotificationCenter.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
