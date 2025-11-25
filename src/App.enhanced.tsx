import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { Toaster, toast } from "react-hot-toast";
import {
  FiSettings,
  FiLogIn,
  FiLogOut,
  FiPlus,
  FiMinus,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
} from "react-icons/fi";

import { useAppStore } from "./store/useAppStore";
import { useMarketData } from "./hooks/useMarketData";
import { useWebSocket } from "./hooks/useWebSocket";
import { calculateIndicators } from "./utils/indicators";
import { api } from "./services/apiIntegrated";

import { CandlestickChart } from "./components/CandlestickChart";
import { VolumeChart } from "./components/VolumeChart";
import { IndicatorPanel } from "./components/IndicatorPanel";
import { OrderPanel } from "./components/OrderPanel";
import { AlertsPanel } from "./components/AlertsPanel";
import { PortfolioPanel } from "./components/PortfolioPanel";
import { LoginModal } from "./components/LoginModal";
import { SettingsPanel } from "./components/SettingsPanel";
import { OptionsFlowPanel } from "./components/OptionsFlowPanel";

import "./index.css";
import "./enhanced.css";

type ViewMode = "dashboard" | "portfolio" | "settings";

const App: React.FC = () => {
  const {
    user,
    isAuthenticated,
    logout,
    selectedSymbol,
    setSelectedSymbol,
    timeFrame,
    setTimeFrame,
    chartType,
    setChartType,
    indicators,
    toggleIndicator,
    addToWatchlist,
    removeFromWatchlist,
    theme,
  } = useAppStore();

  const [showLogin, setShowLogin] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [bottomTab, setBottomTab] = useState<"ideas" | "options">("ideas");

  // Get market data
  const { candles, symbolInfo, loading } = useMarketData(selectedSymbol, timeFrame);
  const { price: livePrice, change: liveChange } = useWebSocket(selectedSymbol);

  // Calculate indicators
  const indicatorData = useMemo(() => {
    if (candles.length === 0) return {};
    return calculateIndicators(candles);
  }, [candles]);

  // Get trade ideas
  const [tradeIdeas, setTradeIdeas] = useState<any[]>([]);
  useEffect(() => {
    api.getTradeIdeas(selectedSymbol).then(setTradeIdeas);
  }, [selectedSymbol]);

  // Watchlist
  const watchlistSymbols = user?.watchlist || ["SPY", "QQQ", "TSLA", "AAPL"];
  const [watchlistData, setWatchlistData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all(watchlistSymbols.map((s) => api.getSymbolInfo(s))).then(
      setWatchlistData
    );
  }, [watchlistSymbols.join(",")]);

  // Search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    const results = await api.searchSymbols(query);
    setSearchResults(results);
  };

  // Format price data for line chart
  const lineChartData = useMemo(() => {
    return candles.map((c) => ({
      time: format(new Date(c.time), "MM/dd HH:mm"),
      price: c.close,
    }));
  }, [candles]);

  // Apply theme
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const displayPrice = livePrice || symbolInfo?.price || 0;
  const displayChange = liveChange || symbolInfo?.change || 0;
  const displayChangePercent =
    symbolInfo?.changePercent || (displayChange / displayPrice) * 100;

  return (
    <div className="app-root">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#e5e7eb",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      {/* Header */}
      <header className="app-header">
        <div className="app-title">
          <span className="app-title-main">Gnosis Dashboard</span>
          <span className="app-title-sub">
            Advanced Trading Terminal · Live Data · AI Insights
          </span>
        </div>

        <div className="app-header-right">
          {livePrice && (
            <div className="live-price">
              <span className="live-indicator"></span>
              <span className="price-value">${displayPrice.toFixed(2)}</span>
              <span
                className={`price-change ${
                  displayChange >= 0 ? "positive" : "negative"
                }`}
              >
                {displayChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {displayChange >= 0 ? "+" : ""}
                {displayChange.toFixed(2)} ({displayChangePercent >= 0 ? "+" : ""}
                {displayChangePercent.toFixed(2)}%)
              </span>
            </div>
          )}

          <button
            className="btn-icon"
            onClick={() => setViewMode(viewMode === "dashboard" ? "portfolio" : "dashboard")}
            title="Toggle View"
          >
            <FiActivity />
          </button>

          <button
            className="btn-icon"
            onClick={() => setViewMode(viewMode === "settings" ? "dashboard" : "settings")}
            title="Settings"
          >
            <FiSettings />
          </button>

          {!isAuthenticated ? (
            <button className="btn-secondary" onClick={() => setShowLogin(true)}>
              <FiLogIn style={{ marginRight: "6px" }} />
              Sign In
            </button>
          ) : (
            <button className="btn-secondary" onClick={logout}>
              <FiLogOut style={{ marginRight: "6px" }} />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {viewMode === "settings" ? (
        <div className="panel" style={{ flex: 1, overflow: "auto" }}>
          <div className="panel-body">
            <SettingsPanel />
          </div>
        </div>
      ) : viewMode === "portfolio" ? (
        <div className="panel" style={{ flex: 1, overflow: "auto" }}>
          <div className="panel-body">
            <PortfolioPanel />
          </div>
        </div>
      ) : (
        <>
          {/* Main Grid */}
          <div className="app-main-grid">
            {/* Left: Stock Info + Order Panel */}
            <aside className="panel panel-left">
              <div className="panel-header">
                <span>Instrument Info</span>
                <button
                  className="btn-icon-small"
                  onClick={() => setShowOrderPanel(!showOrderPanel)}
                  title={showOrderPanel ? "Hide Order Panel" : "Show Order Panel"}
                >
                  {showOrderPanel ? <FiMinus /> : <FiPlus />}
                </button>
              </div>
              <div className="panel-body" style={{ overflowY: "auto" }}>
                {symbolInfo && (
                  <>
                    <div className="symbol-main">
                      <div className="symbol-ticker">{symbolInfo.symbol}</div>
                      <div className="symbol-name">{symbolInfo.name}</div>
                      <div className="symbol-sector">{symbolInfo.sector}</div>
                    </div>

                    <div className="symbol-metrics">
                      <div className="metric-card">
                        <div className="metric-label">Market Cap</div>
                        <div className="metric-value">{symbolInfo.marketCap}</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Beta</div>
                        <div className="metric-value">
                          {symbolInfo.beta.toFixed(2)}
                        </div>
                      </div>
                      {symbolInfo.volume && (
                        <div className="metric-card">
                          <div className="metric-label">Volume</div>
                          <div className="metric-value">
                            {(symbolInfo.volume / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="symbol-description">
                      <div className="section-label">Summary</div>
                      <p>{symbolInfo.description}</p>
                    </div>
                  </>
                )}

                {showOrderPanel && isAuthenticated && (
                  <div style={{ marginTop: "16px" }}>
                    <OrderPanel />
                  </div>
                )}

                {isAuthenticated && (
                  <div style={{ marginTop: "16px" }}>
                    <AlertsPanel />
                  </div>
                )}
              </div>
            </aside>

            {/* Center: Chart */}
            <main className="panel panel-center">
              <div className="panel-header">
                <div>
                  {selectedSymbol} · {timeFrame}
                  {loading && (
                    <span className="panel-header-sub"> Loading...</span>
                  )}
                </div>
                <div className="panel-header-controls">
                  <button
                    className={`btn-ghost ${chartType === "LINE" ? "btn-ghost-active" : ""}`}
                    onClick={() => setChartType("LINE")}
                  >
                    Line
                  </button>
                  <button
                    className={`btn-ghost ${chartType === "CANDLE" ? "btn-ghost-active" : ""}`}
                    onClick={() => setChartType("CANDLE")}
                  >
                    Candle
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => setShowIndicators(!showIndicators)}
                  >
                    Indicators
                  </button>
                </div>
              </div>

              {showIndicators && (
                <div className="indicator-controls">
                  {[
                    { type: "SMA", period: 20, color: "#4f46e5" },
                    { type: "EMA", period: 20, color: "#06b6d4" },
                    { type: "BOLLINGER", period: 20, color: "#9ca3af" },
                    { type: "RSI", period: 14, color: "#4f46e5" },
                    { type: "MACD", period: 12, color: "#06b6d4" },
                  ].map((ind) => (
                    <button
                      key={ind.type}
                      className={`indicator-chip ${
                        indicators.find((i) => i.type === ind.type)
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleIndicator({
                          type: ind.type as any,
                          period: ind.period,
                          visible: true,
                          color: ind.color,
                        })
                      }
                    >
                      {ind.type}
                    </button>
                  ))}
                </div>
              )}

              <div className="panel-body panel-body-chart">
                <div style={{ height: "70%", minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "CANDLE" ? (
                      <CandlestickChart
                        data={candles}
                        indicators={{
                          sma: indicators.find((i) => i.type === "SMA")
                            ? indicatorData.sma
                            : undefined,
                          ema: indicators.find((i) => i.type === "EMA")
                            ? indicatorData.ema
                            : undefined,
                          bollinger: indicators.find((i) => i.type === "BOLLINGER")
                            ? indicatorData.bollinger
                            : undefined,
                        }}
                      />
                    ) : (
                      <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={["dataMin - 2", "dataMax + 2"]}
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `$${v.toFixed(0)}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [
                            `$${value.toFixed(2)}`,
                            "Price",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Volume Chart */}
                <div style={{ height: "30%", minHeight: 0, marginTop: "8px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <VolumeChart data={candles} />
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Frame Controls */}
              <div
                style={{
                  padding: "8px 12px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  gap: "6px",
                }}
              >
                {(["1D", "5D", "1M", "3M", "1Y", "ALL"] as const).map((tf) => (
                  <button
                    key={tf}
                    className={`btn-ghost ${timeFrame === tf ? "btn-ghost-active" : ""}`}
                    onClick={() => setTimeFrame(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </main>

            {/* Right: Watchlist */}
            <aside className="panel panel-right">
              <div className="panel-header">
                <span>Watchlist</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.8rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      background: "rgba(15, 23, 42, 0.9)",
                      color: "var(--text)",
                      width: "120px",
                    }}
                  />
                </div>
              </div>
              <div className="panel-body panel-body-watchlist">
                {searchQuery && searchResults.length > 0 ? (
                  searchResults.map((s) => (
                    <button
                      key={s.symbol}
                      className="watchlist-row"
                      onClick={() => {
                        setSelectedSymbol(s.symbol);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <div className="watchlist-row-main">
                        <span className="watchlist-symbol">{s.symbol}</span>
                        <span className="watchlist-name">{s.name}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  watchlistData.map((s) => {
                    const isActive = s.symbol === selectedSymbol;
                    const inWatchlist = watchlistSymbols.includes(s.symbol);
                    return (
                      <button
                        key={s.symbol}
                        className={
                          "watchlist-row" +
                          (isActive ? " watchlist-row-active" : "")
                        }
                        onClick={() => setSelectedSymbol(s.symbol)}
                      >
                        <div className="watchlist-row-main">
                          <span className="watchlist-symbol">{s.symbol}</span>
                          {s.changePercent !== undefined && (
                            <span
                              className={`watchlist-name ${
                                s.changePercent >= 0 ? "positive" : "negative"
                              }`}
                              style={{ fontWeight: 600 }}
                            >
                              {s.changePercent >= 0 ? "+" : ""}
                              {s.changePercent.toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <div className="watchlist-row-meta">
                          <span className="watchlist-sector">{s.sector}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>
          </div>

          {/* Bottom: Trade Idea Feed + Options Flow */}
          <section className="panel panel-bottom">
            <div className="tab-nav">
              <button
                className={`tab-btn ${bottomTab === "ideas" ? "active" : ""}`}
                onClick={() => setBottomTab("ideas")}
              >
                Trade Ideas
              </button>
              <button
                className={`tab-btn ${bottomTab === "options" ? "active" : ""}`}
                onClick={() => setBottomTab("options")}
              >
                Options Flow
              </button>
            </div>

            <div className="panel-body panel-body-tradeideas">
              {bottomTab === "ideas" ? (
                <>
                  {tradeIdeas.length === 0 ? (
                    <div className="tradeidea-empty">
                      Analyzing {selectedSymbol}... AI-generated trade ideas will appear here.
                    </div>
                  ) : (
                    tradeIdeas
                      .sort((a, b) => b.confidence - a.confidence)
                      .map((idea) => (
                        <article key={idea.id} className="tradeidea-card">
                          <div className="tradeidea-header">
                            <div className="tradeidea-title">{idea.title}</div>
                            <div className="tradeidea-tags">
                              <span
                                className={
                                  "pill pill-direction-" +
                                  idea.direction.toLowerCase()
                                }
                              >
                                {idea.direction === "LONG" ? "Long Bias" : "Short Bias"}
                              </span>
                              <span className="pill">
                                {idea.horizon === "INTRADAY"
                                  ? "Intraday"
                                  : idea.horizon === "SWING"
                                  ? "Swing (2–10 days)"
                                  : "Position (weeks+)"}
                              </span>
                              <span className="pill pill-confidence">
                                Confidence: {(idea.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <p className="tradeidea-thesis">{idea.thesis}</p>
                        </article>
                      ))
                  )}
                </>
              ) : (
                <OptionsFlowPanel symbol={selectedSymbol} />
              )}
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default App;
