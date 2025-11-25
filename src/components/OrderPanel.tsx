import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { alpacaAPI } from "../services/alpaca";
import type { OrderType, OrderSide } from "../types";
import toast from "react-hot-toast";

export const OrderPanel: React.FC = () => {
  const { selectedSymbol, addOrder } = useAppStore();
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [side, setSide] = useState<OrderSide>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if ((orderType === "LIMIT" || orderType === "STOP_LIMIT") && !price) {
      toast.error("Please enter a limit price");
      return;
    }

    if ((orderType === "STOP" || orderType === "STOP_LIMIT") && !stopPrice) {
      toast.error("Please enter a stop price");
      return;
    }

    const loadingToast = toast.loading("Placing order...");

    try {
      // Place order via Alpaca API
      await alpacaAPI.placeOrder({
        symbol: selectedSymbol,
        qty: parseFloat(quantity),
        side: side.toLowerCase() as "buy" | "sell",
        type: orderType.toLowerCase() as any,
        time_in_force: "day",
        limit_price: price ? parseFloat(price) : undefined,
        stop_price: stopPrice ? parseFloat(stopPrice) : undefined,
      });

      // Also add to local store
      addOrder({
        symbol: selectedSymbol,
        type: orderType,
        side,
        quantity: parseFloat(quantity),
        price: price ? parseFloat(price) : undefined,
        stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
        status: "PENDING",
      });

      toast.success(`${side} order placed for ${quantity} shares of ${selectedSymbol}`, {
        id: loadingToast,
      });

      // Reset form
      setQuantity("");
      setPrice("");
      setStopPrice("");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order", {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="order-panel">
      <div className="order-header">
        <button
          className={`order-side-btn ${side === "BUY" ? "active buy" : ""}`}
          onClick={() => setSide("BUY")}
        >
          BUY
        </button>
        <button
          className={`order-side-btn ${side === "SELL" ? "active sell" : ""}`}
          onClick={() => setSide("SELL")}
        >
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmitOrder} className="order-form">
        <div className="form-group">
          <label>Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="form-select"
          >
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
            <option value="STOP">Stop</option>
            <option value="STOP_LIMIT">Stop Limit</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="form-input"
            min="1"
            step="1"
          />
        </div>

        {(orderType === "LIMIT" || orderType === "STOP_LIMIT") && (
          <div className="form-group">
            <label>Limit Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
        )}

        {(orderType === "STOP" || orderType === "STOP_LIMIT") && (
          <div className="form-group">
            <label>Stop Price</label>
            <input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder="0.00"
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
        )}

        <button type="submit" className={`order-submit-btn ${side.toLowerCase()}`}>
          {side} {selectedSymbol}
        </button>
      </form>
    </div>
  );
};
