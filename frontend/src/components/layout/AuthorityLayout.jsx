import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import GovernmentTopBar from "../common/GovernmentTopBar";
import GovernmentFooter from "../common/GovernmentFooter";
import Toast from "../common/Toast";

export default function AuthorityLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="portal-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="authority"
      />

      <div className="portal-main-area">
        <GovernmentTopBar role="authority" />
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          role="authority"
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
