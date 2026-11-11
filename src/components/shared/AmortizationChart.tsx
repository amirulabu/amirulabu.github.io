import { useMemo, useState } from "preact/hooks";
import type { AmortPoint } from "../../lib/loan";

const formatRM = (n: number) =>
  "RM " +
  n.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtK = (n: number) => {
  if (n >= 1_000_000) {
    const value = n / 1_000_000;
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}mil`;
  }
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
};

export default function AmortizationChart({
  series,
  title = "Interest vs Principal Over Time",
}: {
  series: AmortPoint[];
  title?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const geometry = useMemo(() => {
    const w = 480;
    const h = 260;
    const pad = { top: 20, right: 16, bottom: 34, left: 62 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const lastYear = series.at(-1)?.year ?? 1;
    const maxY =
      Math.max(
        ...series.map((p) => p.principal + p.interest),
        ...series.map((p) => p.balance),
        1,
      ) * 1.08;

    const x = (year: number) => pad.left + (year / lastYear) * plotW;
    const y = (value: number) => pad.top + plotH - (value / maxY) * plotH;

    const principalArea =
      `M ${x(0)} ${y(0)}` +
      series.map((p) => ` L ${x(p.year)} ${y(p.principal)}`).join("") +
      ` L ${x(lastYear)} ${y(0)} Z`;

    const interestArea =
      `M ${x(series[0]?.year ?? 0)} ${y(series[0]?.principal ?? 0)}` +
      series
        .map((p) => ` L ${x(p.year)} ${y(p.principal + p.interest)}`)
        .join("") +
      ` L ${x(lastYear)} ${y(series.at(-1)?.principal ?? 0)} Z`;

    const balanceLine =
      `M ${x(0)} ${y(series[0]?.balance ?? 0)}` +
      series.map((p) => ` L ${x(p.year)} ${y(p.balance)}`).join("");

    const tickStep = Math.max(1, Math.ceil(lastYear / 5));
    const yearTicks = series
      .filter(
        (p) => p.year === 0 || p.year === lastYear || p.year % tickStep === 0,
      )
      .map((p) => p.year);

    const yTicks = Array.from({ length: 6 }, (_, i) => (maxY / 5) * i);

    return {
      w,
      h,
      pad,
      plotW,
      plotH,
      maxY,
      x,
      y,
      principalArea,
      interestArea,
      balanceLine,
      yearTicks,
      yTicks,
    };
  }, [series]);

  const lastYear = series.at(-1)?.year ?? 1;
  const { w, h, pad, plotW, plotH, x, y } = geometry;

  const indexFromX = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * w;
    const year = ((svgX - pad.left) / plotW) * lastYear;
    const idx = Math.round(year);
    return idx >= 0 && idx < series.length ? idx : null;
  };

  const hover = hoverIdx === null ? null : series[hoverIdx];
  const point = hover
    ? { cumPrincipal: hover.principal, cumInterest: hover.interest }
    : null;

  if (series.length <= 1) return null;

  return (
    <div class="amort-chart-wrap">
      <div class="amort-chart-title">{title}</div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        class="amort-chart"
        onMouseMove={(e) => setHoverIdx(indexFromX(e.clientX, e.currentTarget))}
        onMouseLeave={() => setHoverIdx(null)}
        onTouchMove={(e) => {
          e.preventDefault();
          setHoverIdx(indexFromX(e.touches[0].clientX, e.currentTarget));
        }}
        onTouchEnd={() => setHoverIdx(null)}
        onTouchCancel={() => setHoverIdx(null)}
      >
        {geometry.yTicks.map((tick) => (
          <line
            x1={pad.left}
            y1={y(tick)}
            x2={w - pad.right}
            y2={y(tick)}
            stroke="#e5e5e5"
            stroke-width="1"
          />
        ))}

        {geometry.yearTicks.map((year) => (
          <g>
            <line
              x1={x(year)}
              y1={pad.top + plotH}
              x2={x(year)}
              y2={pad.top + plotH + 4}
              stroke="#999"
              stroke-width="1"
            />
            <text
              x={x(year)}
              y={pad.top + plotH + 18}
              text-anchor="middle"
              font-size="11"
              fill="#777"
            >
              {year}yr
            </text>
          </g>
        ))}

        {geometry.yTicks.map((tick) => (
          <text
            x={pad.left - 6}
            y={y(tick) + 4}
            text-anchor="end"
            font-size="10"
            fill="#777"
          >
            {fmtK(tick)}
          </text>
        ))}

        <path d={geometry.principalArea} fill="#3573C6" opacity="0.85" />
        <path d={geometry.interestArea} fill="#E8634A" opacity="0.75" />
        <path
          d={geometry.balanceLine}
          fill="none"
          stroke="#2E7D32"
          stroke-width="2"
          stroke-dasharray="6 3"
        />

        {hover && (
          <line
            x1={x(hover.year)}
            y1={pad.top}
            x2={x(hover.year)}
            y2={pad.top + plotH}
            stroke="#333"
            stroke-width="1"
            stroke-dasharray="4 2"
            opacity="0.6"
          />
        )}

        <line
          x1={pad.left}
          y1={pad.top + plotH}
          x2={w - pad.right}
          y2={pad.top + plotH}
          stroke="#999"
          stroke-width="1"
        />
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={pad.top + plotH}
          stroke="#999"
          stroke-width="1"
        />
      </svg>

      <div class="amort-legend">
        <span class="amort-legend-item">
          <span class="amort-legend-dot" style="background:#3573C6" />
          Principal
        </span>
        <span class="amort-legend-item">
          <span class="amort-legend-dot" style="background:#E8634A" />
          Interest
        </span>
        <span class="amort-legend-item">
          <span class="amort-legend-line balance-line" />
          Balance
        </span>
      </div>

      {hover && point && (
        <div class="amort-tooltip">
          <strong>Year {hover.year}</strong>
          <div class="amort-tooltip-row">
            <span class="amort-tooltip-dot" style="background:#3573C6" />
            <span>Principal paid</span>
            <span class="amort-tooltip-val">
              {formatRM(point.cumPrincipal)}
            </span>
          </div>
          <div class="amort-tooltip-row">
            <span class="amort-tooltip-dot" style="background:#E8634A" />
            <span>Interest paid</span>
            <span class="amort-tooltip-val">{formatRM(point.cumInterest)}</span>
          </div>
          <div class="amort-tooltip-row total">
            <span>Total paid</span>
            <span class="amort-tooltip-val">
              {formatRM(point.cumPrincipal + point.cumInterest)}
            </span>
          </div>
          <div class="amort-tooltip-row">
            <span class="amort-tooltip-dot" style="background:#2E7D32" />
            <span>Balance left</span>
            <span class="amort-tooltip-val">{formatRM(hover.balance)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
