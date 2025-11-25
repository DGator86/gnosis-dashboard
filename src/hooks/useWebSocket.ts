import { useEffect, useState } from "react";
import { websocketService } from "../services/websocket";

export function useWebSocket(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    websocketService.connect();
    setIsConnected(true);

    const callback = (sym: string, newPrice: number, priceChange: number) => {
      setPrice(newPrice);
      setChange(priceChange);
    };

    websocketService.subscribe(symbol, callback);

    return () => {
      websocketService.unsubscribe(symbol, callback);
    };
  }, [symbol]);

  return { price, change, isConnected };
}
