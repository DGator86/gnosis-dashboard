const UW_API_KEY = import.meta.env.VITE_UNUSUAL_WHALES_API_KEY;
const UW_BASE_URL = import.meta.env.VITE_UNUSUAL_WHALES_BASE_URL || "https://api.unusualwhales.com/api";

const getHeaders = () => ({
  "Authorization": `Bearer ${UW_API_KEY}`,
  "Accept": "application/json",
});

export interface OptionsFlow {
  ticker: string;
  date: string;
  time: string;
  expiration_date: string;
  strike: number;
  call_put: "CALL" | "PUT";
  premium: number;
  size: number;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  spot_price: number;
  bid: number;
  ask: number;
  midpoint: number;
}

export interface WhaleActivity {
  ticker: string;
  date: string;
  time: string;
  type: "OPTIONS" | "STOCK";
  value: number;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  description: string;
}

export interface MarketOverview {
  total_premium: number;
  call_premium: number;
  put_premium: number;
  call_put_ratio: number;
  most_active_tickers: Array<{
    ticker: string;
    premium: number;
    volume: number;
  }>;
}

export const unusualWhalesAPI = {
  // Get options flow for a specific ticker
  async getOptionsFlow(ticker: string, limit: number = 50): Promise<OptionsFlow[]> {
    try {
      const response = await fetch(
        `${UW_BASE_URL}/stock/${ticker}/options-flow?limit=${limit}`,
        { headers: getHeaders() }
      );
      
      if (!response.ok) {
        console.warn(`Unusual Whales API error for ${ticker}: ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Failed to fetch options flow for ${ticker}:`, error);
      return [];
    }
  },

  // Get whale activity (large unusual trades)
  async getWhaleActivity(ticker?: string, limit: number = 20): Promise<WhaleActivity[]> {
    try {
      const endpoint = ticker 
        ? `${UW_BASE_URL}/stock/${ticker}/whale-activity?limit=${limit}`
        : `${UW_BASE_URL}/whale-activity?limit=${limit}`;
      
      const response = await fetch(endpoint, { headers: getHeaders() });
      
      if (!response.ok) {
        console.warn(`Unusual Whales API error: ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch whale activity:", error);
      return [];
    }
  },

  // Get market-wide options overview
  async getMarketOverview(): Promise<MarketOverview | null> {
    try {
      const response = await fetch(
        `${UW_BASE_URL}/market/options-overview`,
        { headers: getHeaders() }
      );
      
      if (!response.ok) {
        console.warn(`Unusual Whales API error: ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to fetch market overview:", error);
      return null;
    }
  },

  // Get darkpool activity for a ticker
  async getDarkpoolActivity(ticker: string, days: number = 7) {
    try {
      const response = await fetch(
        `${UW_BASE_URL}/stock/${ticker}/darkpool?days=${days}`,
        { headers: getHeaders() }
      );
      
      if (!response.ok) {
        console.warn(`Unusual Whales API error for ${ticker}: ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Failed to fetch darkpool activity for ${ticker}:`, error);
      return [];
    }
  },

  // Get most active options contracts
  async getMostActiveOptions(limit: number = 20) {
    try {
      const response = await fetch(
        `${UW_BASE_URL}/options/most-active?limit=${limit}`,
        { headers: getHeaders() }
      );
      
      if (!response.ok) {
        console.warn(`Unusual Whales API error: ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch most active options:", error);
      return [];
    }
  },

  // Get IV percentile for options
  async getIVPercentile(ticker: string) {
    try {
      const response = await fetch(
        `${UW_BASE_URL}/stock/${ticker}/iv-percentile`,
        { headers: getHeaders() }
      );
      
      if (!response.ok) {
        console.warn(`Unusual Whales API error for ${ticker}: ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Failed to fetch IV percentile for ${ticker}:`, error);
      return null;
    }
  },

  // Get analyst ratings
  async getAnalystRatings(ticker: string) {
    try {
      const response = await fetch(
        `${UW_BASE_URL}/stock/${ticker}/analyst-ratings`,
        { headers: getHeaders() }
      );
      
      if (!response.ok) {
        console.warn(`Unusual Whales API error for ${ticker}: ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Failed to fetch analyst ratings for ${ticker}:`, error);
      return null;
    }
  },
};
