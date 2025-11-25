import React from "react";
import { useAppStore } from "../store/useAppStore";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export const PortfolioPanel: React.FC = () => {
  const { positions, orders } = useAppStore();

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.currentPrice * pos.quantity,
    0
  );

  const recentOrders = orders.slice(0, 10);

  return (
    <div className="portfolio-panel">
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
