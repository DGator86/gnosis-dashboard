import type { CandleData, SymbolInfo, TradeIdea, TimeFrame } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.example.com/v1";

// Mock data generators
function generateMockCandles(
  symbol: string,
  timeFrame: TimeFrame,
  count: number = 100
): CandleData[] {
  const now = Date.now();
  const candles: CandleData[] = [];
  
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

  const basePrice = basePrices[symbol] || 100;
  let currentPrice = basePrice;

  const intervals: Record<TimeFrame, number> = {
    "1D": 5 * 60 * 1000, // 5 minutes
    "5D": 30 * 60 * 1000, // 30 minutes
    "1M": 4 * 60 * 60 * 1000, // 4 hours
    "3M": 24 * 60 * 60 * 1000, // 1 day
    "1Y": 7 * 24 * 60 * 60 * 1000, // 1 week
    "ALL": 30 * 24 * 60 * 60 * 1000, // 1 month
  };

  const interval = intervals[timeFrame];

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * interval;
    const volatility = 0.02; // 2% volatility
    
    const open = currentPrice;
    const change = (Math.random() - 0.5) * basePrice * volatility;
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.floor(Math.random() * 10000000) + 1000000;

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

export const api = {
  // Authentication
  async login(email: string, password: string) {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      token: "mock-jwt-token",
      user: {
        id: "1",
        email,
        name: email.split("@")[0],
      },
    };
  },

  async logout() {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // Market data
  async getCandles(symbol: string, timeFrame: TimeFrame): Promise<CandleData[]> {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateMockCandles(symbol, timeFrame);
  },

  async getSymbolInfo(symbol: string): Promise<SymbolInfo> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const symbolData: Record<string, SymbolInfo> = {
      SPY: {
        symbol: "SPY",
        name: "SPDR S&P 500 ETF",
        sector: "Index / ETF",
        marketCap: "$500B+",
        beta: 1.0,
        description: "Proxy for broad U.S. large-cap market. Often used as the primary field reference for Gnosis.",
        price: 550.25,
        change: 2.35,
        changePercent: 0.43,
        volume: 85234000,
      },
      QQQ: {
        symbol: "QQQ",
        name: "Invesco QQQ Trust",
        sector: "Index / ETF – Tech heavy",
        marketCap: "$250B+",
        beta: 1.2,
        description: "Nasdaq-100 tracker, higher beta vs SPY. Strong tech concentration, good for momentum and rotations.",
        price: 480.15,
        change: -1.25,
        changePercent: -0.26,
        volume: 45123000,
      },
      TSLA: {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        sector: "Consumer Discretionary / EV",
        marketCap: "$500B+",
        beta: 1.8,
        description: "High-beta single name. Excellent vehicle for dealer-hedging flows and 0DTE structures.",
        price: 285.50,
        change: 8.75,
        changePercent: 3.16,
        volume: 125000000,
      },
      AAPL: {
        symbol: "AAPL",
        name: "Apple Inc.",
        sector: "Information Technology",
        marketCap: "$3T+",
        beta: 1.1,
        description: "Mega-cap, heavy index weight. Critical for SPY/QQQ structure and institutional positioning.",
        price: 215.30,
        change: 0.85,
        changePercent: 0.40,
        volume: 58000000,
      },
      NVDA: {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        sector: "Information Technology / AI",
        marketCap: "$2T+",
        beta: 1.6,
        description: "AI chip leader, high volatility, major options activity. Key for tech sector momentum.",
        price: 850.00,
        change: 15.30,
        changePercent: 1.83,
        volume: 42000000,
      },
      MSFT: {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        sector: "Information Technology / Cloud",
        marketCap: "$3T+",
        beta: 0.9,
        description: "Mega-cap cloud and AI leader. Stable growth with strong institutional support.",
        price: 410.25,
        change: 3.15,
        changePercent: 0.77,
        volume: 28000000,
      },
    };

    return symbolData[symbol] || symbolData.SPY;
  },

  async searchSymbols(query: string): Promise<SymbolInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock search - return symbols that match query
    const allSymbols = ["SPY", "QQQ", "TSLA", "AAPL", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "AMD"];
    const matches = allSymbols.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
    return Promise.all(matches.map((s) => this.getSymbolInfo(s)));
  },

  // Trade ideas
  async getTradeIdeas(symbol?: string): Promise<TradeIdea[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const allIdeas: TradeIdea[] = [
      {
        id: "1",
        symbol: "SPY",
        title: "SPY mean-reversion long into VWAP",
        thesis: "Dealer gamma flips mildly positive intraday while liquidity pocket sits just below spot. Expect fade of morning extension back into VWAP.",
        direction: "LONG",
        confidence: 0.72,
        horizon: "INTRADAY",
        createdAt: new Date(),
      },
      {
        id: "2",
        symbol: "SPY",
        title: "0DTE call spread into resistance",
        thesis: "Top of field cone aligns with prior RTH high. Structure: tight call spread with defined risk, targeting 30–40% move.",
        direction: "LONG",
        confidence: 0.65,
        horizon: "INTRADAY",
        createdAt: new Date(),
      },
      {
        id: "3",
        symbol: "TSLA",
        title: "TSLA short gamma squeeze potential",
        thesis: "Heavy short-dated call open interest above spot with dealers short gamma. If spot breaks trigger level, accelerate to next liquidity shelf.",
        direction: "LONG",
        confidence: 0.8,
        horizon: "SWING",
        createdAt: new Date(),
      },
      {
        id: "4",
        symbol: "AAPL",
        title: "AAPL covered call candidate",
        thesis: "Vol surface elevated vs realized. Good candidate for covered calls or call credit spreads at upper field boundary.",
        direction: "SHORT",
        confidence: 0.6,
        horizon: "POSITION",
        createdAt: new Date(),
      },
      {
        id: "5",
        symbol: "QQQ",
        title: "QQQ downside hedge via put spread",
        thesis: "Macro regime flagging elevated downside tail risk next 5–10 sessions. Cheap put spreads provide asymmetric protection.",
        direction: "SHORT",
        confidence: 0.7,
        horizon: "SWING",
        createdAt: new Date(),
      },
      {
        id: "6",
        symbol: "NVDA",
        title: "NVDA breakout continuation",
        thesis: "Recent earnings beat catalyst with strong volume. Technical breakout confirmed above resistance with increasing institutional flow.",
        direction: "LONG",
        confidence: 0.78,
        horizon: "SWING",
        createdAt: new Date(),
      },
    ];

    return symbol
      ? allIdeas.filter((idea) => idea.symbol === symbol)
      : allIdeas;
  },
};
