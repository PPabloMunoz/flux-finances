import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { parseCurrency } from '@/lib/utils'

interface IncomeExpenseTrendChartProps {
  data?: Array<{
    month: string
    income: number
    expenses: number
    net: number
  }>
  isLoading: boolean
}

export function IncomeExpenseTrendChart({ data = [], isLoading }: IncomeExpenseTrendChartProps) {
  const { data: userPreferences } = useUserPreferences()

  const formatCurrency = (value: number) => {
    if (!userPreferences) return `$${value.toFixed(0)}`
    return parseCurrency(value, userPreferences.region, userPreferences.currency)
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const date = new Date(Number.parseInt(year, 10), Number.parseInt(monthNum, 10) - 1)
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  if (isLoading) {
    return (
      <Card className='p-4'>
        <Skeleton className='mb-4 h-5 w-32' />
        <Skeleton className='h-64 w-full' />
      </Card>
    )
  }

  return (
    <Card className='p-4'>
      <h3 className='mb-4 font-medium text-sm'>Income vs Expenses</h3>
      <ResponsiveContainer height={250} width='100%'>
        <LineChart data={data}>
          <XAxis
            axisLine={{ stroke: '#e5e7eb' }}
            dataKey='month'
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={formatMonth}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={formatCurrency}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number | undefined) => [formatCurrency(value ?? 0)]}
            labelFormatter={(label) => formatMonth(label)}
          />
          <Legend iconSize={8} iconType='circle' wrapperStyle={{ paddingTop: '16px' }} />
          <Line
            dataKey='income'
            dot={false}
            name='Income'
            stroke='#10b981'
            strokeWidth={2}
            type='monotone'
          />
          <Line
            dataKey='expenses'
            dot={false}
            name='Expenses'
            stroke='#ef4444'
            strokeWidth={2}
            type='monotone'
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
