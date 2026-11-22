import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <p className="text-6xl">🧭</p>
        <h1 className="font-heading font-bold text-2xl">Página no encontrada</h1>
        <Link to="/">
          <Button className="rounded-2xl font-heading">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
