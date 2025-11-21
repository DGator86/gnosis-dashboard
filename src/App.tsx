import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./index.css";

type SymbolInfo = {
  symbol: string;
  name: string;
  sector: string;
  marketCap: string;
  beta: number;
  description: string;
};

type PricePoint = {
  time: string;
  price: number;
};

type TradeIdea = {
  id: string;
  symbol: string;
  title: string;
  thesis: string;
  direction: "LONG" | "SHORT";
  confidence: number; // 0–1
  horizon: "INTRADAY" | "SWING" | "POSITION";
};

const MOCK_SYMBOLS: SymbolInfo[] = [
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    sector: "Index / ETF",
    marketCap: "$500B+",
    beta: 1.0,
    description:
      "Proxy for broad U.S. large-cap market. Often used as the primary field reference for Gnosis.",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    sector: "Index / ETF – Tech heavy",
    marketCap: "$250B+",
    beta: 1.2,
    description:
      "Nasdaq-100 tracker, higher beta vs SPY. Strong tech concentration, good for momentum and rotations.",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    sector: "Consumer Discretionary / EV",
    marketCap: "$500B+",
    beta: 1.8,
    description:
      "High-beta single name. Excellent vehicle for dealer-hedging flows and 0DTE structures.",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Information Technology",
    marketCap: "$3T+",
    beta: 1.1,
    description:
      "Mega-cap, heavy index weight. Critical for SPY/QQQ structure and institutional positioning.",
  },
];

const MOCK_PRICE_SERIES: Record<string, PricePoint[]> = {
  SPY: [
    { time: "09:30", price: 550 },
    { time: "10:00", price: 552 },
    { time: "10:30", price: 549 },
    { time: "11:00", price: 551 },
    { time: "11:30", price: 553 },
    { time: "12:00", price: 552 },
    { time: "13:00", price: 554 },
    { time: "14:00", price: 556 },
    { time: "15:00", price: 555 },
    { time: "16:00", price: 557 },
  ],
  QQQ: [
    { time: "09:30", price: 480 },
    { time: "10:00", price: 482 },
    { time: "10:30", price: 479 },
    { time: "11:00", price: 481 },
    { time: "11:30", price: 485 },
    { time: "12:00", price: 487 },
    { time: "13:00", price: 489 },
    { time: "14:00", price: 492 },
    { time: "15:00", price: 491 },
    { time: "16:00", price: 493 },
  ],
  TSLA: [
    { time: "09:30", price: 280 },
    { time: "10:00", price: 285 },
    { time: "10:30", price: 278 },
    { time: "11:00", price: 282 },
    { time: "11:30", price: 290 },
    { time: "12:00", price: 288 },
    { time: "13:00", price: 292 },
    { time: "14:00", price: 295 },
    { time: "15:00", price: 289 },
    { time: "16:00", price: 294 },
  ],
  AAPL: [
    { time: "09:30", price: 210 },
    { time: "10:00", price: 211 },
    { time: "10:30", price: 209 },
    { time: "11:00", price: 212 },
    { time: "11:30", price: 213 },
    { time: "12:00", price: 214 },
    { time: "13:00", price: 215 },
    { time: "14:00", price: 216 },
    { time: "15:00", price: 215 },
    { time: "16:00", price: 217 },
  ],
};

const MOCK_TRADE_IDEAS: TradeIdea[] = [
  {
    id: "1",
    symbol: "SPY",
    title: "SPY mean-reversion long into VWAP",
    thesis:
      "Dealer gamma flips mildly positive intraday while liquidity pocket sits just below spot. Expect fade of morning extension back into VWAP.",
    direction: "LONG",
    confidence: 0.72,
    horizon: "INTRADAY",
  },
  {
    id: "2",
    symbol: "SPY",
    title: "0DTE call spread into resistance",
    thesis:
      "Top of field cone aligns with prior RTH high. Structure: tight call spread with defined risk, targeting 30–40% move.",
    direction: "LONG",
    confidence: 0.65,
    horizon: "INTRADAY",
  },
  {
    id: "3",
    symbol: "TSLA",
    title: "TSLA short gamma squeeze potential",
    thesis:
      "Heavy short-dated call open interest above spot with dealers short gamma. If spot breaks trigger level, accelerate to next liquidity shelf.",
    direction: "LONG",
    confidence: 0.8,
    horizon: "SWING",
  },
  {
    id: "4",
    symbol: "AAPL",
    title: "AAPL covered call candidate",
    thesis:
      "Vol surface elevated vs realized. Good candidate for covered calls or call credit spreads at upper field boundary.",
    direction: "SHORT",
    confidence: 0.6,
    horizon: "POSITION",
  },
  {
    id: "5",
    symbol: "QQQ",
    title: "QQQ downside hedge via put spread",
    thesis:
      "Macro regime flagging elevated downside tail risk next 5–10 sessions. Cheap put spreads provide asymmetric protection.",
    direction: "SHORT",
    confidence: 0.7,
    horizon: "SWING",
  },
];

const horizonLabel: Record<TradeIdea["horizon"], string> = {
  INTRADAY: "Intraday",
  SWING: "Swing (2–10 days)",
  POSITION: "Position (weeks+)",
};

const directionLabel: Record<TradeIdea["direction"], string> = {
  LONG: "Long Bias",
  SHORT: "Short Bias",
};

const App: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("SPY");

  const selectedInfo = useMemo(
    () =>
      MOCK_SYMBOLS.find((s) => s.symbol === selectedSymbol) ??
      MOCK_SYMBOLS[0],
    [selectedSymbol]
  );

  const priceSeries = useMemo(
    () => MOCK_PRICE_SERIES[selectedSymbol] ?? [],
    [selectedSymbol]
  );

  const symbolIdeas = useMemo(
    () =>
      MOCK_TRADE_IDEAS.filter((idea) => idea.symbol === selectedSymbol).sort(
        (a, b) => b.confidence - a.confidence
      ),
    [selectedSymbol]
  );

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-title">
          <span className="app-title-main">Gnosis Dashboard</span>
          <span className="app-title-sub">
            Live market canvas · Watchlist · Trade Ideas
          </span>
        </div>
        <div className="app-header-right">
          <span className="badge">BETA</span>
          <span className="header-symbol">
            Active: <strong>{selectedSymbol}</strong>
          </span>
        </div>
      </header>

      <div className="app-main-grid">
        {/* Left: Stock Info */}
        <aside className="panel panel-left">
          <div className="panel-header">Instrument Info</div>
          <div className="panel-body">
            <div className="symbol-main">
              <div className="symbol-ticker">{selectedInfo.symbol}</div>
              <div className="symbol-name">{selectedInfo.name}</div>
              <div className="symbol-sector">{selectedInfo.sector}</div>
            </div>

            <div className="symbol-metrics">
              <div className="metric-card">
                <div className="metric-label">Market Cap</div>
                <div className="metric-value">
                  {selectedInfo.marketCap}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Beta</div>
                <div className="metric-value">
                  {selectedInfo.beta.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="symbol-description">
              <div className="section-label">Summary</div>
              <p>{selectedInfo.description}</p>
            </div>

            <div className="symbol-tags">
              <span className="tag">Field Model</span>
              <span className="tag">Dealer Hedge</span>
              <span className="tag">Liquidity Map</span>
            </div>
          </div>
        </aside>

        {/* Center: Chart */}
        <main className="panel panel-center">
          <div className="panel-header">
            <div>
              {selectedSymbol} · Intraday Snapshot
              <span className="panel-header-sub">
                (mock data – wire to your engine later)
              </span>
            </div>
            <div className="panel-header-controls">
              <button className="btn-ghost">1D</button>
              <button className="btn-ghost btn-ghost-active">Intraday</button>
              <button className="btn-ghost">5D</button>
              <button className="btn-ghost">1M</button>
            </div>
          </div>
          <div className="panel-body panel-body-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tickFormatter={(v) => v.toFixed(0)}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `$${value.toFixed(2)}`,
                    "Price",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>

        {/* Right: Watchlist */}
        <aside className="panel panel-right">
          <div className="panel-header">Watchlist</div>
          <div className="panel-body panel-body-watchlist">
            {MOCK_SYMBOLS.map((s) => {
              const isActive = s.symbol === selectedSymbol;
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
                    <span className="watchlist-name">{s.name}</span>
                  </div>
                  <div className="watchlist-row-meta">
                    <span className="watchlist-sector">
                      {s.sector}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Bottom: Trade Idea Feed */}
      <section className="panel panel-bottom">
        <div className="panel-header">Trade Ideas · {selectedSymbol}</div>
        <div className="panel-body panel-body-tradeideas">
          {symbolIdeas.length === 0 && (
            <div className="tradeidea-empty">
              No ideas yet for {selectedSymbol}. This is where the Trade
              Agent feed will show up.
            </div>
          )}

          {symbolIdeas.map((idea) => (
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
                    {directionLabel[idea.direction]}
                  </span>
                  <span className="pill">
                    {horizonLabel[idea.horizon]}
                  </span>
                  <span className="pill pill-confidence">
                    Confidence: {(idea.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="tradeidea-thesis">{idea.thesis}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default App;
