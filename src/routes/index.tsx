import { TradeDownIcon, TradeUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { authStateFn } from '@/features/auth/queries'
import { getBudgets } from '@/features/budgets/queries'
import { getNetWorthAction } from '@/features/general/queries'
import { getTransactionSummaryAction, getTransactionsAction } from '@/features/transactions/queries'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { TRANSACTIONS_ICONS } from '@/lib/constants'
import { parseCurrency } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: async () => await authStateFn(),
})

const PAGE_SIZE = 25 as const

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
  })

  const { data: transactions = [], isPending: transactionsPending } = useQuery({
    queryKey: ['transactions', { page: 1, pageSize: PAGE_SIZE }],
    queryFn: async () => {
      const res = await getTransactionsAction({ data: { page: 1, pageSize: PAGE_SIZE } })
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data.transactions
    },
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
  })

  const { data: summary, isPending: isSummaryPending } = useQuery({
    queryKey: ['transactions-summary'],
    queryFn: async () => {
      const res = await getTransactionSummaryAction()
      if (!res.ok) {
        toast.error(res.error)
        return null
      }
      return res.data
    },
  })

  const netWorth = netWorthData[0] ?? 0
  const previousNetWorth = netWorthData[1] ?? 0
  const netWorthChange = netWorth - previousNetWorth
  const netWorthChangePercentage =
    previousNetWorth !== 0 ? (netWorthChange / Math.abs(previousNetWorth)) * 100 : 0

  return (
    <>
      <AppHeader />

      <main className='container mx-auto px-5 py-10'>
        <header className='mb-10 flex items-center justify-between'>
          <div>
            <p className='mb-1 font-jetbrains text-muted-foreground text-sm uppercase'>Net Worth</p>
            {!userPreferences || netWorthPending ? (
              <Skeleton className='mt-2 h-9 w-40 rounded-sm' />
            ) : (
              <p className='font-jetbrains font-semibold text-4xl tabular-nums tracking-tighter'>
                {parseCurrency(netWorth, userPreferences.region, userPreferences.currency)}
              </p>
            )}
          </div>
          {netWorthPending ? (
            <Skeleton className='h-7 w-24 rounded-sm' />
          ) : (
            <div
              className={`flex w-auto items-center gap-2 rounded-md border px-2 py-1 ${
                netWorthChangePercentage >= 0
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
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

        <section className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='rounded-lg border border-border bg-card p-4 transition-all hover:bg-accent/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-muted-foreground text-xs'>Total Spent (30d)</span>
              <span
                className='iconify text-muted-foreground/50'
                data-icon='lucide:arrow-up-right'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div className='font-medium text-xl tracking-tight'>
              {isSummaryPending || !userPreferences ? (
                <Skeleton className='h-7 w-24 rounded-md' />
              ) : (
                parseCurrency(
                  summary?.expenses || 0,
                  userPreferences.region,
                  userPreferences.currency
                )
              )}
            </div>
          </div>
          <div className='rounded-lg border border-border bg-card p-4 transition-all hover:bg-accent/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-muted-foreground text-xs'>Total Income (30d)</span>
              <span
                className='iconify text-emerald-500/50'
                data-icon='lucide:arrow-down-left'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div className='font-medium text-xl tracking-tight'>
              {isSummaryPending || !userPreferences ? (
                <Skeleton className='h-7 w-24 rounded-md' />
              ) : (
                parseCurrency(
                  summary?.income || 0,
                  userPreferences.region,
                  userPreferences.currency
                )
              )}
            </div>
          </div>
          <div className='rounded-lg border border-border bg-card p-4 transition-all hover:bg-accent/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-muted-foreground text-xs'>Net Cashflow</span>
              <span
                className='iconify text-muted-foreground/50'
                data-icon='lucide:activity'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div
              className={`font-medium text-xl tracking-tight ${
                (summary?.net || 0) >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isSummaryPending || !userPreferences ? (
                <Skeleton className='h-7 w-24 rounded-md' />
              ) : (
                <>
                  {(summary?.net || 0) > 0 ? '+' : ''}
                  {parseCurrency(
                    summary?.net || 0,
                    userPreferences.region,
                    userPreferences.currency
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <section className='mt-10 grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-x-6'>
          <div className='col-span-2'>
            <div className='space-y-4 lg:col-span-2'>
              <div className='flex items-center justify-between'>
                <h3 className='font-medium text-sm'>Recent Transactions</h3>
                <Link
                  className='text-muted-foreground text-xs transition-colors hover:text-foreground'
                  to='/transactions'
                >
                  View All
                </Link>
              </div>

              <div className='overflow-hidden rounded-xl border border-border bg-card'>
                <table className='w-full text-left text-xs'>
                  <thead className='border-border border-b bg-muted/50 text-muted-foreground'>
                    <tr>
                      <th className='hidden px-5 py-3 font-medium sm:table-cell'>Date</th>
                      <th className='px-5 py-3 font-medium'>Title</th>
                      <th className='hidden px-5 py-3 font-medium sm:table-cell'>Category</th>
                      <th className='px-5 py-3 text-right font-medium'>Amount</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {transactionsPending
                      ? [0, 1, 2, 3, 4].map((i) => (
                          <tr className='group transition-colors hover:bg-accent/50' key={i}>
                            <td className='hidden px-5 py-3.5 text-muted-foreground sm:table-cell'>
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
                            className='group transition-colors hover:bg-accent/50'
                            key={transaction.id}
                          >
                            <td className='hidden px-5 py-3.5 text-muted-foreground sm:table-cell'>
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
                                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
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
                                <span className='font-medium'>{transaction.title}</span>
                              </div>
                            </td>
                            <td className='hidden px-5 py-3.5 sm:table-cell'>
                              <span className='inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-0.5 font-medium text-[10px] text-muted-foreground'>
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
                                transaction.type === 'inflow'
                                  ? 'text-emerald-600 dark:text-emerald-500'
                                  : 'text-rose-600 dark:text-rose-400'
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
                        <td className='px-5 py-8 text-center text-muted-foreground' colSpan={4}>
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
              <h3 className='font-medium text-sm'>Monthly Budgets</h3>
              <Link
                className='text-muted-foreground text-xs transition-colors hover:text-foreground'
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
                    const percentageUsed = budget.percentageUsed
                    const isOverBudget = percentageUsed > 100
                    const isNearLimit = percentageUsed >= 85 && !isOverBudget
                    const exceededAmount = isOverBudget
                      ? Number(budget.spent) - Number(budget.amount)
                      : 0
                    const progressColor = isOverBudget
                      ? '#ef4444'
                      : isNearLimit
                        ? '#f97316'
                        : '#3b82f6'

                    return (
                      <div key={budget.id}>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='h-2 w-2 rounded-full'
                              style={{ backgroundColor: budget.categoryColor }}
                            />
                            <span className='font-medium text-xs'>{budget.categoryName}</span>
                          </div>
                          <span
                            className={`font-jetbrains text-xs ${
                              isOverBudget
                                ? 'font-medium text-rose-600 dark:text-rose-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {userPreferences ? (
                              `${parseCurrency(Number(budget.spent), userPreferences.region, userPreferences.currency)} / ${parseCurrency(Number(budget.amount), userPreferences.region, userPreferences.currency)}`
                            ) : (
                              <Skeleton className='inline-block h-3 w-20 rounded-sm' />
                            )}
                          </span>
                        </div>
                        <div className='relative h-2 overflow-hidden rounded-full bg-muted'>
                          <div
                            className='absolute top-0 left-0 h-full rounded-full'
                            style={{
                              width: `${Math.min(percentageUsed, 100)}%`,
                              backgroundColor: progressColor,
                            }}
                          />
                        </div>
                        {isOverBudget && (
                          <p className='mt-1 text-[10px] text-rose-600/80 dark:text-rose-400/80'>
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
                <p className='py-4 text-center text-muted-foreground text-xs'>
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
