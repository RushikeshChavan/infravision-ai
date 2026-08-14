import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Building2,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Compass,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Project } from "../../types";
import { getProjectsApi } from "../../api/projects";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatCurrency } from "../../utils/formatters";

// Helper to create custom SVG status pin icons
function createStatusIcon(status: string, isSelected: boolean) {
  let color = "#0284C7"; // Ongoing (sky blue)
  if (status === "Delayed") color = "#DC2626"; // Red
  if (status === "Completed") color = "#16A34A"; // Green
  if (status === "Planned") color = "#4F46E5"; // Indigo

  const size = isSelected ? 38 : 30;

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        background-color: ${color};
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: ${size / 2.5}px;
          height: ${size / 2.5}px;
          background-color: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
      ${
        status === "Delayed"
          ? `<div style="
              position: absolute;
              top: -4px;
              right: -4px;
              width: 10px;
              height: 10px;
              background-color: #EF4444;
              border: 2px solid #FFFFFF;
              border-radius: 50%;
              animation: pulse 1.5s infinite;
            "></div>`
          : ""
      }
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-leaflet-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export const MapPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // 1. Fetch projects
  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const response = await getProjectsApi();
        const projs = response.projects || [];
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProject(projs[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load project GIS coordinates.");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on India
    const map = L.map(mapContainerRef.current, {
      center: [21.7679, 78.8718],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | InfraVision AI',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size on load to avoid grey tile glitches
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Update Markers when projects or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const filtered = projects.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    const bounds = L.latLngBounds([]);

    filtered.forEach((p) => {
      const lat = p.latitude ?? 28.6139;
      const lng = p.longitude ?? 77.2090;

      const isSelected = selectedProject?._id === p._id;
      const icon = createStatusIcon(p.status, isSelected);

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Rich HTML popup
      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-weight: 700; color: #0F294A; font-size: 0.8rem; background: #EBF2FA; padding: 2px 6px; border-radius: 4px;">
              ${p.projectCode}
            </span>
            <span style="font-size: 0.72rem; font-weight: 600; color: ${
              p.status === 'Completed' ? '#16A34A' : p.status === 'Delayed' ? '#DC2626' : '#0284C7'
            };">
              ● ${p.status}
            </span>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: #0F172A; line-height: 1.3;">
            ${p.name}
          </h4>
          <div style="font-size: 0.78rem; color: #64748B; margin-bottom: 8px;">
            📍 ${p.location || 'Monitored Site'}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; border-top: 1px solid #E2E8F0; padding-top: 6px; margin-bottom: 8px;">
            <span style="color: #64748B;">Budget Outlay:</span>
            <strong style="color: #0F294A;">${formatCurrency(p.totalBudget)}</strong>
          </div>
          <a href="/projects/${p._id}" style="display: block; text-align: center; background: #0F294A; color: #FFFFFF; text-decoration: none; padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
            Inspect Project File →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        setSelectedProject(p);
      });

      markersRef.current[p._id] = marker;
      bounds.extend([lat, lng]);
    });

    if (filtered.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [projects, statusFilter, searchQuery]);

  // 4. Handle selecting a project from the sidebar
  const handleSelectProject = (p: Project) => {
    setSelectedProject(p);
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = p.latitude ?? 28.6139;
    const lng = p.longitude ?? 77.2090;

    map.flyTo([lat, lng], 11, { duration: 1.2 });

    const marker = markersRef.current[p._id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 1200);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>GIS Infrastructure Geospatial Map</h1>
          <p>Interactive coordinate mapping, physical asset locations, and regional status overview</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
          backgroundColor: "var(--color-surface)",
          padding: "12px 16px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-muted)", marginRight: "4px" }}>
            Filter Status:
          </span>
          {["ALL", "Ongoing", "Delayed", "Completed", "Planned"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                backgroundColor: statusFilter === st ? "var(--color-primary)" : "var(--color-surface-subtle)",
                color: statusFilter === st ? "#FFFFFF" : "var(--color-text-secondary)",
                transition: "all 0.15s ease",
              }}
            >
              {st === "ALL" ? `All (${projects.length})` : st}
            </button>
          ))}
        </div>

        <div style={{ width: "240px" }}>
          <Input
            placeholder="Search geo-pins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>
      </div>

      {/* Main Grid: Sidebar List + Interactive Map */}
      <div className="grid-3" style={{ height: "680px" }}>
        {/* Project Geographic Pins / List */}
        <Card
          title="Monitored Geo-Pins"
          subtitle={`${filteredProjects.length} projects in view`}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
          noPadding
        >
          {loading ? (
            <LoadingSpinner text="Locating GIS coordinates..." />
          ) : (
            <div style={{ overflowY: "auto", flex: 1, padding: "10px" }}>
              {filteredProjects.map((p) => {
                const isSelected = selectedProject?._id === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => handleSelectProject(p)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isSelected ? "var(--color-primary-light)" : "var(--color-surface)",
                      border: isSelected ? "1.5px solid var(--color-accent)" : "1px solid var(--color-border)",
                      marginBottom: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-primary)" }}>
                        {p.projectCode}
                      </span>
                      <Badge status={p.status} dot style={{ fontSize: "0.68rem" }}>
                        {p.status}
                      </Badge>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "4px", lineHeight: 1.3 }}>
                      {p.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--color-text-muted)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} color="var(--color-accent)" />
                        <span>{p.location || "Monitored Coordinates"}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                        {formatCurrency(p.totalBudget)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Leaflet Interactive Map View */}
        <Card
          title="Interactive OpenStreetMap Layer"
          subtitle={selectedProject ? `Selected: ${selectedProject.name}` : "National GIS Spatial Grid"}
          style={{ gridColumn: "span 2", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}
          action={
            selectedProject && (
              <Link to={`/projects/${selectedProject._id}`}>
                <Button variant="primary" size="sm">
                  <span>Project File</span>
                  <ArrowUpRight size={14} />
                </Button>
              </Link>
            )
          }
          noPadding
        >
          {/* Leaflet Map DOM Container */}
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "100%",
              minHeight: "560px",
              borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
              zIndex: 1,
            }}
          />

          {/* Floating Map Legend */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(4px)",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
              zIndex: 1000,
              fontSize: "0.75rem",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "6px", color: "var(--color-text-primary)" }}>
              Project Status Legend
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#0284C7" }} />
                <span>Ongoing Construction</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#DC2626" }} />
                <span>Delayed / Risk Alert</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#16A34A" }} />
                <span>Completed Asset</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#4F46E5" }} />
                <span>Planned Proposal</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
