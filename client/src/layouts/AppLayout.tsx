import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { AiAssistantWidget } from "../components/AiAssistantWidget";
import { Project } from "../types";
import { getProjectsApi } from "../api/projects";

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjectsApi()
      .then((res) => {
        if (res && res.projects) {
          setProjects(res.projects);
        }
      })
      .catch((err) => {
        console.warn("AiAssistantWidget failed to preload projects:", err);
      });
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="app-main">
        <TopHeader
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Floating Intelligence AI Assistant */}
      <AiAssistantWidget projects={projects} />
    </div>
  );
};
