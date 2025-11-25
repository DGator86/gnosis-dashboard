export type SymbolInfo = {
  symbol: string;
  name: string;
  sector: string;
  marketCap: string;
  beta: number;
  description: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
};

export type PricePoint = {
  time: string;
  price: number;
};

export type CandleData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type TradeIdea = {
  id: string;
  symbol: string;
  title: string;
  thesis: string;
  direction: "LONG" | "SHORT";
  confidence: number; // 0–1
  horizon: "INTRADAY" | "SWING" | "POSITION";
  createdAt: Date;
};

export type TimeFrame = "1D" | "5D" | "1M" | "3M" | "1Y" | "ALL";

export type ChartType = "LINE" | "CANDLE" | "AREA";

export type OrderType = "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";

export type OrderSide = "BUY" | "SELL";

export type Order = {
  id: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED";
  createdAt: Date;
  filledAt?: Date;
};

export type Position = {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
};

export type Alert = {
  id: string;
  symbol: string;
  condition: "ABOVE" | "BELOW" | "CROSSES";
  price: number;
  enabled: boolean;
  triggered: boolean;
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  watchlist: string[];
  preferences: UserPreferences;
};

export type UserPreferences = {
  theme: "dark" | "light";
  defaultTimeFrame: TimeFrame;
  defaultChartType: ChartType;
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    tradeIdeas: boolean;
  };
};

export type Indicator = {
  type: "SMA" | "EMA" | "RSI" | "MACD" | "BOLLINGER";
  period: number;
  visible: boolean;
  color?: string;
};

export type IndicatorData = {
  sma?: number[];
  ema?: number[];
  rsi?: number[];
  macd?: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollinger?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
};
