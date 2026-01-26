import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { parseCurrency } from '@/lib/utils'

interface CategoryItem {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryType: 'inflow' | 'outflow'
  income: number
  expenses: number
}

interface IncomeExpensesByCategoryChartProps {
  data?: CategoryItem[]
  isLoading: boolean
}

export function IncomeExpensesByCategoryChart({
  data = [],
  isLoading,
}: IncomeExpensesByCategoryChartProps) {
  const { data: userPreferences } = useUserPreferences()

  const formatCurrency = (value: number | undefined) => {
    if (!userPreferences) return `$${(value ?? 0).toFixed(0)}`
    return parseCurrency(value ?? 0, userPreferences.region, userPreferences.currency)
  }

  if (isLoading) {
    return (
      <Card className='p-4'>
        <Skeleton className='mb-4 h-5 w-48' />
        <div className='grid grid-cols-2 gap-4'>
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </Card>
    )
  }

  const incomeCategories = data
    .filter((item) => item.categoryType === 'inflow' && item.income > 0)
    .sort((a, b) => b.income - a.income)

  const expenseCategories = data
    .filter((item) => item.categoryType === 'outflow' && item.expenses > 0)
    .sort((a, b) => b.expenses - a.expenses)

  const renderChart = (
    items: typeof incomeCategories,
    dataKey: 'income' | 'expenses',
    color: string
  ) => {
    if (items.length === 0) {
      return (
        <div className='flex h-64 items-center justify-center text-muted-foreground text-xs'>
          No data
        </div>
      )
    }

    return (
      <ResponsiveContainer height={250} width='100%'>
        <BarChart data={items} layout='vertical'>
          <XAxis
            axisLine={false}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={formatCurrency}
            tickLine={false}
            type='number'
          />
          <YAxis
            axisLine={false}
            dataKey='categoryName'
            tick={{ fontSize: 11, fill: '#374151' }}
            tickLine={false}
            type='category'
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number | undefined) => [formatCurrency(value)]}
          />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card className='p-4'>
      <h3 className='mb-4 font-medium text-sm'>Income & Expenses by Category</h3>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div>
          <p className='mb-3 font-medium text-emerald-600 text-xs uppercase tracking-wide'>
            Income
          </p>
          {renderChart(incomeCategories, 'income', '#10b981')}
        </div>
        <div>
          <p className='mb-3 font-medium text-rose-600 text-xs uppercase tracking-wide'>Expenses</p>
          {renderChart(expenseCategories, 'expenses', '#ef4444')}
        </div>
      </div>
    </Card>
  )
}
