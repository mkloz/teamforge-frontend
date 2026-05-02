"use client";

import React from "react";

import { cn } from "@/shared/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof import("recharts").ResponsiveContainer
  >["children"];
};

function ChartContainer({
  id,
  className,
  children,
  config,
  ref,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='var(--border)']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='var(--background)']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='var(--border)']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='var(--border)']]:stroke-border [&_.recharts-sector[stroke='var(--background)']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </div>
    </ChartContext>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: (["light", "dark"] as const)
          .map(
            (theme) => `
${THEMES[theme]} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = ({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
}: {
  active?: boolean;
  payload?: Array<{
    value: number | string;
    name: string;
    dataKey: string;
    payload: Record<string, unknown>;
    fill?: string;
    stroke?: string;
  }>;
  className?: string;
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: string;
  labelFormatter?: (value: string, payload: unknown[]) => React.ReactNode;
  labelClassName?: string;
  formatter?: (value: number, name: string) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}) => {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const tooltipLabel = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(label || "", payload)
      : label;

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {tooltipLabel && (
        <div className={cn("font-medium", labelClassName)}>{tooltipLabel}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${item.name || item.dataKey || "value"}`;
          const itemConfig = config[key];
          const indicatorColor = color || item.fill || item.stroke;

          const itemStyle: React.CSSProperties &
            Record<string, string | number> = {
            "--color-bg": indicatorColor ?? "transparent",
            "--color-border": indicatorColor ?? "transparent",
          };

          return (
            <div
              key={item.dataKey || index}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
              )}
            >
              {!hideIndicator && (
                <div
                  className={cn(
                    "shrink-0 rounded-sm border-[--color-border] bg-[--color-bg]",
                    {
                      "h-2.5 w-2.5": indicator === "dot",
                      "w-1": indicator === "line",
                      "w-0 border-thin border-dashed bg-transparent":
                        indicator === "dashed",
                    },
                  )}
                  style={itemStyle}
                />
              )}
              <div className="flex flex-1 justify-between leading-none">
                <span className="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatter && typeof item.value === "number"
                    ? formatter(item.value, item.name)
                    : item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChartTooltipContent = ChartTooltip;

const ChartLegend = ({
  payload,
  className,
  hideIcon = false,
  nameKey,
}: {
  payload?: Array<{
    value: string;
    dataKey?: string;
    color?: string;
  }>;
  className?: string;
  hideIcon?: boolean;
  nameKey?: string;
}) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {payload.map((item) => {
        const _key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = config[_key];

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {!hideIcon && (
              <div
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label || item.value}
          </div>
        );
      })}
    </div>
  );
};

const ChartLegendContent = ChartLegend;

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
};
