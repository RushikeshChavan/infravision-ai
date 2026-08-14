import React, { useState } from "react";
import { Users, Plus, Shield, CheckCircle, Mail, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { USER_ROLES, UserRole } from "../../types";
import { createUserApi, CreateUserData } from "../../api/users";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Badge } from "../../components/Badge";
import { ErrorMessage } from "../../components/ErrorMessage";

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(USER_ROLES.PROJECT_MANAGER);
  const [department, setDepartment] = useState(user?.department || "Public Works");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Newly created users in current session
  const [createdUsers, setCreatedUsers] = useState<
    Array<{ id: string; name: string; email: string; role: UserRole; department?: string }>
  >([]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all required user fields.");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateUserData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department: department.trim() || undefined,
      };

      const response = await createUserApi(payload);
      setSuccessMessage(`User "${response.user.name}" (${response.user.role}) created successfully!`);
      setCreatedUsers((prev) => [response.user, ...prev]);

      // Reset form & close modal
      setName("");
      setEmail("");
      setPassword("");
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to create user account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>User & Personnel Management</h1>
          <p>Provision Department Admins, Project Managers, Field Engineers, Contractors, and Auditors</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            icon={<UserPlus size={16} />}
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              setModalOpen(true);
            }}
          >
            Provision New User
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success mb-6">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} className="mb-6" />}

      {/* Role Provisioning Guidelines */}
      <div className="grid-2 mb-6">
        <Card title="Administrative Role Permissions" subtitle="Role capabilities in the platform">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Badge role={USER_ROLES.SUPER_ADMIN}>Super Admin</Badge>
              <span className="text-muted">Platform-wide control, full data access & configuration</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Badge role={USER_ROLES.DEPARTMENT_ADMIN}>Dept Admin</Badge>
              <span className="text-muted">Departmental projects, budget approvals, and user provisioning</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Badge role={USER_ROLES.PROJECT_MANAGER}>Project Manager</Badge>
              <span className="text-muted">Day-to-day project milestones, inspections review, document uploads</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Badge role={USER_ROLES.FIELD_ENGINEER}>Field Engineer</Badge>
              <span className="text-muted">GPS-tagged field inspections and verification logs</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Badge role={USER_ROLES.CONTRACTOR}>Contractor</Badge>
              <span className="text-muted">Progress milestone submission and contractual reports</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Badge role={USER_ROLES.AUDITOR}>Auditor</Badge>
              <span className="text-muted">Independent spending review, compliance verification</span>
            </li>
          </ul>
        </Card>

        <Card title="Quick Department Summary" subtitle="Your administrative scope">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
            <div>
              <span className="text-muted">Active Admin: </span>
              <strong>{user?.name}</strong> ({user?.role})
            </div>
            <div>
              <span className="text-muted">Assigned Department: </span>
              <strong>{user?.department || "All Departments (Super Admin)"}</strong>
            </div>
            <div
              style={{
                padding: "10px",
                backgroundColor: "var(--color-primary-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                color: "var(--color-primary)",
              }}
            >
              Note: Citizen accounts cannot be created from this admin console. Citizens must self-register via the public portal.
            </div>
          </div>
        </Card>
      </div>

      {/* Users Created in Current Session */}
      <Card title="Recently Provisioned Personnel" subtitle="Accounts created in this session">
        {createdUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)" }}>
            Click <strong>"Provision New User"</strong> to create departmental officer or engineer accounts.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {createdUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><Badge role={u.role}>{u.role}</Badge></td>
                    <td>{u.department || "General"}</td>
                    <td><Badge variant="success">Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Provision Official Account"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={handleCreateUser}
            >
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser}>
          <Input
            label="Full Name"
            placeholder="e.g. Er. Ananya Verma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Official Email"
            type="email"
            placeholder="officer@pwd.gov"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail size={16} />}
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="Set temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Select
            label="Assigned System Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            required
          >
            <option value={USER_ROLES.DEPARTMENT_ADMIN}>Department Admin</option>
            <option value={USER_ROLES.PROJECT_MANAGER}>Project Manager</option>
            <option value={USER_ROLES.FIELD_ENGINEER}>Field Engineer</option>
            <option value={USER_ROLES.CONTRACTOR}>Contractor</option>
            <option value={USER_ROLES.AUDITOR}>Auditor</option>
          </Select>

          <Input
            label="Department / Ministry"
            placeholder="e.g. Public Works Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
