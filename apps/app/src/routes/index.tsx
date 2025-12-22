import { Card } from '@flux/ui/components/ui/card'
import {
  Add01Icon,
  CreditCardPosIcon,
  NewsIcon,
  TradeUpIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import DashboardCard from '@/components/dashboard-card'
import AppHeader from '@/components/header'
import { TRANSACTIONS_ICONS } from '@/lib/constants'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <AppHeader />

      <div className='pointer-events-none absolute top-0 left-0 h-96 w-full -translate-y-1/2 rounded-full bg-teal-900/5 blur-3xl' />
      <main className='container mx-auto px-5 py-10'>
        <header className='mb-10 flex items-center justify-between'>
          <div>
            <p className='font-jetbrains text-neutral-500 text-sm uppercase'>Net Worth</p>
            <p className='font-jetbrains text-4xl'>$482,900.00</p>
          </div>
          <div className='flex w-auto items-center gap-2 rounded-sm border border-teal-500/20 bg-teal-500/10 px-2 py-1 text-teal-500'>
            <HugeiconsIcon className='size-4.5' icon={TradeUpIcon} />
            <span className='font-medium text-xs'>+2.4% this month</span>
          </div>
        </header>

        {/* Graph */}
        <section>
          <div className='h-70 w-full rounded-sm border border-neutral-200/50 bg-neutral-50/10' />
        </section>

        {/* Cards */}
        <section className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Link to='/'>
            <DashboardCard
              color='teal'
              icon={Wallet01Icon}
              progress={33}
              subtitle='Cash & Equivalents'
              value='$42,300.00'
            />
          </Link>

          <Link to='/'>
            <DashboardCard
              color='blue'
              icon={NewsIcon}
              progress={33}
              subtitle='Investments'
              value='$450,120.00'
            />
          </Link>

          <Link to='/'>
            <DashboardCard
              color='red'
              icon={CreditCardPosIcon}
              progress={33}
              subtitle='Liabilities'
              value='$9,520.00'
            />
          </Link>
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
                    <tr className='group transition-colors hover:bg-neutral-800/30'>
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-white/5 text-white'>
                            <HugeiconsIcon className='size-3.5' icon={TRANSACTIONS_ICONS.expense} />
                          </div>
                          <span className='font-medium text-white'>Whole Foods Market</span>
                        </div>
                      </td>
                      <td className='hidden px-5 py-3.5 sm:table-cell'>
                        <span className='inline-flex items-center rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-medium text-[10px] text-neutral-400'>
                          Groceries
                        </span>
                      </td>
                      <td className='hidden px-5 py-3.5 text-neutral-500 sm:table-cell'>Sep 24</td>
                      <td className='px-5 py-3.5 text-right font-jetbrains font-medium text-white'>
                        -$142.50
                      </td>
                    </tr>
                    <tr className='group transition-colors hover:bg-neutral-800/30'>
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-white/5 text-white'>
                            <HugeiconsIcon className='size-3.5' icon={TRANSACTIONS_ICONS.expense} />
                          </div>
                          <span className='font-medium text-white'>Electric Company</span>
                        </div>
                      </td>
                      <td className='hidden px-5 py-3.5 sm:table-cell'>
                        <span className='inline-flex items-center rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-medium text-[10px] text-neutral-400'>
                          Utilities
                        </span>
                      </td>
                      <td className='hidden px-5 py-3.5 text-neutral-500 sm:table-cell'>Sep 23</td>
                      <td className='px-5 py-3.5 text-right font-jetbrains font-medium text-white'>
                        -$85.00
                      </td>
                    </tr>
                    <tr className='group transition-colors hover:bg-neutral-800/30'>
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-500'>
                            <HugeiconsIcon className='size-3.5' icon={TRANSACTIONS_ICONS.income} />
                          </div>
                          <span className='font-medium text-white'>Salary Deposit</span>
                        </div>
                      </td>
                      <td className='hidden px-5 py-3.5 sm:table-cell'>
                        <span className='inline-flex items-center rounded border border-teal-900/50 bg-teal-900/30 px-2 py-0.5 font-medium text-[10px] text-teal-500'>
                          Income
                        </span>
                      </td>
                      <td className='hidden px-5 py-3.5 text-neutral-500 sm:table-cell'>Sep 15</td>
                      <td className='px-5 py-3.5 text-right font-jetbrains font-medium text-teal-500'>
                        +$4,250.00
                      </td>
                    </tr>
                    <tr className='group transition-colors hover:bg-neutral-800/30'>
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-white/5 text-white'>
                            <HugeiconsIcon className='size-3.5' icon={TRANSACTIONS_ICONS.expense} />
                          </div>
                          <span className='font-medium text-white'>Starbucks</span>
                        </div>
                      </td>
                      <td className='hidden px-5 py-3.5 sm:table-cell'>
                        <span className='inline-flex items-center rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-medium text-[10px] text-neutral-400'>
                          Dining
                        </span>
                      </td>
                      <td className='hidden px-5 py-3.5 text-neutral-500 sm:table-cell'>Sep 14</td>
                      <td className='px-5 py-3.5 text-right font-jetbrains font-medium text-white'>
                        -$6.45
                      </td>
                    </tr>
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
