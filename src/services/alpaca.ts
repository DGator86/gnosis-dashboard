import type { CandleData, SymbolInfo, Order, Position } from "../types";

const ALPACA_API_KEY = import.meta.env.VITE_ALPACA_API_KEY;
const ALPACA_SECRET_KEY = import.meta.env.VITE_ALPACA_SECRET_KEY;
const ALPACA_BASE_URL = import.meta.env.VITE_ALPACA_BASE_URL || "https://paper-api.alpaca.markets";

// Helper to create auth headers
const getHeaders = () => ({
  "APCA-API-KEY-ID": ALPACA_API_KEY,
  "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
  "Content-Type": "application/json",
});

// Helper to create data API headers (different auth)
const getDataHeaders = () => ({
  "APCA-API-KEY-ID": ALPACA_API_KEY,
  "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
});

export const alpacaAPI = {
  // Get account information
  async getAccount() {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/account`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch account: ${response.statusText}`);
    }
    return response.json();
  },

  // Get all positions
  async getPositions(): Promise<Position[]> {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/positions`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch positions: ${response.statusText}`);
    }
    const positions = await response.json();
    
    return positions.map((pos: any) => ({
      symbol: pos.symbol,
      quantity: parseFloat(pos.qty),
      avgPrice: parseFloat(pos.avg_entry_price),
      currentPrice: parseFloat(pos.current_price),
      pnl: parseFloat(pos.unrealized_pl),
      pnlPercent: parseFloat(pos.unrealized_plpc) * 100,
    }));
  },

  // Get all orders
  async getOrders(status: "open" | "closed" | "all" = "all"): Promise<Order[]> {
    const response = await fetch(
      `${ALPACA_BASE_URL}/v2/orders?status=${status}&limit=100`,
      { headers: getHeaders() }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
    const orders = await response.json();
    
    return orders.map((order: any) => ({
      id: order.id,
      symbol: order.symbol,
      type: order.type.toUpperCase(),
      side: order.side.toUpperCase(),
      quantity: parseFloat(order.qty),
      price: order.limit_price ? parseFloat(order.limit_price) : undefined,
      stopPrice: order.stop_price ? parseFloat(order.stop_price) : undefined,
      status: order.status.toUpperCase(),
      createdAt: new Date(order.created_at),
      filledAt: order.filled_at ? new Date(order.filled_at) : undefined,
    }));
  },

  // Place an order
  async placeOrder(order: {
    symbol: string;
    qty: number;
    side: "buy" | "sell";
    type: "market" | "limit" | "stop" | "stop_limit";
    time_in_force: "day" | "gtc" | "ioc" | "fok";
    limit_price?: number;
    stop_price?: number;
  }) {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to place order: ${response.statusText}`);
    }
    return response.json();
  },

  // Cancel an order
  async cancelOrder(orderId: string) {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/orders/${orderId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }
    return response.status === 204;
  },

  // Get latest quote for a symbol
  async getLatestQuote(symbol: string) {
    const response = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`,
      { headers: getDataHeaders() }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch quote: ${response.statusText}`);
    }
    const data = await response.json();
    return data.quote;
  },

  // Get latest trade for a symbol
  async getLatestTrade(symbol: string) {
    const response = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/trades/latest`,
      { headers: getDataHeaders() }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch trade: ${response.statusText}`);
    }
    const data = await response.json();
    return data.trade;
  },

  // Get historical bars (candles)
  async getBars(
    symbol: string,
    timeframe: "1Min" | "5Min" | "15Min" | "1Hour" | "1Day",
    start?: Date,
    end?: Date,
    limit: number = 1000
  ): Promise<CandleData[]> {
    const params = new URLSearchParams({
      timeframe,
      limit: limit.toString(),
    });
    
    if (start) params.append("start", start.toISOString());
    if (end) params.append("end", end.toISOString());

    const response = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/bars?${params}`,
      { headers: getDataHeaders() }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bars: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.bars || data.bars.length === 0) {
      return [];
    }

    return data.bars.map((bar: any) => ({
      time: new Date(bar.t).getTime(),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));
  },

  // Get snapshot with current price and stats
  async getSnapshot(symbol: string): Promise<SymbolInfo> {
    const response = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/snapshot`,
      { headers: getDataHeaders() }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch snapshot: ${response.statusText}`);
    }
    
    const data = await response.json();
    const snapshot = data;
    
    // Also get company info from assets endpoint
    let companyName = symbol;
    let sector = "Unknown";
    let marketCap = "N/A";
    
    try {
      const assetResponse = await fetch(
        `${ALPACA_BASE_URL}/v2/assets/${symbol}`,
        { headers: getHeaders() }
      );
      if (assetResponse.ok) {
        const asset = await assetResponse.json();
        companyName = asset.name || symbol;
        sector = asset.exchange || "Stock";
      }
    } catch (e) {
      console.warn(`Could not fetch asset info for ${symbol}`);
    }

    const currentPrice = snapshot.latestTrade?.p || 0;
    const prevClose = snapshot.prevDailyBar?.c || currentPrice;
    const change = currentPrice - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol,
      name: companyName,
      sector,
      marketCap,
      beta: 1.0, // Not available from Alpaca
      description: `Real-time data for ${companyName}`,
      price: currentPrice,
      change,
      changePercent,
      volume: snapshot.dailyBar?.v || 0,
    };
  },

  // Search for symbols
  async searchSymbols(query: string): Promise<SymbolInfo[]> {
    const response = await fetch(
      `${ALPACA_BASE_URL}/v2/assets?status=active&asset_class=us_equity`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search symbols: ${response.statusText}`);
    }
    
    const assets = await response.json();
    
    // Filter by query
    const filtered = assets
      .filter((asset: any) => 
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        (asset.name && asset.name.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 10);

    // Get snapshots for each
    const results = await Promise.all(
      filtered.map(async (asset: any) => {
        try {
          return await this.getSnapshot(asset.symbol);
        } catch (e) {
          // Fallback if snapshot fails
          return {
            symbol: asset.symbol,
            name: asset.name || asset.symbol,
            sector: asset.exchange || "Stock",
            marketCap: "N/A",
            beta: 1.0,
            description: `${asset.name || asset.symbol}`,
          };
        }
      })
    );

    return results;
  },

  // Get watchlist
  async getWatchlists() {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/watchlists`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch watchlists: ${response.statusText}`);
    }
    return response.json();
  },

  // Create watchlist
  async createWatchlist(name: string, symbols: string[]) {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/watchlists`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, symbols }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create watchlist: ${response.statusText}`);
    }
    return response.json();
  },
};
