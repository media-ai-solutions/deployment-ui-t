import React from "react";

export default function StudioCard({ studio, onAction, disabled, status = null }) {
  const { slug, name, description, accent } = studio;
  const cardClass = `studio-card studio-card--${accent}`;
  const badgeClass = `studio-card__badge studio-card__badge--${accent}`;
  const slugLabel = String(slug).toUpperCase();
  const statusState =
    status === true ? "deployed" : status === false ? "not-deployed" : "unknown";
  const statusLabel =
    statusState === "deployed"
      ? "Deployed"
      : statusState === "not-deployed"
      ? "Not deployed"
      : "Status unknown";
  const statusClass = `studio-card__status studio-card__status--${statusState}`;
  const statusDotClass = `studio-card__status-indicator studio-card__status-indicator--${statusState}`;

  return (
    <article className={cardClass}>
      <div className="studio-card__top">
        <div className={badgeClass} aria-hidden="true">
          AI
        </div>
        <span className="studio-card__slug">{slugLabel}</span>
      </div>

      <header className="studio-card__header">
        <h2>{name}</h2>
        <p>{description}</p>
      </header>

      <div className={statusClass} aria-label={`Deployment status: ${statusLabel}`}>
        <span className={statusDotClass} aria-hidden="true" />
        <span className="studio-card__status-text">{statusLabel}</span>
      </div>

      <div className="studio-card__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => onAction(slug, "apply")}
          disabled={disabled}
        >
          Deploy
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => onAction(slug, "destroy")}
          disabled={disabled}
        >
          Destroy
        </button>
      </div>
    </article>
  );
}
