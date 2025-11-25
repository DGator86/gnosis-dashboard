import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CandleData } from "../types";
import { format } from "date-fns";

interface Props {
  data: CandleData[];
}

export const VolumeChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((candle) => ({
    time: format(new Date(candle.time), "MM/dd HH:mm"),
    volume: candle.volume,
    color: candle.close >= candle.open ? "#22c55e" : "#f97373",
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
            return v.toString();
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: any) => [
            typeof value === "number"
              ? value.toLocaleString()
              : value,
            "Volume",
          ]}
        />
        <Bar
          dataKey="volume"
          fill="#4f46e5"
          opacity={0.7}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
