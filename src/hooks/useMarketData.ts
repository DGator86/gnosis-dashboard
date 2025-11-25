import { useEffect, useState } from "react";
import { api } from "../services/apiIntegrated";
import type { CandleData, SymbolInfo, TimeFrame } from "../types";

export function useMarketData(symbol: string, timeFrame: TimeFrame) {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [symbolInfo, setSymbolInfo] = useState<SymbolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [candleData, info] = await Promise.all([
          api.getCandles(symbol, timeFrame),
          api.getSymbolInfo(symbol),
        ]);

        if (isMounted) {
          setCandles(candleData);
          setSymbolInfo(info);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [symbol, timeFrame]);

  return { candles, symbolInfo, loading, error };
}
