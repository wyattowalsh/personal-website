"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ChartType = "line" | "bar" | "pie" | "area" | "radar";

interface DataPoint {
  [key: string]: string | number;
}

interface ChartProps {
  type: ChartType;
  data: DataPoint[];
  dataKeys: string[];
  xAxisKey?: string;
  title?: string;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  "#6366f1", // indigo
  "#22c55e", // green
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#06b6d4", // cyan
];

export default function Chart({
  type,
  data,
  dataKeys,
  xAxisKey = "name",
  title,
  height = 300,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  stacked = false,
  className,
}: ChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setMounted(true);
  });

  const isDark = resolvedTheme === "dark";

  const themeColors = useMemo(() => ({
    text: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "#334155" : "#e2e8f0",
    background: isDark ? "#1e293b" : "#ffffff",
    tooltip: {
      bg: isDark ? "#0f172a" : "#ffffff",
      border: isDark ? "#334155" : "#e2e8f0",
      text: isDark ? "#f8fafc" : "#1e293b",
    },
  }), [isDark]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        className={cn(
          "px-3 py-2 rounded-lg shadow-lg",
          "border backdrop-blur-sm",
          isDark ? "bg-slate-900/90 border-slate-700" : "bg-white/90 border-slate-200"
        )}
      >
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "my-6 rounded-xl overflow-hidden",
          "bg-muted/50 animate-pulse",
          className
        )}
        style={{ height }}
      />
    );
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />}
            <XAxis dataKey={xAxisKey} stroke={themeColors.text} fontSize={12} />
            <YAxis stroke={themeColors.text} fontSize={12} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />}
            <XAxis dataKey={xAxisKey} stroke={themeColors.text} fontSize={12} />
            <YAxis stroke={themeColors.text} fontSize={12} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                stackId={stacked ? "stack" : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />}
            <XAxis dataKey={xAxisKey} stroke={themeColors.text} fontSize={12} />
            <YAxis stroke={themeColors.text} fontSize={12} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Pie
              data={data}
              dataKey={dataKeys[0]}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={{ stroke: themeColors.text }}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart data={data} cx="50%" cy="50%" outerRadius={height / 3}>
            <PolarGrid stroke={themeColors.grid} />
            <PolarAngleAxis dataKey={xAxisKey} stroke={themeColors.text} fontSize={12} />
            <PolarRadiusAxis stroke={themeColors.text} fontSize={10} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </RadarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "my-6 p-4 rounded-xl",
        "bg-card/50 border border-border/50",
        "transition-colors duration-300",
        className
      )}
    >
      {title && (
        <h4 className="text-lg font-semibold mb-4 text-center">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
