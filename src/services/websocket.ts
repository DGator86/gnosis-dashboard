import type { SymbolInfo } from "../types";

type PriceUpdateCallback = (symbol: string, price: number, change: number) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private subscribers: Map<string, PriceUpdateCallback[]> = new Map();
  private isConnecting = false;
  private subscribedSymbols: Set<string> = new Set();

  constructor(private url: string = "wss://stream.example.com/v1/quotes") {}

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      // For demo purposes, we'll simulate WebSocket with mock data
      // In production, replace with: this.ws = new WebSocket(this.url);
      this.simulateMockConnection();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.scheduleReconnect();
    }
  }

  private simulateMockConnection() {
    // Simulate connection open
    console.log("Mock WebSocket connected");
    this.isConnecting = false;

    // Simulate real-time price updates
    this.startMockPriceUpdates();
  }

  private startMockPriceUpdates() {
    // Send price updates every 1-3 seconds for subscribed symbols
    const basePrices: Record<string, number> = {
      SPY: 550,
      QQQ: 480,
      TSLA: 285,
      AAPL: 215,
      NVDA: 850,
      MSFT: 410,
      GOOGL: 175,
      AMZN: 185,
      META: 520,
      AMD: 165,
    };

    setInterval(() => {
      this.subscribedSymbols.forEach((symbol) => {
        const basePrice = basePrices[symbol] || 100;
        // Random price change between -0.5% and +0.5%
        const changePercent = (Math.random() - 0.5) * 0.01;
        const change = basePrice * changePercent;
        const newPrice = basePrice + change;

        const callbacks = this.subscribers.get(symbol) || [];
        callbacks.forEach((cb) => cb(symbol, newPrice, change));
      });
    }, 2000); // Update every 2 seconds
  }

  subscribe(symbol: string, callback: PriceUpdateCallback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    this.subscribers.get(symbol)!.push(callback);
    this.subscribedSymbols.add(symbol);

    // Send subscription message (mock)
    console.log(`Subscribed to ${symbol}`);
  }

  unsubscribe(symbol: string, callback: PriceUpdateCallback) {
    const callbacks = this.subscribers.get(symbol);
    if (callbacks) {
      const filtered = callbacks.filter((cb) => cb !== callback);
      if (filtered.length === 0) {
        this.subscribers.delete(symbol);
        this.subscribedSymbols.delete(symbol);
        console.log(`Unsubscribed from ${symbol}`);
      } else {
        this.subscribers.set(symbol, filtered);
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect...");
      this.connect();
    }, 5000);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.subscribers.clear();
    this.subscribedSymbols.clear();
    this.isConnecting = false;
  }
}

export const websocketService = new WebSocketService();
