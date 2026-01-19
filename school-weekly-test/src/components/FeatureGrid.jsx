import React from "react";

function FeatureGrid({ items = [], columns = 3, onTileClick }) {
  return (
    <div
      className="feature-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <button
          key={item.key || item.label}
          type="button"
          className="feature-tile"
          style={{ background: item.color || "#f4f4f4" }}
          onClick={() => onTileClick && onTileClick(item)}
        >
          {item.badge && <span className="tile-badge">{item.badge}</span>}
          <div className="tile-icon">{item.icon || "•"}</div>
          <div className="tile-label">{item.label}</div>
          {item.sub && <div className="tile-sub">{item.sub}</div>}
        </button>
      ))}
    </div>
  );
}

export default FeatureGrid;
