import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { parseCurrency } from '@/lib/utils'

interface AnalyticsSummaryCardsProps {
  summary: {
    income: number
    expenses: number
    net: number
    savingsRate: number
  } | null
  isLoading: boolean
}

export function AnalyticsSummaryCards({ summary, isLoading }: AnalyticsSummaryCardsProps) {
  const { data: userPreferences } = useUserPreferences()

  const formatCurrency = (value: number) => {
    if (!userPreferences) return `$${value.toFixed(2)}`
    return parseCurrency(value, userPreferences.region, userPreferences.currency)
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {[0, 1, 2, 3].map((i) => (
          <Card className='p-4' key={i}>
            <Skeleton className='mb-2 h-3 w-20' />
            <Skeleton className='h-8 w-32' />
          </Card>
        ))}
      </div>
    )
  }

  const data = summary ?? { income: 0, expenses: 0, net: 0, savingsRate: 0 }

  return (
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
      <Card className='p-4'>
        <p className='mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide'>
          Total Income
        </p>
        <p className='font-semibold text-emerald-600 text-xl tracking-tight'>
          {formatCurrency(data.income)}
        </p>
      </Card>
      <Card className='p-4'>
        <p className='mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide'>
          Total Expenses
        </p>
        <p className='font-semibold text-rose-600 text-xl tracking-tight'>
          {formatCurrency(data.expenses)}
        </p>
      </Card>
      <Card className='p-4'>
        <p className='mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide'>
          Net Cashflow
        </p>
        <p
          className={`font-semibold text-xl tracking-tight ${
            data.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {data.net >= 0 ? '+' : ''}
          {formatCurrency(data.net)}
        </p>
      </Card>
      <Card className='p-4'>
        <p className='mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide'>
          Savings Rate
        </p>
        <p
          className={`font-semibold text-xl tracking-tight ${
            data.savingsRate >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {data.savingsRate >= 0 ? '+' : ''}
          {data.savingsRate.toFixed(1)}%
        </p>
      </Card>
    </div>
  )
}
