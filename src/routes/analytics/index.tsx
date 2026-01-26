import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import { AnalyticsFilters } from '@/features/analytics/components/analytics-filters'
import { AnalyticsSummaryCards } from '@/features/analytics/components/analytics-summary-cards'
import { IncomeExpenseTrendChart } from '@/features/analytics/components/income-expense-trend-chart'
import { IncomeExpensesByCategoryChart } from '@/features/analytics/components/income-expenses-by-category-chart'
import { NetWorthHistoryChart } from '@/features/analytics/components/net-worth-history-chart'
import { SpendingByCategoryChart } from '@/features/analytics/components/spending-by-category-chart'
import {
  getAnalyticsSummaryAction,
  getCategoryBreakdownAction,
  getMonthlyTrendsAction,
  getNetWorthHistoryAction,
  getSpendingByCategoryAction,
} from '@/features/analytics/queries'
import { authStateFn } from '@/features/auth/queries'

export const Route = createFileRoute('/analytics/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

type DateRange = '30d' | '90d' | '6m' | '1y'

function RouteComponent() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  const { data: summary, isPending: summaryPending } = useQuery({
    queryKey: ['analytics-summary', dateRange],
    queryFn: async () => {
      const res = await getAnalyticsSummaryAction({ data: dateRange })
      if (!res.ok) {
        toast.error(res.error)
        return null
      }
      return res.data
    },
  })

  const { data: monthlyTrends, isPending: trendsPending } = useQuery({
    queryKey: ['analytics-monthly-trends'],
    queryFn: async () => {
      const res = await getMonthlyTrendsAction()
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  const { data: spendingByCategory, isPending: categorySpendingPending } = useQuery({
    queryKey: ['analytics-spending-by-category', dateRange],
    queryFn: async () => {
      const res = await getSpendingByCategoryAction({ data: dateRange })
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  const { data: netWorthHistory, isPending: netWorthPending } = useQuery({
    queryKey: ['analytics-net-worth-history'],
    queryFn: async () => {
      const res = await getNetWorthHistoryAction()
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  const { data: categoryBreakdown, isPending: categoryBreakdownPending } = useQuery({
    queryKey: ['analytics-category-breakdown', dateRange],
    queryFn: async () => {
      const res = await getCategoryBreakdownAction({ data: dateRange })
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  return (
    <>
      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='flex w-full flex-col-reverse items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-center'>
          <div>
            <h1 className='mb-1 font-medium text-2xl tracking-tight'>Analytics</h1>
            <p className='text-muted-foreground text-sm'>
              Track your financial insights and trends
            </p>
          </div>
          <AnalyticsFilters onChange={setDateRange} value={dateRange} />
        </header>

        <AnalyticsSummaryCards isLoading={summaryPending} summary={summary ?? null} />

        <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <IncomeExpenseTrendChart data={monthlyTrends} isLoading={trendsPending} />
          <SpendingByCategoryChart data={spendingByCategory} isLoading={categorySpendingPending} />
        </section>

        <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <NetWorthHistoryChart data={netWorthHistory} isLoading={netWorthPending} />
          <IncomeExpensesByCategoryChart
            data={categoryBreakdown}
            isLoading={categoryBreakdownPending}
          />
        </section>
      </main>
    </>
  )
}
