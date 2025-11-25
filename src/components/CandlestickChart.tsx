import React, { useEffect, useRef } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
} from "recharts";
import type { CandleData } from "../types";
import { format } from "date-fns";

interface Props {
  data: CandleData[];
  indicators?: {
    sma?: number[];
    ema?: number[];
    bollinger?: {
      upper: number[];
      middle: number[];
      lower: number[];
    };
  };
}

// Custom Candlestick Shape
const CandleStick = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;

  const isGreen = close >= open;
  const color = isGreen ? "#22c55e" : "#f97373";
  const ratio = Math.abs(height / (open - close || 1));

  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y - (high - Math.max(open, close)) * ratio}
        x2={x + width / 2}
        y2={y + height + (Math.min(open, close) - low) * ratio}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height || 1}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export const CandlestickChart: React.FC<Props> = ({ data, indicators }) => {
  const chartData = data.map((candle, i) => ({
    ...candle,
    time: format(new Date(candle.time), "MM/dd HH:mm"),
    sma: indicators?.sma?.[i],
    ema: indicators?.ema?.[i],
    bollingerUpper: indicators?.bollinger?.upper[i],
    bollingerMiddle: indicators?.bollinger?.middle[i],
    bollingerLower: indicators?.bollinger?.lower[i],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={["dataMin - 5", "dataMax + 5"]}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: any, name: string) => {
            if (typeof value === "number") {
              return [`$${value.toFixed(2)}`, name];
            }
            return [value, name];
          }}
        />

        {/* Bollinger Bands */}
        {indicators?.bollinger && (
          <>
            <Line
              type="monotone"
              dataKey="bollingerUpper"
              stroke="#9ca3af"
              strokeWidth={1}
              dot={false}
              strokeDasharray="3 3"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="bollingerMiddle"
              stroke="#6b7280"
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="bollingerLower"
              stroke="#9ca3af"
              strokeWidth={1}
              dot={false}
              strokeDasharray="3 3"
              isAnimationActive={false}
            />
          </>
        )}

        {/* Moving Averages */}
        {indicators?.sma && (
          <Line
            type="monotone"
            dataKey="sma"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        )}
        {indicators?.ema && (
          <Line
            type="monotone"
            dataKey="ema"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        )}

        {/* Candlesticks */}
        <Bar
          dataKey="close"
          shape={<CandleStick />}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
