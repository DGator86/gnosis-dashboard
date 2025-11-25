import type { CandleData, SymbolInfo, TradeIdea, TimeFrame } from "../types";
import { alpacaAPI } from "./alpaca";

// Map our TimeFrame to Alpaca timeframe
const timeframeMap: Record<TimeFrame, { tf: string; days: number }> = {
  "1D": { tf: "5Min", days: 1 },
  "5D": { tf: "15Min", days: 5 },
  "1M": { tf: "1Hour", days: 30 },
  "3M": { tf: "1Day", days: 90 },
  "1Y": { tf: "1Day", days: 365 },
  "ALL": { tf: "1Day", days: 365 * 5 },
};

// Mock trade ideas generator based on technical analysis
function generateTradeIdeas(symbol: string, candles: CandleData[]): TradeIdea[] {
  if (candles.length < 20) return [];

  const ideas: TradeIdea[] = [];
  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  // Calculate simple indicators
  const closes = candles.slice(-20).map(c => c.close);
  const sma20 = closes.reduce((a, b) => a + b) / closes.length;
  const priceChange = ((latest.close - prev.close) / prev.close) * 100;
  
  // Generate ideas based on price action
  if (latest.close > sma20 && priceChange > 1) {
    ideas.push({
      id: `${symbol}-${Date.now()}-1`,
      symbol,
      title: `${symbol} Breakout Above 20 SMA`,
      thesis: `${symbol} has broken above its 20-period SMA with strong momentum (+${priceChange.toFixed(2)}%). This suggests continued upside potential. Consider call spreads or long positions.`,
      direction: "LONG",
      confidence: 0.75,
      horizon: "SWING",
      createdAt: new Date(),
    });
  }
  
  if (latest.close < sma20 && priceChange < -1) {
    ideas.push({
      id: `${symbol}-${Date.now()}-2`,
      symbol,
      title: `${symbol} Pullback to Support`,
      thesis: `${symbol} is trading below 20 SMA with ${Math.abs(priceChange).toFixed(2)}% decline. This could be a mean-reversion opportunity if support holds. Consider put spreads or protective positions.`,
      direction: "SHORT",
      confidence: 0.65,
      horizon: "INTRADAY",
      createdAt: new Date(),
    });
  }
  
  // Volume analysis
  const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
  if (latest.volume > avgVolume * 1.5) {
    ideas.push({
      id: `${symbol}-${Date.now()}-3`,
      symbol,
      title: `${symbol} High Volume Alert`,
      thesis: `Unusual volume detected (${((latest.volume / avgVolume) * 100).toFixed(0)}% of average). This suggests institutional interest or significant news. Monitor for continuation or reversal.`,
      direction: priceChange > 0 ? "LONG" : "SHORT",
      confidence: 0.7,
      horizon: "SWING",
      createdAt: new Date(),
    });
  }

  return ideas;
}

export const api = {
  // Get candles with real Alpaca data
  async getCandles(symbol: string, timeFrame: TimeFrame): Promise<CandleData[]> {
    try {
      const { tf, days } = timeframeMap[timeFrame];
      const end = new Date();
      const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
      
      const candles = await alpacaAPI.getBars(
        symbol,
        tf as any,
        start,
        end,
        1000
      );
      
      if (candles.length === 0) {
        console.warn(`No candles returned for ${symbol}, using fallback`);
        // Fallback to mock data if no real data available
        return this.getMockCandles(symbol, timeFrame);
      }
      
      return candles;
    } catch (error) {
      console.error(`Failed to fetch candles for ${symbol}:`, error);
      // Fallback to mock data on error
      return this.getMockCandles(symbol, timeFrame);
    }
  },

  // Fallback mock candles
  getMockCandles(symbol: string, timeFrame: TimeFrame): CandleData[] {
    const now = Date.now();
    const candles: CandleData[] = [];
    
    const basePrices: Record<string, number> = {
      SPY: 550, QQQ: 480, TSLA: 285, AAPL: 215, NVDA: 850,
      MSFT: 410, GOOGL: 175, AMZN: 185, META: 520, AMD: 165,
    };

    const basePrice = basePrices[symbol] || 100;
    let currentPrice = basePrice;

    const intervals: Record<TimeFrame, number> = {
      "1D": 5 * 60 * 1000,
      "5D": 30 * 60 * 1000,
      "1M": 4 * 60 * 60 * 1000,
      "3M": 24 * 60 * 60 * 1000,
      "1Y": 7 * 24 * 60 * 60 * 1000,
      "ALL": 30 * 24 * 60 * 60 * 1000,
    };

    const interval = intervals[timeFrame];
    const count = 100;

    for (let i = count - 1; i >= 0; i--) {
      const time = now - i * interval;
      const volatility = 0.02;
      
      const open = currentPrice;
      const change = (Math.random() - 0.5) * basePrice * volatility;
      const close = open + change;
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;

      candles.push({ time, open, high, low, close, volume });
      currentPrice = close;
    }

    return candles;
  },

  // Get symbol info with real Alpaca data
  async getSymbolInfo(symbol: string): Promise<SymbolInfo> {
    try {
      const info = await alpacaAPI.getSnapshot(symbol);
      return info;
    } catch (error) {
      console.error(`Failed to fetch symbol info for ${symbol}:`, error);
      // Fallback to mock data
      return {
        symbol,
        name: symbol,
        sector: "Stock",
        marketCap: "N/A",
        beta: 1.0,
        description: `Real-time data temporarily unavailable for ${symbol}`,
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
      };
    }
  },

  // Search symbols using Alpaca
  async searchSymbols(query: string): Promise<SymbolInfo[]> {
    try {
      return await alpacaAPI.searchSymbols(query);
    } catch (error) {
      console.error("Failed to search symbols:", error);
      return [];
    }
  },

  // Get trade ideas (AI-generated based on technical analysis)
  async getTradeIdeas(symbol?: string): Promise<TradeIdea[]> {
    try {
      if (symbol) {
        // Get recent candles and generate ideas
        const candles = await this.getCandles(symbol, "1D");
        return generateTradeIdeas(symbol, candles);
      }
      
      // Generate ideas for multiple symbols
      const symbols = ["SPY", "QQQ", "TSLA", "AAPL"];
      const allIdeas: TradeIdea[] = [];
      
      for (const sym of symbols) {
        const candles = await this.getCandles(sym, "1D");
        const ideas = generateTradeIdeas(sym, candles);
        allIdeas.push(...ideas);
      }
      
      return allIdeas.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error("Failed to generate trade ideas:", error);
      return [];
    }
  },

  // Authentication (mock for now)
  async login(email: string, password: string) {
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
};
