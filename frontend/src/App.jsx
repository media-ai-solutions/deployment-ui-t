import React, { useCallback, useEffect, useMemo, useState } from "react";
import StudioCard from "./components/StudioCard";
import "./App.css";

export default function App() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [deploymentStates, setDeploymentStates] = useState({});

  const apiBase = useMemo(
    () => `${window.location.protocol}//${window.location.hostname}:5000`,
    []
  );

  const fetchStatuses = useCallback(async () => {
    const res = await fetch(`${apiBase}/status`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const nextStates = {};
    if (Array.isArray(data.studios)) {
      data.studios.forEach((entry) => {
        if (entry && typeof entry.studio === "string") {
          nextStates[entry.studio] = Boolean(entry.deployed);
        }
      });
    }
    setDeploymentStates(nextStates);
  }, [apiBase]);

  const handleAction = async (studio, action) => {
    setIsLoading(true);
    setMessage(
      `⏳ ${action === "destroy" ? "Destroying" : "Deploying"} ${studio}...`
    );

    try {
      const res = await fetch(`${apiBase}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studio, action }),
      });
      const data = await res.json();
      setMessage(data.message || data.output || data.error || "Done");
    } catch (err) {
      setMessage(`⚠️ ${String(err)}`);
    } finally {
      setIsLoading(false);
      fetchStatuses().catch((err) => {
        setMessage((prev) => prev || `⚠️ Status update failed: ${String(err)}`);
      });
    }
  };

  const handleRefresh = async () => {
    setMessage("🔄 Checking backend health...");

    try {
      const res = await fetch(`${apiBase}/health`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessage(
        data.status === "ok"
          ? "✅ Backend reachable. Ready for deployments."
          : `ℹ️ Backend response: ${JSON.stringify(data)}`
      );
    } catch (err) {
      setMessage(`⚠️ Backend unreachable: ${String(err)}`);
    } finally {
      setLastChecked(new Date());
      fetchStatuses().catch((err) => {
        setMessage((prev) => prev || `⚠️ Status update failed: ${String(err)}`);
      });
    }
  };

  useEffect(() => {
    fetchStatuses().catch((err) => {
      setMessage((prev) => prev || `⚠️ Status update failed: ${String(err)}`);
    });
  }, [fetchStatuses]);

  const studios = [
    {
      slug: "3d",
      name: "Omni 3D Studio",
      description:
        "Advanced computer vision solutions for image recognition, analysis, and automation.",
      accent: "sky",
    },
    {
      slug: "audio",
      name: "Omni Voice Studio",
      description:
        "Compose, edit, and remix audio projects effortlessly with intelligent AI tooling.",
      accent: "violet",
    },
    {
      slug: "avatar",
      name: "Omni Avatar Studio",
      description:
        "Create realistic, animated avatars for virtual experiences with AI personalization.",
      accent: "emerald",
    },
    {
      slug: "office",
      name: "Omni Office Studio",
      description:
        "AI-powered productivity suite for document creation, collaboration, and automation.",
      accent: "amber",
    },
    {
      slug: "photo",
      name: "Omni Photo Studio",
      description:
        "Smart photo editing, enhancement, and creative design using AI-powered tools.",
      accent: "rose",
    },
    {
      slug: "video",
      name: "Omni Video Studio",
      description:
        "Streamlined video editing, creation, and effects enhanced by AI technology.",
      accent: "blue",
    },
  ];

  const lastCheckedLabel = useMemo(() => {
    if (!lastChecked) {
      return "Health check pending";
    }
    return `Last check ${lastChecked.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }, [lastChecked]);

  const totalStudios = studios.length;

  return (
    <div className="app-shell">
      <header className="page-header hero-card">
        <div className="title-block">
          <span className="page-icon">☁️</span>
          <div className="title-copy">
            <h1>AWS Deployment Manager</h1>
            <p>
              Deploy and manage your studio products on AWS EC2 in a single
              dashboard.
            </p>
            <div className="status-row">
              <span className="status-chip status-chip--success">
                All systems nominal
              </span>
              <span className="status-chip">{lastCheckedLabel}</span>
              <span className="status-chip status-chip--count">
                {totalStudios} studios configured
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            ⟳ Refresh
          </button>
          <div className="header-note" aria-live="polite">
            <span className="header-note__label">Terraform Stack</span>
            <span className="header-note__value">AWS EC2 Orchestrator</span>
          </div>
        </div>
      </header>

      <main className="studio-grid">
        {studios.map((studio) => (
          <StudioCard
            key={studio.slug}
            studio={studio}
            onAction={handleAction}
            disabled={isLoading}
            status={deploymentStates[studio.slug]}
          />
        ))}
      </main>

      {message && <div className="status-bar">{message}</div>}
    </div>
  );
}
