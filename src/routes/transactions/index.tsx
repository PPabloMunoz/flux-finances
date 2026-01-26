import {
  Add01Icon,
  ArrowLeft01Icon,
  Calendar01Icon,
  FilterIcon,
  PiggyBankIcon,
  Tag02Icon,
  Upload03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import AppHeader from '@/components/header'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllAccountsAction } from '@/features/accounts/queries'
import { authStateFn } from '@/features/auth/queries'
import { getCategoriesAction } from '@/features/settings/queries'
import DeleteTransactionModal from '@/features/transactions/components/delete-transaction-modal'
import { newTransactionModalHandle } from '@/features/transactions/components/new-transaction-modal'
import TransactionRow from '@/features/transactions/components/transaction-row'
import UpdateTransactionModal from '@/features/transactions/components/update-transaction-modal'
import { getTransactionSummaryAction, getTransactionsAction } from '@/features/transactions/queries'
import { useDebounce } from '@/hooks/use-debounce'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { cn, parseCurrency } from '@/lib/utils'

const transactionsSearchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  dateRange: z.enum(['all', 'today', 'week', 'month', 'year']).optional().catch('all'),
  page: z.number().min(1).optional().catch(1),
})

export const Route = createFileRoute('/transactions/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
  validateSearch: transactionsSearchSchema,
})

const PAGE_SIZE = 30 as const

function RouteComponent() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { data: userPreferences } = useUserPreferences()

  const [searchInput, setSearchInput] = useState(search.search || '')
  const debouncedSearch = useDebounce(searchInput, 300)

  const { data, isPending } = useQuery({
    queryKey: ['transactions', { ...search, search: debouncedSearch }],
    queryFn: async () => {
      const res = await getTransactionsAction({
        data: {
          search: debouncedSearch,
          categoryId: search.categoryId,
          accountId: search.accountId,
          dateRange: search.dateRange || 'all',
          page: search.page || 1,
          pageSize: PAGE_SIZE,
        },
      })
      if (!res.ok) {
        toast.error(res.error)
        return {
          transactions: [],
          pagination: { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 },
        }
      }
      return res.data
    },
    placeholderData: keepPreviousData,
  })

  const transactions = data?.transactions || []
  const pagination = data?.pagination || { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 }

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategoriesAction({ data: {} })
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await getAllAccountsAction()
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

  const updateSearch = useCallback(
    (updates: Partial<typeof search>) => {
      navigate({
        to: '/transactions',
        search: { ...search, ...updates, page: updates.page ?? 1 },
      })
    },
    [navigate, search]
  )

  useEffect(() => {
    if (debouncedSearch !== search.search) {
      updateSearch({ search: debouncedSearch || undefined })
    }
  }, [debouncedSearch, search.search, updateSearch])

  const dateRangeLabels = {
    all: 'All Time',
    today: 'Today',
    week: 'Last 7 Days',
    month: 'This Month',
    year: 'This Year',
  }
  type DateRangeKey = keyof typeof dateRangeLabels

  return (
    <>
      <UpdateTransactionModal />
      <DeleteTransactionModal />

      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='mb-8 flex w-full flex-col-reverse items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-center'>
          <div>
            <h1 className='mb-1 font-medium text-2xl tracking-tight'>Transactions</h1>
            <p className='text-muted-foreground text-sm'>Manage your income and expenses</p>
          </div>
          <div className='flex w-full items-center gap-3 sm:w-auto'>
            <Link to='/transactions/import'>
              <Button variant='outline'>
                <HugeiconsIcon icon={Upload03Icon} size={20} />
                Import
              </Button>
            </Link>
            <DialogTrigger
              handle={newTransactionModalHandle}
              render={
                <Button>
                  <HugeiconsIcon icon={Add01Icon} size={20} />
                  Add Transaction
                </Button>
              }
            />
          </div>
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
                  : 'text-red-600 dark:text-red-400'
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
        <div className='sticky top-14 z-40 mb-6 flex flex-col items-start justify-between gap-4 border-border border-b bg-background py-3 sm:flex-row sm:items-center'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='group relative'>
              <span className='absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground'>
                <HugeiconsIcon className='size-3.5' icon={FilterIcon} />
              </span>
              <input
                className='h-8 w-full rounded-md border border-border bg-muted/50 pr-3 pl-9 text-foreground text-xs placeholder-muted-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 sm:w-64'
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='Filter transactions...'
                type='text'
                value={searchInput}
              />
            </div>
            <div className='mx-1 h-4 w-[1px] bg-border' />
            {/*<!-- Dropdown Filters -->*/}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'flex items-center gap-1.5 rounded-md border border-border border-dashed px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                  search.dateRange &&
                    search.dateRange !== 'all' &&
                    'border-solid bg-accent text-accent-foreground'
                )}
              >
                <HugeiconsIcon className='size-3' icon={Calendar01Icon} />
                {dateRangeLabels[(search.dateRange as DateRangeKey) || 'all']}
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={() => updateSearch({ dateRange: 'all' })}>
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSearch({ dateRange: 'today' })}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSearch({ dateRange: 'week' })}>
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSearch({ dateRange: 'month' })}>
                  This Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSearch({ dateRange: 'year' })}>
                  This Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'flex items-center gap-1.5 rounded-md border border-border border-dashed px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                  search.categoryId && 'border-solid bg-accent text-accent-foreground'
                )}
              >
                <HugeiconsIcon className='size-3' icon={Tag02Icon} />
                {search.categoryId
                  ? categories.find((c) => c.id === search.categoryId)?.name || 'Category'
                  : 'Category'}
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={() => updateSearch({ categoryId: undefined })}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => updateSearch({ categoryId: category.id })}
                  >
                    <span
                      className='mr-2 inline-block size-2 rounded-full'
                      style={{ backgroundColor: category.color || undefined }}
                    />
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'flex items-center gap-1.5 rounded-md border border-border border-dashed px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                  search.accountId && 'border-solid bg-accent text-accent-foreground'
                )}
              >
                <HugeiconsIcon className='size-3' icon={PiggyBankIcon} />
                {search.accountId
                  ? accounts.find((a) => a.id === search.accountId)?.name || 'Account'
                  : 'Account'}
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={() => updateSearch({ accountId: undefined })}>
                  All Accounts
                </DropdownMenuItem>
                {accounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => updateSearch({ accountId: account.id })}
                  >
                    {account.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
            <span>
              Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1}
              -{Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total}
            </span>
            <div className='flex gap-1'>
              <button
                className='rounded p-1 transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
                disabled={pagination.page <= 1}
                onClick={() => updateSearch({ page: pagination.page - 1 })}
                type='button'
              >
                <HugeiconsIcon className='size-3.5' icon={ArrowLeft01Icon} />
              </button>
              <button
                className='rounded p-1 transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateSearch({ page: pagination.page + 1 })}
                type='button'
              >
                <HugeiconsIcon className='size-3.5 rotate-180' icon={ArrowLeft01Icon} />
              </button>
            </div>
          </div>
        </div>
        <div className='relative overflow-x-auto rounded-lg border border-border bg-card'>
          <table className='w-full text-left text-xs'>
            <thead className='bg-muted/50 text-muted-foreground uppercase'>
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

            <tbody className='divide-y divide-border'>
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
                  <td className='px-4 py-12 text-center text-muted-foreground' colSpan={6}>
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                        <HugeiconsIcon
                          className='size-6 text-muted-foreground/50'
                          icon={Tag02Icon}
                        />
                      </div>
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
