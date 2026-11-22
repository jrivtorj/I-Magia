import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { user } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

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
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-2.5 rounded-2xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button type="submit" disabled={status === "sending"} className="w-full rounded-2xl font-heading gap-2 h-11">
              <Mail className="w-4 h-4" />
              {status === "sending" ? "Enviando..." : "Entrar con enlace por correo"}
            </Button>
            {import.meta.env.VITE_ENABLE_GOOGLE === "true" && (
              <Button variant="outline" onClick={google} className="w-full rounded-2xl font-body h-11">
                Entrar con Google
              </Button>
            )}
            {status === "error" && <p className="text-xs text-destructive font-body text-center">{error}</p>}
          </form>
        )}
        <p className="text-center font-body text-xs text-muted-foreground/50">Aula Digital Studio</p>
      </div>
    </div>
  );
}
