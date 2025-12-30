
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { formatCurrency, MonthlyData } from '../utils/financial';

const formatYAxisValue = (val: number): string => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toFixed(0);
};

interface DeviationSeries {
  label: string;
  data: MonthlyData[];
  color?: string;
}

interface LineChartProps {
  data: MonthlyData[];
  goalValue?: number;
  deviations?: DeviationSeries[];
}

export const LineChart: React.FC<LineChartProps> = ({ data, goalValue, deviations = [] }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: MonthlyData; label?: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 500;
  const height = 240;
  const margin = { top: 30, right: 60, bottom: 30, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const lastPoint = data.length > 0 ? data[data.length - 1] : null;

  const { yScale, linePathTotal, pointsTotal, xScale, yearlyData, goalPoint, goalY, deviationPaths, maxVal } = useMemo(() => {
    if (!data || data.length === 0) return { yScale: () => 0, linePathTotal: '', pointsTotal: [], xScale: () => 0, yearlyData: [], goalPoint: null, goalY: 0, deviationPaths: [], maxVal: 0 };

    const years = data.length / 12;
    
    // Find absolute max among all series and goal
    let absoluteMax = data[data.length - 1].totalAccumulated;
    deviations.forEach(d => {
        if (d.data.length > 0) {
            absoluteMax = Math.max(absoluteMax, d.data[d.data.length - 1].totalAccumulated);
        }
    });
    const maxVal = Math.max(absoluteMax, goalValue || 0) * 1.1;

    const xScale = (year: number) => (year / years) * innerWidth;
    const yScale = (val: number) => innerHeight - (val / (maxVal > 0 ? maxVal : 1)) * innerHeight;

    const yearlyData: MonthlyData[] = [];
    for (let i = 0; i <= years; i++) {
        const monthIndex = Math.min(i * 12, data.length - 1);
        yearlyData.push(data[monthIndex]);
    }

    const linePathTotal = yearlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.totalAccumulated)}`).join(' ');
    const pointsTotal = yearlyData.map((d,i) => ({x: xScale(i), y: yScale(d.totalAccumulated), data: d}));

    const deviationPaths = deviations.map(dev => {
        const devYearly: MonthlyData[] = [];
        for (let i = 0; i <= years; i++) {
            const monthIndex = Math.min(i * 12, dev.data.length - 1);
            devYearly.push(dev.data[monthIndex]);
        }
        return {
            path: devYearly.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.totalAccumulated)}`).join(' '),
            color: dev.color || '#CBD5E1',
            label: dev.label,
            lastY: yScale(devYearly[devYearly.length - 1].totalAccumulated)
        };
    });

    let goalPoint = null;
    if (goalValue) {
        const reachedIndex = data.findIndex(d => d.totalAccumulated >= goalValue);
        if (reachedIndex !== -1) {
            const yearIndex = reachedIndex / 12;
            goalPoint = {
                x: xScale(yearIndex),
                y: yScale(data[reachedIndex].totalAccumulated),
                year: yearIndex,
                data: data[reachedIndex]
            };
        }
    }

    const goalY = goalValue ? yScale(goalValue) : 0;

    return { xScale, yScale, linePathTotal, pointsTotal, yearlyData, goalPoint, goalY, deviationPaths, maxVal };
  }, [data, innerWidth, innerHeight, goalValue, deviations]);
  
  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || pointsTotal.length === 0) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const svgX = event.clientX - svgRect.left - margin.left;
        const totalYears = data.length / 12;
        const yearFraction = svgX / innerWidth;
        const year = Math.round(yearFraction * totalYears);
        const pointIndex = Math.max(0, Math.min(year, yearlyData.length - 1));
        const point = pointsTotal[pointIndex];
        if (point) setTooltip({ x: point.x, y: point.y, data: point.data });
    }, [pointsTotal, yearlyData, innerWidth, data.length]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 text-[10px] relative">
      <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[8px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Aportado</p>
            <p className="text-sm font-bold text-slate-600">{formatCurrency(lastPoint?.totalInvested || 0)}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[8px] uppercase font-bold text-amber-600 tracking-widest mb-1">Total c/ Juros (7%)</p>
            <p className="text-sm font-bold text-[#C5A059]">{formatCurrency(lastPoint?.totalAccumulated || 0)}</p>
          </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Projeção Base (7%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0 border-t border-dashed border-slate-300"></div>
              <span className="text-slate-400 font-bold uppercase tracking-tighter">Desvios Estimados</span>
            </div>
          </div>
          {goalValue && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-[1px] border-t border-dashed border-indigo-400"></div>
              <span className="text-indigo-500 font-bold uppercase tracking-tighter">Meta: {formatCurrency(goalValue)}</span>
            </div>
          )}
      </div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        className="overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <line key={v} x1="0" y1={innerHeight * v} x2={innerWidth} y2={innerHeight * v} stroke="#F1F5F9" strokeWidth="1" />
          ))}

          {goalValue && (
            <line x1="0" y1={goalY} x2={innerWidth} y2={goalY} stroke="#818CF8" strokeWidth="1" strokeDasharray="4" />
          )}

          {deviationPaths.map((dev, i) => (
            <g key={i}>
              <path d={dev.path} fill="none" stroke={dev.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <text x={innerWidth + 5} y={dev.lastY} alignmentBaseline="middle" fill={dev.color} fontSize="7px" fontWeight="bold">
                {dev.label}
              </text>
            </g>
          ))}
          
          <path d={linePathTotal} fill="none" stroke="#C5A059" strokeWidth="3" className="drop-shadow-sm" />
          
          {goalPoint && (
             <g>
                <circle cx={goalPoint.x} cy={goalPoint.y} r="8" fill="#818CF8" className="animate-pulse opacity-20" />
                <circle cx={goalPoint.x} cy={goalPoint.y} r="4" fill="#818CF8" stroke="white" strokeWidth="2" />
                <text x={goalPoint.x} y={goalPoint.y - 12} textAnchor="middle" fill="#4F46E5" fontSize="8px" fontWeight="bold" className="uppercase tracking-tighter">
                   Meta em {goalPoint.year.toFixed(1)}a
                </text>
             </g>
          )}

          {tooltip && (
            <>
              <line x1={tooltip.x} y1="0" x2={tooltip.x} y2={innerHeight} stroke="#C5A059" strokeWidth="1" strokeDasharray="4" />
              <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="#C5A059" stroke="white" strokeWidth="2" />
            </>
          )}
        </g>

        {[0, 0.5, 1].map(v => (
            <text key={v} x={margin.left - 10} y={innerHeight * (1-v) + margin.top} textAnchor="end" alignmentBaseline="middle" fill="#94A3B8" fontSize="9px" fontWeight="600">
                {formatYAxisValue(maxVal * v)}
            </text>
        ))}
      </svg>
      {tooltip && (
          <div 
              className="absolute bg-slate-900 text-white p-3 rounded-xl shadow-xl pointer-events-none z-10"
              style={{ left: Math.min(tooltip.x + margin.left + 15, width - 120), top: tooltip.y + margin.top, transform: 'translateY(-50%)' }}
          >
              <div className="font-bold text-[10px] mb-1 uppercase tracking-widest">Ano {(tooltip.data.month / 12).toFixed(0)}</div>
              <div className="text-[#C5A059] font-bold text-sm">{formatCurrency(tooltip.data.totalAccumulated)}</div>
              {goalValue && tooltip.data.totalAccumulated >= goalValue && (
                  <div className="mt-1 text-indigo-300 text-[8px] font-bold uppercase tracking-tighter">✓ Meta Superada</div>
              )}
          </div>
      )}
    </div>
  );
};

export const BarChart: React.FC<any> = () => <div className="text-slate-400 italic text-xs">Análise Secundária indisponível.</div>;
