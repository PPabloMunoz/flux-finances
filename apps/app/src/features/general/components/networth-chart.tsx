import {
  Area,
  AreaChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
} from '@flux/ui/components/ui/chart'

interface Props {
  data: {
    month: string
    netWorth: number
  }[]
}

export default function NetworthChart({ data }: Props) {
  return (
    <ChartContainer
      className='max-h-120 min-h-70 w-full'
      config={{
        netWorth: {
          label: 'Net Worth',
          color: '#14b8a6',
        },
      }}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey='month'
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent indicator='line' />} cursor={false} />
        <Area
          dataKey='netWorth'
          dot={false}
          fill='var(--color-netWorth)'
          fillOpacity={0.4}
          stroke='var(--color-netWorth)'
          strokeWidth={2}
          type='monotone'
        />
      </AreaChart>
    </ChartContainer>
  )
}
