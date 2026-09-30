import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import GovernmentTopBar from "../common/GovernmentTopBar";
import GovernmentFooter from "../common/GovernmentFooter";
import Toast from "../common/Toast";

export default function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="portal-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="citizen"
      />

      <div className="portal-main-area">
        <GovernmentTopBar role="citizen" />
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          role="citizen"
        />

        <main className="portal-content" style={{ flex: 1 }}>
          <Outlet />
        </main>

        <GovernmentFooter />
      </div>

      <Toast />
    </div>
  );
}
