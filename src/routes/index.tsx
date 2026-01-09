import { addMonth, format } from '@formkit/tempo'
import { TradeDownIcon, TradeUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authStateFn } from '@/features/auth/queries'
import { getBudgets } from '@/features/budgets/queries'
import IncomeVsExpensesCharts from '@/features/general/components/income-vs-expenses-charts'
import NetworthChart from '@/features/general/components/networth-chart'
import { getIncomeExpenseHistoryAction, getNetWorthAction } from '@/features/general/queries'
import { getTransactionsAction } from '@/features/transactions/queries'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { TRANSACTIONS_ICONS } from '@/lib/constants'
import { parseCurrency } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: async () => await authStateFn(),
})

function App() {
  const { data: userPreferences } = useUserPreferences()

  const { data: netWorthData = [], isPending: netWorthPending } = useQuery({
    queryKey: ['networth'],
    queryFn: async () => {
      const res = await getNetWorthAction()
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const {
    data: incomeVsExpensesData = { incomeHistory: [], expenseHistory: [] },
    isPending: incomeVsExpensesPending,
  } = useQuery({
    queryKey: ['incomeVsExpenses'],
    queryFn: async () => {
      const res = await getIncomeExpenseHistoryAction()
      if (!res.ok) {
        toast.error(res.error)
        return { incomeHistory: [], expenseHistory: [] }
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const { data: transactions = [], isPending: transactionsPending } = useQuery({
    queryKey: ['transactions', { page: 1, pageSize: 5 }],
    queryFn: async () => {
      const res = await getTransactionsAction({ data: { page: 1, pageSize: 5 } })
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data.transactions
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const { data: budgets = [], isPending: budgetsPending } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await getBudgets()
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const currentMonth = new Date().getMonth()
  const netWorth = netWorthData[netWorthData.length - 1] ?? 0
  const previousNetWorth = netWorthData[netWorthData.length - 2] ?? 0
  const netWorthChange = netWorth - previousNetWorth
  const netWorthChangePercentage =
    previousNetWorth !== 0 ? (netWorthChange / Math.abs(previousNetWorth)) * 100 : 0

  const netWorthDisplayData = useMemo(() => {
    return netWorthData.map((item, i) => {
      const month = format({
        date: addMonth(new Date(), (i + 12 - currentMonth) % 12),
        format: 'MMMM',
        locale: userPreferences?.region,
        tz: userPreferences?.timezone,
      })
      return { month, netWorth: item }
    })
  }, [netWorthData, currentMonth, userPreferences])

  const incomeVsExpensesDisplayData = useMemo(() => {
    const displayData = []
    for (let i = 0; i < incomeVsExpensesData.expenseHistory.length; i++) {
      const month = format({
        date: addMonth(new Date(), (i + 12 - currentMonth) % 12),
        format: 'MMMM',
        locale: userPreferences?.region,
        tz: userPreferences?.timezone,
      })
      displayData.push({
        month,
        income: incomeVsExpensesData.incomeHistory[i] || 0,
        expenses: incomeVsExpensesData.expenseHistory[i] || 0,
      })
    }
    return displayData
  }, [incomeVsExpensesData, currentMonth, userPreferences])

  return (
    <>
      <AppHeader />

      <main className='container mx-auto px-5 py-10'>
        <header className='mb-10 flex items-center justify-between'>
          <div>
            <p className='mb-1 font-jetbrains text-neutral-500 text-sm uppercase'>Net Worth</p>
            {!userPreferences || netWorthPending ? (
              <Skeleton className='mt-2 h-9 w-40 rounded-sm' />
            ) : (
              <p className='font-jetbrains font-semibold text-4xl text-white tabular-nums tracking-tighter'>
                {parseCurrency(netWorth, userPreferences.region, userPreferences.currency)}
              </p>
            )}
          </div>
          {netWorthPending ? (
            <Skeleton className='h-7 w-24 rounded-sm' />
          ) : (
            <div
              className={`flex w-auto items-center gap-2 rounded-sm border px-2 py-1 ${
                netWorthChangePercentage >= 0
                  ? 'border-teal-500/20 bg-teal-500/10 text-teal-500'
                  : 'border-red-500/20 bg-red-500/10 text-red-500'
              }`}
            >
              <HugeiconsIcon
                className='size-4.5'
                icon={netWorthChangePercentage >= 0 ? TradeUpIcon : TradeDownIcon}
              />
              <span className='font-medium text-xs'>
                {netWorthChangePercentage >= 0 ? '+' : ''}
                {netWorthChangePercentage.toFixed(1)}% this month
              </span>
            </div>
          )}
        </header>

        {/* Graph */}
        <section>
          <Tabs className='w-full' defaultValue='netWorth'>
            <div className='mb-2 flex items-center justify-end'>
              <TabsList className='bg-neutral-900/30 p-1'>
                <TabsTrigger
                  className='rounded-sm data-[state=active]:bg-neutral-800 data-[state=active]:text-white'
                  value='netWorth'
                >
                  Net Worth
                </TabsTrigger>
                <TabsTrigger
                  className='rounded-sm data-[state=active]:bg-neutral-800 data-[state=active]:text-white'
                  value='incomeVsExpenses'
                >
                  Income vs Expenses
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value='netWorth'>
              {userPreferences || netWorthPending ? (
                <NetworthChart data={netWorthDisplayData} />
              ) : (
                <div className='flex h-70 w-full items-center justify-center'>
                  <Skeleton className='h-70 w-full rounded-sm' />
                </div>
              )}
            </TabsContent>

            <TabsContent value='incomeVsExpenses'>
              {userPreferences || incomeVsExpensesPending ? (
                <IncomeVsExpensesCharts data={incomeVsExpensesDisplayData} />
              ) : (
                <div className='flex h-70 w-full items-center justify-center'>
                  <Skeleton className='h-48 w-96 rounded-sm' />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        <section className='mt-10 grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-x-6'>
          <div className='col-span-2'>
            <div className='space-y-4 lg:col-span-2'>
              <div className='flex items-center justify-between'>
                <h3 className='font-medium text-sm text-white'>Recent Transactions</h3>
                <Link
                  className='text-neutral-500 text-xs transition-colors hover:text-white'
                  to='/transactions'
                >
                  View All
                </Link>
              </div>

              <div className='glass-panel overflow-hidden rounded-xl'>
                <table className='w-full text-left text-xs'>
                  <thead className='border-neutral-800 border-b bg-neutral-900/30 text-neutral-500'>
                    <tr>
                      <th className='hidden px-5 py-3 font-medium sm:table-cell'>Date</th>
                      <th className='px-5 py-3 font-medium'>Title</th>
                      <th className='hidden px-5 py-3 font-medium sm:table-cell'>Category</th>
                      <th className='px-5 py-3 text-right font-medium'>Amount</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-neutral-800/50'>
                    {transactionsPending
                      ? [0, 1, 2, 3, 4].map((i) => (
                          <tr className='group transition-colors hover:bg-neutral-800/30' key={i}>
                            <td className='hidden px-5 py-3.5 text-neutral-500 sm:table-cell'>
                              <Skeleton className='h-4 w-16 rounded-sm' />
                            </td>
                            <td className='px-5 py-3.5'>
                              <Skeleton className='h-4 w-32 rounded-sm' />
                            </td>
                            <td className='hidden px-5 py-3.5 sm:table-cell'>
                              <Skeleton className='h-4 w-24 rounded-sm' />
                            </td>
                            <td className='px-5 py-3.5 text-right'>
                              <Skeleton className='ml-auto h-4 w-20 rounded-sm' />
                            </td>
                          </tr>
                        ))
                      : transactions.map((transaction) => (
                          <tr
                            className='group transition-colors hover:bg-neutral-800/30'
                            key={transaction.id}
                          >
                            <td className='hidden px-5 py-3.5 text-neutral-500 sm:table-cell'>
                              {userPreferences ? (
                                new Date(transaction.date).toLocaleDateString(
                                  userPreferences.region,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )
                              ) : (
                                <Skeleton className='h-4 w-16 rounded-sm' />
                              )}
                            </td>
                            <td className='px-5 py-3.5'>
                              <div className='flex items-center gap-3'>
                                <div
                                  className={`flex size-7 items-center justify-center rounded-full border ${
                                    transaction.type === 'inflow'
                                      ? 'border-teal-500/20 bg-teal-500/10 text-teal-500'
                                      : 'border-red-500/20 bg-red-500/10 text-red-500'
                                  }`}
                                >
                                  <HugeiconsIcon
                                    className='size-3'
                                    icon={
                                      transaction.type === 'inflow'
                                        ? TRANSACTIONS_ICONS.inflow
                                        : TRANSACTIONS_ICONS.outflow
                                    }
                                  />
                                </div>
                                <span className='font-medium text-white'>{transaction.title}</span>
                              </div>
                            </td>
                            <td className='hidden px-5 py-3.5 sm:table-cell'>
                              <span className='inline-flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-medium text-[10px] text-neutral-400'>
                                {transaction.categoryColor && (
                                  <span
                                    className='size-1.5 rounded-full'
                                    style={{ backgroundColor: transaction.categoryColor ?? '' }}
                                  />
                                )}
                                {transaction.categoryName ?? 'No Category'}
                              </span>
                            </td>
                            <td
                              className={`px-5 py-3.5 text-right font-jetbrains font-medium ${
                                transaction.type === 'inflow' ? 'text-teal-500' : 'text-red-400'
                              }`}
                            >
                              {userPreferences ? (
                                <>
                                  {transaction.type === 'inflow' ? '+' : '-'}
                                  {parseCurrency(
                                    Number(transaction.amount),
                                    userPreferences.region,
                                    transaction.accountCurrency
                                  )}
                                </>
                              ) : (
                                <Skeleton className='ml-auto h-4 w-20 rounded-sm' />
                              )}
                            </td>
                          </tr>
                        ))}
                    {!transactionsPending && (!transactions || transactions.length === 0) && (
                      <tr>
                        <td className='px-5 py-8 text-center text-neutral-500' colSpan={4}>
                          No recent transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className='col-span-1 w-full'>
            <div className='flex items-center justify-between'>
              <h3 className='font-medium text-sm text-white'>Monthly Budgets</h3>
              <Link
                className='text-neutral-500 text-xs transition-colors hover:text-white'
                to='/budgets'
              >
                View All
              </Link>
            </div>

            <Card className='mt-4 space-y-4 rounded-sm p-5'>
              {budgetsPending
                ? [0, 1, 2].map((i) => (
                    <div key={i}>
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Skeleton className='h-2 w-2 rounded-full' />
                          <Skeleton className='h-3 w-20 rounded-sm' />
                        </div>
                        <Skeleton className='h-3 w-20 rounded-sm' />
                      </div>
                      <Skeleton className='h-2 w-full rounded-full' />
                    </div>
                  ))
                : budgets.slice(0, 3).map((budget) => {
                    const isOverBudget = budget.percentageUsed > 100
                    const exceededAmount = isOverBudget
                      ? Number(budget.spent) - Number(budget.amount)
                      : 0
                    const progressColor = budget.categoryColor || 'teal'

                    return (
                      <div key={budget.id}>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='h-2 w-2 rounded-full'
                              style={{ backgroundColor: progressColor }}
                            />
                            <span className='font-medium text-white text-xs'>
                              {budget.categoryName}
                            </span>
                          </div>
                          <span
                            className={`font-jetbrains text-xs ${
                              isOverBudget ? 'font-medium text-orange-500' : 'text-neutral-400'
                            }`}
                          >
                            {userPreferences ? (
                              `${parseCurrency(Number(budget.spent), userPreferences.region, userPreferences.currency)} / ${parseCurrency(Number(budget.amount), userPreferences.region, userPreferences.currency)}`
                            ) : (
                              <Skeleton className='inline-block h-3 w-20 rounded-sm' />
                            )}
                          </span>
                        </div>
                        <div className='relative h-2 overflow-hidden rounded-full bg-neutral-800'>
                          <div
                            className='absolute top-0 left-0 h-full rounded-full'
                            style={{
                              width: `${Math.min(budget.percentageUsed, 100)}%`,
                              backgroundColor: isOverBudget
                                ? '#f97316'
                                : `var(--${progressColor}-500, #14b8a6)`,
                            }}
                          />
                        </div>
                        {isOverBudget && (
                          <p className='mt-1 text-[10px] text-orange-500/80'>
                            Exceeded by{' '}
                            {userPreferences
                              ? parseCurrency(
                                  exceededAmount,
                                  userPreferences.region,
                                  userPreferences.currency
                                )
                              : exceededAmount}
                          </p>
                        )}
                      </div>
                    )
                  })}
              {!budgetsPending && (!budgets || budgets.length === 0) && (
                <p className='py-4 text-center text-neutral-500 text-xs'>
                  No budgets set for this month
                </p>
              )}
            </Card>
          </div>
        </section>
      </main>
    </>
  )
}
