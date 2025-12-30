import { Card } from '@flux/ui/components/ui/card'
import { Skeleton } from '@flux/ui/components/ui/skeleton'
import {
  Add01Icon,
  CreditCardPosIcon,
  NewsIcon,
  TradeDownIcon,
  TradeUpIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import DashboardCard from '@/components/dashboard-card'
import AppHeader from '@/components/header'
import { getAccountsByTypeAction } from '@/features/accounts/queries'
import { authStateFn } from '@/features/auth/queries'
import { getTransactionsAction } from '@/features/transactions/queries'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { TRANSACTIONS_ICONS } from '@/lib/constants'
import { parseCurrency } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: async () => await authStateFn(),
  loader: async () => {
    const [cashRes, investmentsRes, liabilitiesRes, transactionsRes] = await Promise.all([
      getAccountsByTypeAction({ data: { type: 'cash' } }),
      getAccountsByTypeAction({ data: { type: 'investment' } }),
      getAccountsByTypeAction({ data: { type: 'liability' } }),
      getTransactionsAction({ data: { page: 1, pageSize: 5 } }),
    ])

    return {
      cash: cashRes.ok ? cashRes.data : [],
      investments: investmentsRes.ok ? investmentsRes.data : [],
      liabilities: liabilitiesRes.ok ? liabilitiesRes.data : [],
      transactions: transactionsRes.ok ? transactionsRes.data?.transactions : [],
    }
  },
})

function App() {
  const { cash, investments, liabilities, transactions } = Route.useLoaderData()
  const { data: userPreferences } = useUserPreferences()

  const cashTotal = cash.reduce((acc, curr) => acc + Number(curr.currentBalance || 0), 0)
  const investmentsTotal = investments.reduce(
    (acc, curr) => acc + Number(curr.currentBalance || 0),
    0
  )
  const liabilitiesTotal = liabilities.reduce(
    (acc, curr) => acc + Number(curr.currentBalance || 0),
    0
  )

  const netWorth = cashTotal + investmentsTotal - liabilitiesTotal

  const previousCashTotal = cash.reduce((acc, curr) => acc + Number(curr.previousBalance || 0), 0)
  const previousInvestmentsTotal = investments.reduce(
    (acc, curr) => acc + Number(curr.previousBalance || 0),
    0
  )
  const previousLiabilitiesTotal = liabilities.reduce(
    (acc, curr) => acc + Number(curr.previousBalance || 0),
    0
  )

  const previousNetWorth = previousCashTotal + previousInvestmentsTotal - previousLiabilitiesTotal
  const netWorthChange = netWorth - previousNetWorth
  const netWorthChangePercentage =
    previousNetWorth !== 0 ? (netWorthChange / Math.abs(previousNetWorth)) * 100 : 0

  // Calculate percentages for progress bars
  const totalAssets = cashTotal + investmentsTotal
  const cashProgress = totalAssets > 0 ? (cashTotal / totalAssets) * 100 : 0
  const investmentsProgress = totalAssets > 0 ? (investmentsTotal / totalAssets) * 100 : 0
  const liabilitiesProgress = netWorth > 0 ? Math.min((liabilitiesTotal / netWorth) * 100, 100) : 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <AppHeader />

      <main className='container mx-auto px-5 py-10'>
        <header className='mb-10 flex items-center justify-between'>
          <div>
            <p className='mb-1 font-jetbrains text-neutral-500 text-sm uppercase'>Net Worth</p>
            {!userPreferences ? (
              <Skeleton className='mt-2 h-10 w-40 rounded-sm' />
            ) : (
              <p className='font-jetbrains font-semibold text-4xl text-white tabular-nums tracking-tighter'>
                {parseCurrency(netWorth, userPreferences.region, userPreferences.currency)}
              </p>
            )}
          </div>
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
        </header>

        {/* Graph */}
        <section>
          <div className='h-70 w-full rounded-sm border border-neutral-200/50 bg-neutral-50/10' />
        </section>

        {/* Cards */}
        <section className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {!userPreferences ? (
            <>
              <Skeleton className='h-43 w-full rounded-sm' />
              <Skeleton className='h-43 w-full rounded-sm' />
              <Skeleton className='h-43 w-full rounded-sm' />
            </>
          ) : (
            <>
              <Link to='/accounts'>
                <DashboardCard
                  color='teal'
                  icon={Wallet01Icon}
                  progress={cashProgress}
                  subtitle='Cash & Equivalents'
                  value={parseCurrency(cashTotal, userPreferences.region, userPreferences.currency)}
                />
              </Link>

              <Link to='/accounts'>
                <DashboardCard
                  color='blue'
                  icon={NewsIcon}
                  progress={investmentsProgress}
                  subtitle='Investments'
                  value={parseCurrency(
                    investmentsTotal,
                    userPreferences.region,
                    userPreferences.currency
                  )}
                />
              </Link>

              <Link to='/accounts'>
                <DashboardCard
                  color='red'
                  icon={CreditCardPosIcon}
                  progress={liabilitiesProgress}
                  subtitle='Liabilities'
                  value={parseCurrency(
                    liabilitiesTotal,
                    userPreferences.region,
                    userPreferences.currency
                  )}
                />
              </Link>
            </>
          )}
        </section>

        <section className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-3'>
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
                      <th className='px-5 py-3 font-medium'>Description</th>
                      <th className='hidden px-5 py-3 font-medium sm:table-cell'>Category</th>
                      <th className='hidden px-5 py-3 font-medium sm:table-cell'>Date</th>
                      <th className='px-5 py-3 text-right font-medium'>Amount</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-neutral-800/50'>
                    {transactions?.map((transaction) => (
                      <tr
                        className='group transition-colors hover:bg-neutral-800/30'
                        key={transaction.id}
                      >
                        <td className='px-5 py-3.5'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                                transaction.type === 'inflow'
                                  ? 'border-teal-500/20 bg-teal-500/10 text-teal-500'
                                  : 'border-white/5 bg-white/5 text-white'
                              }`}
                            >
                              <HugeiconsIcon
                                className='size-3.5'
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
                          {transaction.categoryName && (
                            <span className='inline-flex items-center rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-medium text-[10px] text-neutral-400'>
                              {transaction.categoryName}
                            </span>
                          )}
                        </td>
                        <td className='hidden px-5 py-3.5 text-neutral-500 sm:table-cell'>
                          {formatDate(transaction.date)}
                        </td>
                        <td
                          className={`px-5 py-3.5 text-right font-jetbrains font-medium ${
                            transaction.type === 'inflow' ? 'text-teal-500' : 'text-red-400'
                          }`}
                        >
                          {transaction.type === 'inflow' ? '+' : '-'}
                          {parseCurrency(
                            Number(transaction.amount),
                            userPreferences?.region,
                            transaction.accountCurrency
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!transactions || transactions.length === 0) && (
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
          <div className='col-span-1'>
            <div className='flex items-center justify-between'>
              <h3 className='font-medium text-sm text-white'>Monthly Budgets</h3>
              <button
                className='flex h-6 w-6 items-center justify-center rounded bg-neutral-800 transition-colors hover:text-white'
                type='button'
              >
                <HugeiconsIcon className='size-4' icon={Add01Icon} />
              </button>
            </div>

            <Card className='mt-4 space-y-4 rounded-sm p-5'>
              <div>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-teal-500' />
                    <span className='font-medium text-white text-xs'>Dining &amp; Food</span>
                  </div>
                  <span className='font-jetbrains text-neutral-400 text-xs'>$450 / $600</span>
                </div>
                <div className='relative h-2 overflow-hidden rounded-full bg-neutral-800'>
                  <div className='absolute top-0 left-0 h-full w-[75%] rounded-full bg-teal-500' />
                </div>
              </div>

              <div>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-purple-500' />
                    <span className='font-medium text-white text-xs'>Entertainment</span>
                  </div>
                  <span className='font-jetbrains text-neutral-400 text-xs'>$120 / $200</span>
                </div>
                <div className='relative h-2 overflow-hidden rounded-full bg-neutral-800'>
                  <div className='absolute top-0 left-0 h-full w-[60%] rounded-full bg-purple-500' />
                </div>
              </div>

              <div>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-orange-500' />
                    <span className='font-medium text-white text-xs'>Shopping</span>
                  </div>
                  <span className='font-jetbrains font-medium text-orange-500 text-xs'>
                    $340 / $300
                  </span>
                </div>
                <div className='relative h-2 overflow-hidden rounded-full bg-neutral-800'>
                  <div className='absolute top-0 left-0 h-full w-full rounded-full bg-orange-500' />
                </div>
                <p className='mt-1 text-[10px] text-orange-500/80'>Exceeded by $40</p>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </>
  )
}
