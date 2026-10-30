'use client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';
export function TrendChart({
  data,
}: {
  data: { name: string; score: number }[];
}) {
  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label={`Score trend: ${data.map((d) => `${d.name} ${d.score}`).join(', ')}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#e9eef5"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#scoreFill)"
            dot={{ r: 4, fill: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function SkillsChart({
  scores,
  bar = false,
}: {
  scores: Record<string, number>;
  bar?: boolean;
}) {
  const data = Object.entries(scores).map(([skill, score]) => ({
    skill,
    score,
    full: 100,
  }));
  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label={data
        .map((d) => `${d.skill}: ${d.score} out of 100`)
        .join(', ')}
    >
      <ResponsiveContainer width="100%" height="100%">
        {bar ? (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 10, right: 20 }}
          >
            <CartesianGrid horizontal={false} stroke="#edf0f5" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
            <YAxis
              dataKey="skill"
              type="category"
              width={85}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Bar
              dataKey="score"
              fill="#2563eb"
              radius={[0, 5, 5, 0]}
              barSize={16}
            />
          </BarChart>
        ) : (
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <Radar dataKey="full" stroke="transparent" fill="transparent" />
            <Radar
              name="Skill score"
              dataKey="score"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.13}
              strokeWidth={2}
              dot={{ r: 3, fill: '#2563eb' }}
            />
            <Tooltip />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
