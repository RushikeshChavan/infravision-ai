import React, { useEffect, useState } from "react";
import { Briefcase, Plus, Search, Star, Phone, Mail, MapPin } from "lucide-react";
import { Contractor, USER_ROLES } from "../../types";
import { getContractorsApi, createContractorApi } from "../../api/contractors";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Table, Column } from "../../components/Table";
import { ErrorMessage } from "../../components/ErrorMessage";

export const ContractorsPage: React.FC = () => {
  const { user } = useAuth();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [performanceScore, setPerformanceScore] = useState("85");
  const [createLoading, setCreateLoading] = useState(false);

  const isAdmin =
    user?.role === USER_ROLES.SUPER_ADMIN ||
    user?.role === USER_ROLES.DEPARTMENT_ADMIN;

  const fetchContractors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getContractorsApi();
      setContractors(response.contractors || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contractors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  const handleCreateContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim() || !registrationNumber.trim() || !contactPerson.trim()) {
      setError("Company Name, Reg Number, and Contact Person are required.");
      return;
    }

    setCreateLoading(true);
    try {
      await createContractorApi({
        companyName: companyName.trim(),
        registrationNumber: registrationNumber.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        performanceScore: parseFloat(performanceScore) || 80,
        status: "Active",
      });

      setModalOpen(false);
      setCompanyName("");
      setRegistrationNumber("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setAddress("");
      fetchContractors();
    } catch (err: any) {
      setError(err.message || "Failed to register contractor.");
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: Column<Contractor>[] = [
    {
      header: "Company Name",
      accessor: "companyName",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.companyName}</div>
          <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
            Reg: {row.registrationNumber}
          </div>
        </div>
      ),
    },
    {
      header: "Contact Person",
      accessor: "contactPerson",
      cell: (row) => (
        <div>
          <div>{row.contactPerson}</div>
          {row.email && (
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      cell: (row) => <span>{row.phone || "N/A"}</span>,
    },
    {
      header: "Performance Score",
      accessor: "performanceScore",
      cell: (row) => {
        const score = row.performanceScore || 0;
        const color = score >= 80 ? "var(--color-success)" : score >= 60 ? "var(--color-warning)" : "var(--color-danger)";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color }}>
            <Star size={14} fill={color} />
            <span>{score}/100</span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <Badge status={row.status} dot />,
      width: "110px",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Contractor Directory & Performance</h1>
          <p>Approved infrastructure contractors, registration credentials, and performance scoring</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Register Contractor
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchContractors} className="mb-6" />}

      <Card noPadding>
        <Table
          columns={columns}
          data={contractors}
          keyExtractor={(row) => row._id}
          loading={loading}
          emptyText="No registered contractors found."
        />
      </Card>

      {/* Registration Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Infrastructure Contractor"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createLoading}
              onClick={handleCreateContractor}
            >
              Register Contractor
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateContractor}>
          <Input
            label="Company Name"
            placeholder="e.g. Larsen & Infra Enterprises Ltd"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <Input
            label="Govt Registration Number"
            placeholder="e.g. REG-INFRA-2026-09"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />

          <Input
            label="Primary Contact Person"
            placeholder="e.g. Vikram Malhotra (Project Director)"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            required
          />

          <div className="grid-2">
            <Input
              label="Email"
              type="email"
              placeholder="contact@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Office Address"
            placeholder="HQ or regional office location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Initial Performance Rating (0-100)"
            type="number"
            min="0"
            max="100"
            value={performanceScore}
            onChange={(e) => setPerformanceScore(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
