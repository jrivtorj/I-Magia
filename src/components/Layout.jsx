import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background font-body" style={{ overscrollBehaviorY: "none" }}>
      <Header />
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
