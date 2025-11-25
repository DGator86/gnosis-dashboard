import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Bar,
  ComposedChart,
} from "recharts";
import type { CandleData, IndicatorData } from "../types";
import { format } from "date-fns";

interface Props {
  data: CandleData[];
  indicators: IndicatorData;
  showRSI?: boolean;
  showMACD?: boolean;
}

export const IndicatorPanel: React.FC<Props> = ({
  data,
  indicators,
  showRSI = true,
  showMACD = true,
}) => {
  const chartData = data.map((candle, i) => ({
    time: format(new Date(candle.time), "MM/dd HH:mm"),
    rsi: indicators.rsi?.[i],
    macd: indicators.macd?.macd[i],
    macdSignal: indicators.macd?.signal[i],
    macdHistogram: indicators.macd?.histogram[i],
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px" }}>
      {showRSI && indicators.rsi && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-mute)", marginBottom: "4px", paddingLeft: "8px" }}>
            RSI (14)
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} hide />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <ReferenceLine y={70} stroke="#f97373" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {showMACD && indicators.macd && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-mute)", marginBottom: "4px", paddingLeft: "8px" }}>
            MACD (12, 26, 9)
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} hide />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <ReferenceLine y={0} stroke="#6b7280" />
              <Bar
                dataKey="macdHistogram"
                fill="#4f46e5"
                opacity={0.5}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="macdSignal"
                stroke="#f97373"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
