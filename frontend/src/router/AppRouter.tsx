import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import MyMatch from "../pages/MyMatch";
import Copilot from "../pages/Copilot";
import Navigation from "../pages/Navigation";
import Emergency from "../pages/Emergency";
import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/match" element={<MyMatch />} />

        <Route path="/copilot" element={<Copilot />} />

        <Route
          path="/navigation"
          element={<Navigation />}
        />

        <Route
          path="/emergency"
          element={<Emergency />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Default */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}