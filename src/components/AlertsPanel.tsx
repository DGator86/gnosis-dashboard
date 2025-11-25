import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import toast from "react-hot-toast";
import { FiBell, FiBellOff, FiTrash2, FiPlus } from "react-icons/fi";

export const AlertsPanel: React.FC = () => {
  const { selectedSymbol, alerts, addAlert, removeAlert, toggleAlert } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [condition, setCondition] = useState<"ABOVE" | "BELOW" | "CROSSES">("ABOVE");
  const [price, setPrice] = useState("");

  const symbolAlerts = alerts.filter((a) => a.symbol === selectedSymbol);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    addAlert({
      symbol: selectedSymbol,
      condition,
      price: parseFloat(price),
      enabled: true,
      triggered: false,
    });

    toast.success(`Alert added for ${selectedSymbol} ${condition} $${price}`);
    setPrice("");
    setShowForm(false);
  };

  return (
    <div className="alerts-panel">
      <div className="alerts-header">
        <h3>Price Alerts</h3>
        <button
          className="btn-icon"
          onClick={() => setShowForm(!showForm)}
          title="Add Alert"
        >
          <FiPlus />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddAlert} className="alert-form">
          <div className="form-row">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="form-select-small"
            >
              <option value="ABOVE">Above</option>
              <option value="BELOW">Below</option>
              <option value="CROSSES">Crosses</option>
            </select>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="form-input-small"
              step="0.01"
              min="0"
            />
            <button type="submit" className="btn-primary-small">
              Add
            </button>
          </div>
        </form>
      )}

      <div className="alerts-list">
        {symbolAlerts.length === 0 ? (
          <div className="alerts-empty">
            No alerts set for {selectedSymbol}
          </div>
        ) : (
          symbolAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-item ${alert.enabled ? "" : "disabled"} ${
                alert.triggered ? "triggered" : ""
              }`}
            >
              <div className="alert-info">
                <div className="alert-main">
                  {selectedSymbol} {alert.condition.toLowerCase()} ${alert.price.toFixed(2)}
                </div>
                <div className="alert-status">
                  {alert.triggered ? "Triggered" : "Active"}
                </div>
              </div>
              <div className="alert-actions">
                <button
                  className="btn-icon-small"
                  onClick={() => toggleAlert(alert.id)}
                  title={alert.enabled ? "Disable" : "Enable"}
                >
                  {alert.enabled ? <FiBell /> : <FiBellOff />}
                </button>
                <button
                  className="btn-icon-small"
                  onClick={() => {
                    removeAlert(alert.id);
                    toast.success("Alert removed");
                  }}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
