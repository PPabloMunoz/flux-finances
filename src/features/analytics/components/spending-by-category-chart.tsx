import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { parseCurrency } from '@/lib/utils'

interface SpendingByCategoryChartProps {
  data?: Array<{
    categoryId: string
    categoryName: string
    categoryColor: string
    total: number
    percentage: number
  }>
  isLoading: boolean
}

export function SpendingByCategoryChart({ data = [], isLoading }: SpendingByCategoryChartProps) {
  const { data: userPreferences } = useUserPreferences()

  const formatCurrency = (value: number | undefined) => {
    if (!userPreferences) return `$${(value ?? 0).toFixed(0)}`
    return parseCurrency(value ?? 0, userPreferences.region, userPreferences.currency)
  }

  if (isLoading) {
    return (
      <Card className='p-4'>
        <Skeleton className='mb-4 h-5 w-32' />
        <Skeleton className='h-64 w-full' />
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.total, 0)

  return (
    <Card className='p-4'>
      <h3 className='mb-4 font-medium text-sm'>Spending by Category</h3>
      <ResponsiveContainer height={250} width='100%'>
        <PieChart>
          <Pie
            cx='50%'
            cy='50%'
            data={data}
            dataKey='total'
            innerRadius={50}
            nameKey='categoryName'
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell fill={entry.categoryColor} key={entry.categoryId} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number | undefined, name: string | undefined) => [
              formatCurrency(value),
              name ?? '',
            ]}
          />
          <Legend
            align='right'
            iconSize={8}
            iconType='circle'
            layout='vertical'
            verticalAlign='middle'
            wrapperStyle={{ paddingLeft: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {total === 0 && (
        <p className='py-8 text-center text-muted-foreground text-xs'>
          No spending data for this period
        </p>
      )}
    </Card>
  )
}
