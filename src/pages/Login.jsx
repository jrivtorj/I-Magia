import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const GOOGLE_ENABLED = import.meta.env.VITE_ENABLE_GOOGLE === "true";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-0.5" aria-hidden="true">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

export default function Login() {
  const { user } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");
  const authError = (() => {
    const params = new URLSearchParams(location.search || location.hash.replace(/^#/, ""));
    return params.get("error_description") || params.get("error");
  })();

  if (user) return <Navigate to={location.state?.from || "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + (location.state?.from || "/") },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  };

  const google = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + (location.state?.from || "/") },
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-xl p-6 space-y-5">
        <div className="text-center space-y-2">
          <img src="/logo-small.png" alt="" className="w-16 h-16 rounded-2xl mx-auto" />
          <h1 className="font-heading font-bold text-2xl">I-magIA</h1>
          <p className="font-body text-sm text-muted-foreground">
            Crea cuentos mágicos con pictogramas ✨
          </p>
        </div>

        {status === "sent" ? (
          <p className="font-body text-sm text-center bg-accent/10 text-accent rounded-2xl p-4">
            Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo para entrar.
          </p>
        ) : (
          <div className="space-y-3">
            {GOOGLE_ENABLED && (
              <>
                <Button onClick={google} className="w-full rounded-2xl font-heading gap-2 h-12 text-base">
                  <GoogleIcon /> Entrar con Google
                </Button>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                  <span className="h-px flex-1 bg-border" /> o con tu correo <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-2.5 rounded-2xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button
                type="submit"
                variant={GOOGLE_ENABLED ? "outline" : "default"}
                disabled={status === "sending"}
                className="w-full rounded-2xl font-heading gap-2 h-11"
              >
                <Mail className="w-4 h-4" />
                {status === "sending" ? "Enviando..." : "Entrar con enlace por correo"}
              </Button>
              {status === "error" && <p className="text-xs text-destructive font-body text-center">{error}</p>}
            </form>
          </div>
        )}
        {authError && status !== "sent" && (
          <p className="text-xs text-destructive font-body text-center bg-destructive/10 rounded-xl p-3">
            No se pudo iniciar sesión: {authError}
          </p>
        )}
        <p className="text-center font-body text-xs text-muted-foreground/50">Aula Digital Studio</p>
      </div>
    </div>
  );
}
