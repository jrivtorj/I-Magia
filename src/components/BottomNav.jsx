import { Link, useLocation } from "react-router-dom";
import { Library, PlusCircle } from "lucide-react";

export default function BottomNav() {
  const { pathname } = useLocation();
  const onCreate = pathname === "/";
  const onStories = pathname.startsWith("/mis-cuentos") || pathname.startsWith("/story");
  const item = (active) =>
    `flex-1 flex flex-col items-center justify-center py-3 gap-1 select-none transition-colors duration-150 ${
      active ? "text-primary" : "text-muted-foreground"
    }`;
  const icon = (active) =>
    `w-6 h-6 transition-transform duration-150 ${active ? "scale-110" : "scale-100"}`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        <Link to="/" className={item(onCreate)}>
          <PlusCircle className={icon(onCreate)} />
          <span className="text-xs font-body font-semibold">Crear</span>
        </Link>
        <Link to="/mis-cuentos" className={item(onStories)}>
          <Library className={icon(onStories)} />
          <span className="text-xs font-body font-semibold">Mis Cuentos</span>
        </Link>
      </div>
    </nav>
  );
}
