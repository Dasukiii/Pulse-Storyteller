import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ChartConfig, ChartContainer } from './ui/chart';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface EnpsScoreCardProps {
  score: number;
  previousScore?: number;
}

export default function EnpsScoreCard({ score, previousScore }: EnpsScoreCardProps) {
  const maxScore = 100;
  const minScore = -100;
  const normalizedScore = ((score - minScore) / (maxScore - minScore)) * 100;

  const chartData = [
    { name: 'enps', value: normalizedScore, fill: 'var(--color-enps)' },
  ];

  const chartConfig = {
    value: {
      label: 'eNPS Score',
    },
    enps: {
      label: 'eNPS',
      color: score >= 50 ? '#10b981' : score >= 0 ? '#3b82f6' : '#ef4444',
    },
  } satisfies ChartConfig;

  const getScoreLabel = (score: number) => {
    if (score >= 50) return 'Excellent';
    if (score >= 30) return 'Great';
    if (score >= 0) return 'Good';
    if (score >= -10) return 'Needs Work';
    return 'Critical';
  };

  const change = previousScore !== undefined ? score - previousScore : null;
  const isPositive = change !== null && change > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg">Current eNPS Score</CardTitle>
        <CardDescription>{getScoreLabel(score)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 - (normalizedScore / 100) * 360}
            innerRadius={70}
            outerRadius={100}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[76, 64]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-gray-900 text-4xl font-bold"
                        >
                          {score}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-gray-500 text-sm"
                        >
                          eNPS Score
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
        {change !== null && (
          <div className="flex items-center justify-center gap-2 text-sm mt-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {change} from last survey
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
