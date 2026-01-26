import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { parseCurrency } from '@/lib/utils'

interface NetWorthHistoryChartProps {
  data?: Array<{
    month: string
    netWorth: number
  }>
  isLoading: boolean
}

export function NetWorthHistoryChart({ data = [], isLoading }: NetWorthHistoryChartProps) {
  const { data: userPreferences } = useUserPreferences()

  const formatCurrency = (value: number | undefined) => {
    if (!userPreferences) return `$${(value ?? 0).toFixed(0)}`
    return parseCurrency(value ?? 0, userPreferences.region, userPreferences.currency)
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const date = new Date(Number.parseInt(year, 10), Number.parseInt(monthNum, 10) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
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
      <h3 className='mb-4 font-medium text-sm'>Net Worth History</h3>
      <ResponsiveContainer height={250} width='100%'>
        <AreaChart data={data}>
          <defs>
            <linearGradient id='balanceGradient' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='5%' stopColor='#0ea5e9' stopOpacity={0.3} />
              <stop offset='95%' stopColor='#0ea5e9' stopOpacity={0} />
            </linearGradient>
          </defs>
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
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number | undefined) => [formatCurrency(value)]}
            labelFormatter={(label) => formatMonth(label)}
          />
          <Area
            dataKey='netWorth'
            fill='url(#balanceGradient)'
            stroke='#0ea5e9'
            strokeWidth={2}
            type='monotone'
          />
        </AreaChart>
      </ResponsiveContainer>
      {data.length === 0 && (
        <p className='py-8 text-center text-muted-foreground text-xs'>
          No net worth data available
        </p>
      )}
    </Card>
  )
}
