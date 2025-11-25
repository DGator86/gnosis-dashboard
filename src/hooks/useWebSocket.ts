import { useEffect, useState } from "react";
import { alpacaWebSocketService } from "../services/alpacaWebSocket";

export function useWebSocket(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    alpacaWebSocketService.connect();
    setIsConnected(true);

    const callback = (sym: string, newPrice: number, priceChange: number) => {
      setPrice(newPrice);
      setChange(priceChange);
    };

    alpacaWebSocketService.subscribe(symbol, callback);

    return () => {
      alpacaWebSocketService.unsubscribe(symbol, callback);
    };
  }, [symbol]);

  return { price, change, isConnected };
}
