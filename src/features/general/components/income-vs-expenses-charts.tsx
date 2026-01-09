import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  LabelList,
  XAxis,
  YAxis,
} from '@flux/ui/components/ui/chart'

interface Props {
  data: {
    month: string
    income: number
    expenses: number
  }[]
}

export default function IncomeVsExpensesCharts({ data }: Props) {
  return (
    <ChartContainer
      className='max-h-120 min-h-70 w-full'
      config={{
        income: {
          label: 'Income',
          color: '#14b8a6',
        },
        expenses: {
          label: 'Expenses',
          color: '#ef4444',
        },
      }}
    >
      <BarChart
        accessibilityLayer
        barCategoryGap='20%'
        barGap={6}
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <ChartLegend content={<ChartLegendContent />} verticalAlign='top' />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
          tickLine={false}
          width={64}
        />
        <XAxis
          axisLine={false}
          dataKey='month'
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent indicator='line' />} cursor={false} />
        <Bar dataKey='income' fill='var(--color-income)' maxBarSize={28} radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey='income'
            formatter={(value: number) => value.toLocaleString()}
            position='top'
          />
        </Bar>
        <Bar dataKey='expenses' fill='var(--color-expenses)' maxBarSize={28} radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey='expenses'
            formatter={(value: number) => value.toLocaleString()}
            position='top'
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
