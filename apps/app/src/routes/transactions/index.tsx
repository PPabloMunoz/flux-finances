import { Button } from '@flux/ui/components/ui/button'
import { DialogTrigger } from '@flux/ui/components/ui/dialog'
import { Skeleton } from '@flux/ui/components/ui/skeleton'
import {
  Add01Icon,
  ArrowLeft01Icon,
  Calendar01Icon,
  FilterIcon,
  PiggyBankIcon,
  Tag02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import DeleteTransactionModal from '@/features/transactions/components/delete-transaction-modal'
import NewTransactionModal, {
  newTransactionModalHandle,
} from '@/features/transactions/components/new-transaction-modal'
import TransactionRow from '@/features/transactions/components/transaction-row'
import UpdateTransactionModal from '@/features/transactions/components/update-transaction-modal'
import { getTransactionSummaryAction, getTransactionsAction } from '@/features/transactions/queries'

export const Route = createFileRoute('/transactions/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: transactions = [], isPending } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await getTransactionsAction()
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

  return (
    <>
      <NewTransactionModal />
      <UpdateTransactionModal />
      <DeleteTransactionModal />

      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='mb-8 flex w-full flex-col-reverse items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-center'>
          <div>
            <h1 className='mb-1 font-medium text-2xl text-white tracking-tight'>Transactions</h1>
            <p className='text-gray-400 text-sm'>Manage your income and expenses</p>
          </div>
          <div className='flex w-full items-baseline gap-3 sm:w-auto'>
            <DialogTrigger
              handle={newTransactionModalHandle}
              render={
                <Button className='w-full'>
                  <HugeiconsIcon icon={Add01Icon} size={20} />
                  Add Transaction
                </Button>
              }
            />
          </div>
        </header>
        <section className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 transition-colors hover:bg-neutral-900/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-neutral-500 text-xs'>Total Spent (30d)</span>
              <span
                className='iconify text-neutral-600'
                data-icon='lucide:arrow-up-right'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div className='font-medium text-white text-xl tracking-tight'>
              {isSummaryPending ? (
                <Skeleton className='h-7 w-24 rounded-md' />
              ) : (
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                  summary?.expenses || 0
                )
              )}
            </div>
          </div>
          <div className='rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 transition-colors hover:bg-neutral-900/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-neutral-500 text-xs'>Total Income (30d)</span>
              <span
                className='iconify text-emerald-500/50'
                data-icon='lucide:arrow-down-left'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div className='font-medium text-white text-xl tracking-tight'>
              {isSummaryPending ? (
                <Skeleton className='h-7 w-24 rounded-md' />
              ) : (
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                  summary?.income || 0
                )
              )}
            </div>
          </div>
          <div className='rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 transition-colors hover:bg-neutral-900/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-neutral-500 text-xs'>Net Cashflow</span>
              <span
                className='iconify text-neutral-600'
                data-icon='lucide:activity'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div
              className={`font-medium text-xl tracking-tight ${
                (summary?.net || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isSummaryPending ? (
                <Skeleton className='h-7 w-24 rounded-md' />
              ) : (
                <>
                  {(summary?.net || 0) > 0 ? '+' : ''}
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    summary?.net || 0
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        <div className='sticky top-14 z-40 mb-6 flex flex-col items-start justify-between gap-4 border-neutral-800 border-b bg-neutral-950 py-3 sm:flex-row sm:items-center'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='group relative'>
              <span className='absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-white'>
                <HugeiconsIcon className='size-3.5' icon={FilterIcon} />
              </span>
              <input
                className='h-8 w-full rounded-md border border-neutral-800 bg-neutral-900 pr-3 pl-9 text-white text-xs placeholder-neutral-500 transition-all focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 sm:w-64'
                placeholder='Filter transactions...'
                type='text'
              />
            </div>
            <div className='mx-1 h-4 w-[1px] bg-neutral-800' />
            {/*<!-- Dropdown Filters -->*/}
            <button
              className='flex items-center gap-1.5 rounded-md border border-neutral-700 border-dashed px-2.5 py-1.5 text-neutral-400 text-xs transition-colors hover:border-neutral-500 hover:text-white'
              type='button'
            >
              <HugeiconsIcon className='size-3' icon={Calendar01Icon} />
              This Month
            </button>
            <button
              className='flex items-center gap-1.5 rounded-md border border-neutral-700 border-dashed px-2.5 py-1.5 text-neutral-400 text-xs transition-colors hover:border-neutral-500 hover:text-white'
              type='button'
            >
              <HugeiconsIcon className='size-3' icon={Tag02Icon} />
              Category
            </button>
            <button
              className='flex items-center gap-1.5 rounded-md border border-neutral-700 border-dashed px-2.5 py-1.5 text-neutral-400 text-xs transition-colors hover:border-neutral-500 hover:text-white'
              type='button'
            >
              <HugeiconsIcon className='size-3' icon={PiggyBankIcon} />
              Account
            </button>
          </div>

          <div className='flex items-center gap-2 text-neutral-500 text-xs'>
            <span>Showing 1-10 of 248</span>
            <div className='flex gap-1'>
              <button
                className='rounded p-1 hover:bg-neutral-800 hover:text-white disabled:opacity-50'
                disabled
                type='button'
              >
                <span
                  className='iconify'
                  data-icon='lucide:chevron-left'
                  data-stroke-width='1.5'
                  data-width='14'
                />
                <HugeiconsIcon className='size-3.5' icon={ArrowLeft01Icon} />
              </button>
              <button className='rounded p-1 hover:bg-neutral-800 hover:text-white' type='button'>
                <span
                  className='iconify'
                  data-icon='lucide:chevron-right'
                  data-stroke-width='1.5'
                  data-width='14'
                />
                <HugeiconsIcon className='size-3.5 rotate-180' icon={ArrowLeft01Icon} />
              </button>
            </div>
          </div>
        </div>
        <div className='relative overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/20'>
          <table className='w-full text-left text-xs'>
            <thead className='bg-neutral-900/50 text-neutral-500 uppercase'>
              <tr>
                <th className='px-4 py-3 font-medium tracking-wide' scope='col'>
                  Date
                </th>
                <th className='w-1/3 px-4 py-3 font-medium tracking-wide' scope='col'>
                  Title
                </th>
                <th className='px-4 py-3 font-medium tracking-wide' scope='col'>
                  Category
                </th>
                <th className='px-4 py-3 font-medium tracking-wide' scope='col'>
                  Account
                </th>
                <th className='px-4 py-3 text-right font-medium tracking-wide' scope='col'>
                  Amount
                </th>
                <th className='w-10 px-4 py-3' scope='col' />
              </tr>
            </thead>

            <tbody className='divide-y divide-neutral-800/50'>
              {isPending ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td className='px-4 py-3'>
                      <Skeleton className='h-4 w-24 rounded-md' />
                    </td>
                    <td className='px-4 py-3'>
                      <Skeleton className='h-4 w-48 rounded-md' />
                    </td>
                    <td className='px-4 py-3'>
                      <Skeleton className='h-4 w-32 rounded-md' />
                    </td>
                    <td className='px-4 py-3'>
                      <Skeleton className='h-4 w-32 rounded-md' />
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Skeleton className='ml-auto h-4 w-20 rounded-md' />
                    </td>
                    <td className='px-4 py-3'>
                      <Skeleton className='h-8 w-8 rounded-md' />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td className='px-4 py-12 text-center text-neutral-500' colSpan={6}>
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <HugeiconsIcon className='size-8 text-neutral-600' icon={Tag02Icon} />
                      <p>No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
