import { useMemo, memo } from "react";

interface SparklineProps {
  points: number[];
  color: string; // Tailwind hex or class gradient color, e.g., 'rgb(239, 68, 68)'
  id: string;
}

const Sparkline = memo(function Sparkline({ points, color, id }: SparklineProps) {
  const width = 160;
  const height = 44;

  const { pathData, fillData, minVal, maxVal } = useMemo(() => {
    if (!points || points.length === 0) {
      return { pathData: "", fillData: "", minVal: 0, maxVal: 0 };
    }

    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;

    // Build SVG Path points
    const mapped = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      // Invert Y axis, leave 3px margins top/bottom
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return { x, y };
    });

    const path = mapped.reduce((acc, pt, idx) => {
      return acc + (idx === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    }, "");

    // Path closed for gradient background
    const fill = `${path} L ${width} ${height} L 0 ${height} Z`;

    return { pathData: path, fillData: fill, minVal: min, maxVal: max };
  }, [points, width, height]);

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 w-40 text-neutral-500 text-xs font-mono">
        無走勢數據
      </div>
    );
  }

  const gradId = `sparkline-grad-${id}`;

  return (
    <div className="relative group/sparkline flex items-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        id={`svg-sparkline-${id}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path d={fillData} fill={`url(#${gradId})`} />

        {/* High / Low Indicator overlay lines */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Hover pulse dot */}
        <circle
          cx={width}
          cy={height - ((points[points.length - 1] - minVal) / (maxVal - minVal || 1)) * (height - 6) - 3}
          r="1.5"
          fill={color}
          className="animate-pulse"
        />
      </svg>
      {/* Tiny high/low metrics when hover */}
      <div className="absolute right-0 bottom-full hidden group-hover/sparkline:flex bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-zinc-400 p-1 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap gap-1">
        <span>H: <span className="text-zinc-200">{maxVal}</span></span>
        <span>L: <span className="text-zinc-200">{minVal}</span></span>
      </div>
    </div>
  );
});

export default Sparkline;
