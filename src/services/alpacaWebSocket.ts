const ALPACA_API_KEY = import.meta.env.VITE_ALPACA_API_KEY;
const ALPACA_SECRET_KEY = import.meta.env.VITE_ALPACA_SECRET_KEY;
const ALPACA_WS_URL = import.meta.env.VITE_ALPACA_WS_URL || "wss://stream.data.alpaca.markets/v2/iex";

type PriceUpdateCallback = (symbol: string, price: number, change: number) => void;

class AlpacaWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isAuthenticated = false;
  private subscribers: Map<string, PriceUpdateCallback[]> = new Map();
  private subscribedSymbols: Set<string> = new Set();
  private lastPrices: Map<string, number> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    console.log("Connecting to Alpaca WebSocket...");

    try {
      this.ws = new WebSocket(ALPACA_WS_URL);

      this.ws.onopen = () => {
        console.log("Alpaca WebSocket connected");
        this.isConnecting = false;
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isAuthenticated = false;
        this.isConnecting = false;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private authenticate() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const authMessage = {
      action: "auth",
      key: ALPACA_API_KEY,
      secret: ALPACA_SECRET_KEY,
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  private handleMessage(data: any) {
    // Handle different message types
    if (Array.isArray(data)) {
      data.forEach((msg) => this.processMessage(msg));
    } else {
      this.processMessage(data);
    }
  }

  private processMessage(msg: any) {
    const { T: type } = msg;

    switch (type) {
      case "success":
        if (msg.msg === "authenticated") {
          console.log("Alpaca WebSocket authenticated");
          this.isAuthenticated = true;
          this.startHeartbeat();
          // Subscribe to all previously requested symbols
          this.resubscribeAll();
        }
        break;

      case "subscription":
        console.log("Subscription confirmed:", msg);
        break;

      case "t": // Trade update
        this.handleTradeUpdate(msg);
        break;

      case "q": // Quote update
        this.handleQuoteUpdate(msg);
        break;

      case "error":
        console.error("WebSocket error message:", msg);
        break;
    }
  }

  private handleTradeUpdate(trade: any) {
    const { S: symbol, p: price } = trade;
    
    if (!symbol || price === undefined) return;

    const lastPrice = this.lastPrices.get(symbol) || price;
    const change = price - lastPrice;
    
    this.lastPrices.set(symbol, price);

    const callbacks = this.subscribers.get(symbol) || [];
    callbacks.forEach((cb) => cb(symbol, price, change));
  }

  private handleQuoteUpdate(quote: any) {
    const { S: symbol, ap: askPrice, bp: bidPrice } = quote;
    
    if (!symbol) return;

    // Use mid price from quote
    const price = (askPrice + bidPrice) / 2;
    const lastPrice = this.lastPrices.get(symbol) || price;
    const change = price - lastPrice;
    
    this.lastPrices.set(symbol, price);

    const callbacks = this.subscribers.get(symbol) || [];
    callbacks.forEach((cb) => cb(symbol, price, change));
  }

  private startHeartbeat() {
    // Send periodic heartbeat to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: "ping" }));
      }
    }, 30000); // Every 30 seconds
  }

  private resubscribeAll() {
    if (this.subscribedSymbols.size === 0) return;

    const symbols = Array.from(this.subscribedSymbols);
    this.subscribeToSymbols(symbols);
  }

  private subscribeToSymbols(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      return;
    }

    const subscribeMessage = {
      action: "subscribe",
      trades: symbols,
      quotes: symbols,
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    console.log(`Subscribed to: ${symbols.join(", ")}`);
  }

  private unsubscribeFromSymbols(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      return;
    }

    const unsubscribeMessage = {
      action: "unsubscribe",
      trades: symbols,
      quotes: symbols,
    };

    this.ws.send(JSON.stringify(unsubscribeMessage));
    console.log(`Unsubscribed from: ${symbols.join(", ")}`);
  }

  subscribe(symbol: string, callback: PriceUpdateCallback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    this.subscribers.get(symbol)!.push(callback);

    const wasEmpty = this.subscribedSymbols.size === 0;
    this.subscribedSymbols.add(symbol);

    // If we weren't subscribed to this symbol before, subscribe now
    if (this.isAuthenticated) {
      this.subscribeToSymbols([symbol]);
    } else if (wasEmpty) {
      // First subscription, connect if not already
      this.connect();
    }
  }

  unsubscribe(symbol: string, callback: PriceUpdateCallback) {
    const callbacks = this.subscribers.get(symbol);
    if (callbacks) {
      const filtered = callbacks.filter((cb) => cb !== callback);
      if (filtered.length === 0) {
        this.subscribers.delete(symbol);
        this.subscribedSymbols.delete(symbol);
        if (this.isAuthenticated) {
          this.unsubscribeFromSymbols([symbol]);
        }
      } else {
        this.subscribers.set(symbol, filtered);
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
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
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.subscribers.clear();
    this.subscribedSymbols.clear();
    this.lastPrices.clear();
    this.isConnecting = false;
    this.isAuthenticated = false;
  }
}

export const alpacaWebSocketService = new AlpacaWebSocketService();
