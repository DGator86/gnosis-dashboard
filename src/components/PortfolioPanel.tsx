import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { alpacaAPI } from "../services/alpaca";
import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from "react-icons/fi";
import type { Position, Order } from "../types";

export const PortfolioPanel: React.FC = () => {
  const { positions: storePositions, orders: storeOrders } = useAppStore();
  const [positions, setPositions] = useState<Position[]>(storePositions);
  const [orders, setOrders] = useState<Order[]>(storeOrders);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountData, positionsData, ordersData] = await Promise.all([
        alpacaAPI.getAccount(),
        alpacaAPI.getPositions(),
        alpacaAPI.getOrders("all"),
      ]);
      setAccount(accountData);
      setPositions(positionsData);
      setOrders(ordersData.slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      // Fallback to store data
      setPositions(storePositions);
      setOrders(storeOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (storePositions.length > 0 && positions.length === 0) {
      setPositions(storePositions);
    }
    if (storeOrders.length > 0 && orders.length === 0) {
      setOrders(storeOrders);
    }
  }, [storePositions, storeOrders]);

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.currentPrice * pos.quantity,
    0
  );

  const recentOrders = orders.slice(0, 10);

  return (
    <div className="portfolio-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>Portfolio</h2>
        <button
          className="btn-icon"
          onClick={fetchData}
          disabled={loading}
          title="Refresh"
        >
          <FiRefreshCw style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>

      {account && (
        <div className="portfolio-summary">
          <div className="summary-card">
            <div className="summary-label">Portfolio Value</div>
            <div className="summary-value">
              ${parseFloat(account.portfolio_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Buying Power</div>
            <div className="summary-value">
              ${parseFloat(account.buying_power).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Cash</div>
            <div className="summary-value">
              ${parseFloat(account.cash).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {!account && (
        <div className="portfolio-summary">
        <div className="summary-card">
          <div className="summary-label">Total Value</div>
          <div className="summary-value">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total P&L</div>
          <div className={`summary-value ${totalPnL >= 0 ? "positive" : "negative"}`}>
            {totalPnL >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            ${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Positions</div>
          <div className="summary-value">{positions.length}</div>
        </div>
      </div>

      <div className="portfolio-sections">
        <div className="portfolio-section">
          <h3>Positions</h3>
          {positions.length === 0 ? (
            <div className="section-empty">No open positions</div>
          ) : (
            <div className="positions-list">
              {positions.map((position) => (
                <div key={position.symbol} className="position-item">
                  <div className="position-header">
                    <span className="position-symbol">{position.symbol}</span>
                    <span className={`position-pnl ${position.pnl >= 0 ? "positive" : "negative"}`}>
                      {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="position-details">
                    <span>{position.quantity} shares @ ${position.avgPrice.toFixed(2)}</span>
                    <span>Current: ${position.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="portfolio-section">
          <h3>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div className="section-empty">No orders yet</div>
          ) : (
            <div className="orders-list">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <span className={`order-side ${order.side.toLowerCase()}`}>
                      {order.side}
                    </span>
                    <span className="order-symbol">{order.symbol}</span>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <span>{order.quantity} shares</span>
                    <span>{order.type}</span>
                    {order.price && <span>@ ${order.price.toFixed(2)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
