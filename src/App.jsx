import { Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import RequireAuth from "@/components/RequireAuth";
import Home from "@/pages/Home";
import MyStories from "@/pages/MyStories";
import StoryView from "@/pages/StoryView";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        {/* Público: así funcionan los enlaces compartidos */}
        <Route path="/story/:id" element={<StoryView />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/mis-cuentos" element={<MyStories />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
