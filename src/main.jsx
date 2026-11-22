import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { isConfigured } from "./lib/supabase";
import "./index.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

function MissingConfig() {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "80px auto", padding: 16 }}>
      <h1>Falta configuración</h1>
      <p>
        Define <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> (archivo <code>.env</code> en local o
        variables de entorno en Netlify). Consulta el README.
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isConfigured ? (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    ) : (
      <MissingConfig />
    )}
  </React.StrictMode>,
);
