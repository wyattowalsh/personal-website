"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    color?: string
  }
>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/60",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none [&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 1, height: 1 }}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart=${id}] {
${colorConfig
  .map(([key, item]) => `  --color-${key}: ${item.color};`)
  .join("\n")}
}
`,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartPayloadItem = {
  color?: string
  dataKey?: string | number
  name?: string | number
  value?: string | number
  payload?: {
    fill?: string
  }
}

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean
  payload?: ChartPayloadItem[]
  label?: string | number
  indicator?: "dot" | "line"
  hideLabel?: boolean
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "grid min-w-36 gap-2 rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur",
        className
      )}
    >
      {!hideLabel && label ? (
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
          {String(label)}
        </div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "value")
          const itemConfig = config[key]
          const color = item.color || item.payload?.fill || `var(--color-${key})`

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "shrink-0 rounded-full",
                    indicator === "line" ? "h-3 w-1" : "size-2"
                  )}
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">
                  {itemConfig?.label ?? item.name ?? key}
                </span>
              </div>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value ?? "0")}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

type ChartLegendItem = {
  color?: string
  dataKey?: string | number
  value?: string | number
}

function ChartLegendContent({
  payload,
  className,
}: React.ComponentProps<"div"> & {
  payload?: ChartLegendItem[]
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 text-xs", className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value)
        const itemConfig = config[key]

        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{itemConfig?.label ?? item.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
