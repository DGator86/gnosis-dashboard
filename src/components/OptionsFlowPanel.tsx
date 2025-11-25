import React, { useEffect, useState } from "react";
import { unusualWhalesAPI, type OptionsFlow } from "../services/unusualWhales";
import { FiTrendingUp, FiTrendingDown, FiActivity } from "react-icons/fi";

interface Props {
  symbol: string;
}

export const OptionsFlowPanel: React.FC<Props> = ({ symbol }) => {
  const [flow, setFlow] = useState<OptionsFlow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchFlow() {
      setLoading(true);
      try {
        const data = await unusualWhalesAPI.getOptionsFlow(symbol, 20);
        if (mounted) {
          setFlow(data);
        }
      } catch (error) {
        console.error("Failed to fetch options flow:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchFlow();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFlow, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  if (loading && flow.length === 0) {
    return (
      <div className="options-flow-panel">
        <div className="section-empty">Loading options flow data...</div>
      </div>
    );
  }

  if (flow.length === 0) {
    return (
      <div className="options-flow-panel">
        <div className="section-empty">
          No options flow data available for {symbol}
        </div>
      </div>
    );
  }

  return (
    <div className="options-flow-panel">
      <div className="flow-header">
        <h3>
          <FiActivity style={{ marginRight: "6px" }} />
          Options Flow
        </h3>
        <span className="flow-count">{flow.length} recent flows</span>
      </div>

      <div className="flow-list">
        {flow.map((item, index) => {
          const isPut = item.call_put === "PUT";
          const isBullish = item.sentiment === "BULLISH";
          
          return (
            <div key={index} className="flow-item">
              <div className="flow-item-header">
                <div className="flow-type">
                  <span className={`flow-badge ${isPut ? "put" : "call"}`}>
                    {item.call_put}
                  </span>
                  <span className={`flow-sentiment ${item.sentiment.toLowerCase()}`}>
                    {isBullish ? <FiTrendingUp /> : <FiTrendingDown />}
                    {item.sentiment}
                  </span>
                </div>
                <div className="flow-premium">
                  ${(item.premium / 1000).toFixed(1)}K
                </div>
              </div>

              <div className="flow-details">
                <div className="flow-detail-row">
                  <span className="flow-label">Strike:</span>
                  <span className="flow-value">${item.strike.toFixed(2)}</span>
                </div>
                <div className="flow-detail-row">
                  <span className="flow-label">Exp:</span>
                  <span className="flow-value">{item.expiration_date}</span>
                </div>
                <div className="flow-detail-row">
                  <span className="flow-label">Size:</span>
                  <span className="flow-value">{item.size.toLocaleString()}</span>
                </div>
                <div className="flow-detail-row">
                  <span className="flow-label">Spot:</span>
                  <span className="flow-value">${item.spot_price.toFixed(2)}</span>
                </div>
              </div>

              <div className="flow-time">
                {item.time} · {item.date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
