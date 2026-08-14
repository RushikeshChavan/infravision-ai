import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { USER_ROLES } from "../types";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { AppLayout } from "../layouts/AppLayout";

// Auth Pages
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

// Main & Dashboard Pages
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { ProjectsListPage } from "../pages/projects/ProjectsListPage";
import { ProjectDetailPage } from "../pages/projects/ProjectDetailPage";

// Admin Pages
import { UsersPage } from "../pages/admin/UsersPage";
import { ContractorsPage } from "../pages/admin/ContractorsPage";
import { BudgetsPage } from "../pages/admin/BudgetsPage";

// Citizen Page
import { CitizenPortalPage } from "../pages/citizen/CitizenPortalPage";

// Common Pages
import { MapPage } from "../pages/common/MapPage";
import { MilestonesPage } from "../pages/common/MilestonesPage";
import { InspectionsPage } from "../pages/common/InspectionsPage";
import { DocumentsPage } from "../pages/common/DocumentsPage";
import { NotFoundPage } from "../pages/common/NotFoundPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default route */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />

        {/* GIS Map */}
        <Route path="/map" element={<MapPage />} />

        {/* Admin Only Routes */}
        <Route
          path="/admin/users"
          element={
            <RoleRoute
              allowedRoles={[
                USER_ROLES.SUPER_ADMIN,
                USER_ROLES.DEPARTMENT_ADMIN,
              ]}
            >
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/contractors"
          element={
            <RoleRoute
              allowedRoles={[
                USER_ROLES.SUPER_ADMIN,
                USER_ROLES.DEPARTMENT_ADMIN,
              ]}
            >
              <ContractorsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/budgets"
          element={
            <RoleRoute
              allowedRoles={[
                USER_ROLES.SUPER_ADMIN,
                USER_ROLES.DEPARTMENT_ADMIN,
                USER_ROLES.AUDITOR,
              ]}
            >
              <BudgetsPage />
            </RoleRoute>
          }
        />

        {/* Execution & Tracking Routes */}
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/inspections" element={<InspectionsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />

        {/* Citizen Transparency Route */}
        <Route path="/citizen" element={<CitizenPortalPage />} />

        {/* 404 Inside Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
