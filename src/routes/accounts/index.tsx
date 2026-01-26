import { AddSquareIcon, TradeUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import { DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import AccountRow from '@/features/accounts/components/account-row'
import DeleteAccountModal from '@/features/accounts/components/delete-account-modal'
import { newAccountDialogHandle } from '@/features/accounts/components/new-account-modal'
import UpdateAccountModal from '@/features/accounts/components/update-account-modal'
import { getAccountsByTypeAction } from '@/features/accounts/queries'
import { authStateFn } from '@/features/auth/queries'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { ACCOUNT_TYPES } from '@/lib/constants'
import { cn, parseCurrency } from '@/lib/utils'

export const Route = createFileRoute('/accounts/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

function RouteComponent() {
  const { data: userPreferences } = useUserPreferences()

  const { data: cashAccounts = [], isPending: cashAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[0]],
    queryFn: async () => {
      const res = await getAccountsByTypeAction({ data: { type: ACCOUNT_TYPES[0] } })
      if (!res.ok) {
        toast.error('Failed to load cash accounts')
        return []
      }
      return res.data
    },
  })

  const { data: investmentAccounts = [], isPending: investmentAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[1]],
    queryFn: async () => {
      const res = await getAccountsByTypeAction({ data: { type: ACCOUNT_TYPES[1] } })
      if (!res.ok) {
        toast.error('Failed to load investment accounts')
        return []
      }
      return res.data
    },
  })

  const { data: liabilityAccounts = [], isPending: liabilityAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[2]],
    queryFn: async () => {
      const res = await getAccountsByTypeAction({ data: { type: ACCOUNT_TYPES[2] } })
      if (!res.ok) {
        toast.error('Failed to load liability accounts')
        return []
      }
      return res.data
    },
  })

  const { data: assetAccounts = [], isPending: assetAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[3]],
    queryFn: async () => {
      const res = await getAccountsByTypeAction({ data: { type: ACCOUNT_TYPES[3] } })
      if (!res.ok) {
        toast.error('Failed to load asset accounts')
        return []
      }
      return res.data
    },
  })

  const cashTotal = useMemo(() => {
    return cashAccounts.reduce((total, account) => total + Number(account.currentBalance), 0)
  }, [cashAccounts])
  const investmentTotal = useMemo(() => {
    return investmentAccounts.reduce((total, account) => total + Number(account.currentBalance), 0)
  }, [investmentAccounts])
  const liabilityTotal = useMemo(() => {
    return liabilityAccounts.reduce((total, account) => total + Number(account.currentBalance), 0)
  }, [liabilityAccounts])
  const assetTotal = useMemo(() => {
    return assetAccounts.reduce((total, account) => total + Number(account.currentBalance), 0)
  }, [assetAccounts])
  const netWorth = cashTotal + investmentTotal + assetTotal - liabilityTotal

  const prevCashTotal = useMemo(() => {
    return cashAccounts.reduce((total, account) => {
      const prevBalance = account.previousBalance ? Number(account.previousBalance) : 0
      return total + prevBalance
    }, 0)
  }, [cashAccounts])
  const prevInvestmentTotal = useMemo(() => {
    return investmentAccounts.reduce((total, account) => {
      const prevBalance = account.previousBalance ? Number(account.previousBalance) : 0
      return total + prevBalance
    }, 0)
  }, [investmentAccounts])
  const prevLiabilityTotal = useMemo(() => {
    return liabilityAccounts.reduce((total, account) => {
      const prevBalance = account.previousBalance ? Number(account.previousBalance) : 0
      return total + prevBalance
    }, 0)
  }, [liabilityAccounts])
  const prevAssetTotal = useMemo(() => {
    return assetAccounts.reduce((total, account) => {
      const prevBalance = account.previousBalance ? Number(account.previousBalance) : 0
      return total + prevBalance
    }, 0)
  }, [assetAccounts])
  const prevNetWorth = prevCashTotal + prevInvestmentTotal + prevAssetTotal - prevLiabilityTotal

  if (!userPreferences) return null

  return (
    <>
      <UpdateAccountModal />
      <DeleteAccountModal />

      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='mb-8 flex w-full flex-col-reverse items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-center'>
          <div>
            <h1 className='mb-1 font-medium text-2xl tracking-tight'>Accounts</h1>
            <p className='text-muted-foreground text-sm'>
              Manage your financial accounts and view your net worth
            </p>
          </div>
          <div className='flex w-full items-baseline gap-3 sm:w-auto'>
            <h1 className='mb-1 font-jetbrains text-muted-foreground text-sm uppercase'>
              Net Worth
            </h1>
            <div className='flex items-baseline gap-3'>
              <span className='font-jetbrains font-semibold text-4xl tabular-nums tracking-tighter'>
                {cashAccountsPending ||
                investmentAccountsPending ||
                liabilityAccountsPending ||
                assetAccountsPending ? (
                  <Skeleton className='h-10 w-48 rounded-md' />
                ) : (
                  parseCurrency(netWorth, userPreferences.region, userPreferences.currency)
                )}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 font-medium text-teal-500 text-xs',
                  netWorth - prevNetWorth >= 0 ? 'text-teal-500' : 'text-red-500'
                )}
              >
                <HugeiconsIcon className='size-3' icon={TradeUpIcon} />
                <span className='font-jetbrains'>
                  {cashAccountsPending ||
                  investmentAccountsPending ||
                  liabilityAccountsPending ||
                  assetAccountsPending ? (
                    <Skeleton className='h-4 w-24 rounded-md' />
                  ) : prevNetWorth ? (
                    (() => {
                      const diff = netWorth - prevNetWorth
                      const percent = (diff / prevNetWorth) * 100
                      const sign = diff >= 0 ? '+' : ''
                      return `${sign}${parseCurrency(diff, userPreferences.region, userPreferences.currency)} (${sign}${percent.toFixed(2)}%)`
                    })()
                  ) : (
                    'No data'
                  )}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Cash Section */}
        <section>
          <div className='mb-3 flex items-center justify-between px-1'>
            <h2 className='font-medium text-muted-foreground text-xs uppercase tracking-widest'>
              Cash & Banking
            </h2>
            <span className='font-medium text-xs tabular-nums'>
              {parseCurrency(cashTotal, userPreferences.region, userPreferences.currency)}
            </span>
          </div>

          <div className='overflow-hidden rounded-md border border-border bg-card'>
            {cashAccountsPending ? (
              <div className='space-y-1 p-2'>
                <Skeleton className='h-16 w-full rounded-sm' />
                <Skeleton className='h-16 w-full rounded-sm' />
              </div>
            ) : cashAccounts.length > 0 ? (
              cashAccounts.map((account) => <AccountRow account={account} key={account.id} />)
            ) : (
              <div className='flex flex-col items-center justify-center py-8 text-neutral-500'>
                <HugeiconsIcon className='mb-2 size-8 opacity-50' icon={AddSquareIcon} />
                <p className='text-sm'>No cash accounts found</p>
                <p className='text-xs opacity-60'>Add your first cash account below</p>
              </div>
            )}
          </div>

          <DialogTrigger
            aria-expanded='false'
            aria-haspopup='dialog'
            handle={newAccountDialogHandle}
            payload={{ type: ACCOUNT_TYPES[0] }}
            render={
              <button
                className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border border-dashed p-3 text-center text-muted-foreground transition-colors hover:bg-accent/50'
                type='button'
              >
                <HugeiconsIcon className='size-5 text-muted-foreground' icon={AddSquareIcon} />
              </button>
            }
          />
        </section>

        {/* Investment Section */}
        <section>
          <div className='mb-3 flex items-center justify-between px-1'>
            <h2 className='font-medium text-muted-foreground text-xs uppercase tracking-widest'>
              Investments
            </h2>
            <span className='font-medium text-xs tabular-nums'>
              {parseCurrency(investmentTotal, userPreferences.region, userPreferences.currency)}
            </span>
          </div>

          <div className='overflow-hidden rounded-md border border-border bg-card'>
            {investmentAccountsPending ? (
              <div className='space-y-1 p-2'>
                <Skeleton className='h-16 w-full rounded-sm' />
                <Skeleton className='h-16 w-full rounded-sm' />
              </div>
            ) : investmentAccounts.length > 0 ? (
              investmentAccounts.map((account) => <AccountRow account={account} key={account.id} />)
            ) : (
              <div className='flex flex-col items-center justify-center py-8 text-neutral-500'>
                <HugeiconsIcon className='mb-2 size-8 opacity-50' icon={AddSquareIcon} />
                <p className='text-sm'>No investment accounts found</p>
                <p className='text-xs opacity-60'>Add your first investment account below</p>
              </div>
            )}
          </div>
          <DialogTrigger
            aria-expanded='false'
            aria-haspopup='dialog'
            handle={newAccountDialogHandle}
            payload={{ type: ACCOUNT_TYPES[1] }}
            render={
              <button
                className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border border-dashed p-3 text-center text-muted-foreground transition-colors hover:bg-accent/50'
                type='button'
              >
                <HugeiconsIcon className='size-5 text-muted-foreground' icon={AddSquareIcon} />
              </button>
            }
          />
        </section>

        {/*<!-- Grid: Credit & Assets -->*/}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/*<!-- Credit Cards -->*/}
          <section>
            <div className='mb-3 flex items-center justify-between px-1'>
              <h2 className='font-medium text-muted-foreground text-xs uppercase tracking-widest'>
                Liabilities
              </h2>
              <span className='font-medium text-red-500 text-xs tabular-nums dark:text-red-400'>
                {parseCurrency(liabilityTotal, userPreferences.region, userPreferences.currency)}
              </span>
            </div>

            <div className='overflow-hidden rounded-md border border-border bg-card'>
              {liabilityAccountsPending ? (
                <div className='space-y-1 p-2'>
                  <Skeleton className='h-16 w-full rounded-sm' />
                  <Skeleton className='h-16 w-full rounded-sm' />
                </div>
              ) : liabilityAccounts.length > 0 ? (
                liabilityAccounts.map((account) => (
                  <AccountRow account={account} key={account.id} />
                ))
              ) : (
                <div className='flex flex-col items-center justify-center py-8 text-neutral-500'>
                  <HugeiconsIcon className='mb-2 size-8 opacity-50' icon={AddSquareIcon} />
                  <p className='text-sm'>No liability accounts found</p>
                  <p className='text-xs opacity-60'>Add your first liability account below</p>
                </div>
              )}
            </div>
            <DialogTrigger
              aria-expanded='false'
              aria-haspopup='dialog'
              handle={newAccountDialogHandle}
              payload={{ type: ACCOUNT_TYPES[2] }}
              render={
                <button
                  className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border border-dashed p-3 text-center text-muted-foreground transition-colors hover:bg-accent/50'
                  type='button'
                >
                  <HugeiconsIcon className='size-5 text-muted-foreground' icon={AddSquareIcon} />
                </button>
              }
            />
          </section>

          {/*<!-- Property/Assets -->*/}
          <section>
            <div className='mb-3 flex items-center justify-between px-1'>
              <h2 className='font-medium text-muted-foreground text-xs uppercase tracking-widest'>
                Other Assets
              </h2>
              <span className='font-medium text-xs tabular-nums'>
                {parseCurrency(assetTotal, userPreferences.region, userPreferences.currency)}
              </span>
            </div>

            <div className='overflow-hidden rounded-md border border-border bg-card'>
              {assetAccountsPending ? (
                <div className='space-y-1 p-2'>
                  <Skeleton className='h-16 w-full rounded-sm' />
                  <Skeleton className='h-16 w-full rounded-sm' />
                </div>
              ) : assetAccounts.length > 0 ? (
                assetAccounts.map((account) => <AccountRow account={account} key={account.id} />)
              ) : (
                <div className='flex flex-col items-center justify-center py-8 text-neutral-500'>
                  <HugeiconsIcon className='mb-2 size-8 opacity-50' icon={AddSquareIcon} />
                  <p className='text-sm'>No asset accounts found</p>
                  <p className='text-xs opacity-60'>Add your first asset account below</p>
                </div>
              )}
            </div>
            <DialogTrigger
              aria-expanded='false'
              aria-haspopup='dialog'
              handle={newAccountDialogHandle}
              payload={{ type: ACCOUNT_TYPES[3] }}
              render={
                <button
                  className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border border-dashed p-3 text-center text-muted-foreground transition-colors hover:bg-accent/50'
                  type='button'
                >
                  <HugeiconsIcon className='size-5 text-muted-foreground' icon={AddSquareIcon} />
                </button>
              }
            />
          </section>
        </div>
      </main>
    </>
  )
}
