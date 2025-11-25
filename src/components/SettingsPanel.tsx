import React from "react";
import { useAppStore } from "../store/useAppStore";
import { FiMoon, FiSun, FiBell, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

export const SettingsPanel: React.FC = () => {
  const { user, theme, toggleTheme, updateUserPreferences } = useAppStore();

  if (!user) return null;

  const handleToggleNotification = (type: keyof typeof user.preferences.notifications) => {
    updateUserPreferences({
      notifications: {
        ...user.preferences.notifications,
        [type]: !user.preferences.notifications[type],
      },
    });
    toast.success("Preferences updated");
  };

  return (
    <div className="settings-panel">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="settings-item">
          <div className="settings-item-label">
            <div className="settings-icon">
              {theme === "dark" ? <FiMoon /> : <FiSun />}
            </div>
            <div>
              <div className="settings-title">Theme</div>
              <div className="settings-desc">
                Switch between light and dark mode
              </div>
            </div>
          </div>
          <button
            className="toggle-btn"
            onClick={toggleTheme}
          >
            <span className={`toggle-switch ${theme}`}>
              <span className="toggle-knob" />
            </span>
            <span className="toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Notifications</h3>

        <div className="settings-item">
          <div className="settings-item-label">
            <div className="settings-icon">
              <FiBell />
            </div>
            <div>
              <div className="settings-title">Push Notifications</div>
              <div className="settings-desc">
                Receive push notifications in your browser
              </div>
            </div>
          </div>
          <button
            className="toggle-btn"
            onClick={() => handleToggleNotification("push")}
          >
            <span className={`toggle-switch ${user.preferences.notifications.push ? "on" : "off"}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        <div className="settings-item">
          <div className="settings-item-label">
            <div className="settings-icon">
              <FiMail />
            </div>
            <div>
              <div className="settings-title">Email Notifications</div>
              <div className="settings-desc">
                Receive email alerts for important events
              </div>
            </div>
          </div>
          <button
            className="toggle-btn"
            onClick={() => handleToggleNotification("email")}
          >
            <span className={`toggle-switch ${user.preferences.notifications.email ? "on" : "off"}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        <div className="settings-item">
          <div className="settings-item-label">
            <div className="settings-icon">
              <FiBell />
            </div>
            <div>
              <div className="settings-title">Price Alerts</div>
              <div className="settings-desc">
                Get notified when price alerts trigger
              </div>
            </div>
          </div>
          <button
            className="toggle-btn"
            onClick={() => handleToggleNotification("priceAlerts")}
          >
            <span className={`toggle-switch ${user.preferences.notifications.priceAlerts ? "on" : "off"}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        <div className="settings-item">
          <div className="settings-item-label">
            <div className="settings-icon">
              <FiBell />
            </div>
            <div>
              <div className="settings-title">Trade Ideas</div>
              <div className="settings-desc">
                Receive notifications for new trade ideas
              </div>
            </div>
          </div>
          <button
            className="toggle-btn"
            onClick={() => handleToggleNotification("tradeIdeas")}
          >
            <span className={`toggle-switch ${user.preferences.notifications.tradeIdeas ? "on" : "off"}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Account</h3>
        <div className="settings-info">
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{user.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
