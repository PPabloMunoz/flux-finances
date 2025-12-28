import { DialogTrigger } from '@flux/ui/components/ui/dialog'
import { cn } from '@flux/ui/lib/utils'
import { AddSquareIcon, TradeUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import AccountRow from '@/features/accounts/components/account-row'
import DeleteAccountModal from '@/features/accounts/components/delete-account-modal'
import { newAccountDialogHandle } from '@/features/accounts/components/new-account-modal'
import UpdateAccountModal from '@/features/accounts/components/update-account-modal'
import { getAccountsAction } from '@/features/accounts/queries'
import { authStateFn } from '@/features/auth/queries'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { ACCOUNT_TYPES } from '@/lib/constants'
import { parseCurrency } from '@/lib/utils'

export const Route = createFileRoute('/accounts/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

function RouteComponent() {
  const { data: userPreferences } = useUserPreferences()

  const { data: cashAccounts = [], isPending: cashAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[0]],
    queryFn: async () => {
      const res = await getAccountsAction({ data: { type: ACCOUNT_TYPES[0] } })
      if (!res.ok) {
        toast.error('Failed to load cash accounts')
        return []
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const { data: investmentAccounts = [], isPending: investmentAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[1]],
    queryFn: async () => {
      const res = await getAccountsAction({ data: { type: ACCOUNT_TYPES[1] } })
      if (!res.ok) {
        toast.error('Failed to load investment accounts')
        return []
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const { data: liabilityAccounts = [], isPending: liabilityAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[2]],
    queryFn: async () => {
      const res = await getAccountsAction({ data: { type: ACCOUNT_TYPES[2] } })
      if (!res.ok) {
        toast.error('Failed to load liability accounts')
        return []
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const { data: assetAccounts = [], isPending: assetAccountsPending } = useQuery({
    queryKey: ['accounts', ACCOUNT_TYPES[3]],
    queryFn: async () => {
      const res = await getAccountsAction({ data: { type: ACCOUNT_TYPES[3] } })
      if (!res.ok) {
        toast.error('Failed to load asset accounts')
        return []
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
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
        <header className='mb-10 grid grid-cols-1 gap-6 md:grid-cols-5'>
          <div className='md:col-span-3'>
            <h1 className='mb-1 font-medium text-2xl text-white tracking-tight'>Net Worth</h1>
            <div className='flex items-baseline gap-3'>
              <span className='font-jetbrains font-semibold text-4xl text-white tabular-nums tracking-tighter'>
                {cashAccountsPending ||
                investmentAccountsPending ||
                liabilityAccountsPending ||
                assetAccountsPending
                  ? 'Loading...'
                  : parseCurrency(netWorth, userPreferences.region, userPreferences.currency)}
              </span>
              <div className='flex items-center gap-1 font-medium text-teal-500 text-xs'>
                <HugeiconsIcon className='size-3' icon={TradeUpIcon} />
                <span
                  className={cn(
                    'font-jetbrains',
                    netWorth - prevNetWorth >= 0 ? 'text-teal-500' : 'text-red-500'
                  )}
                >
                  {cashAccountsPending ||
                  investmentAccountsPending ||
                  liabilityAccountsPending ||
                  assetAccountsPending
                    ? 'Loading...'
                    : prevNetWorth
                      ? (() => {
                          const diff = netWorth - prevNetWorth
                          const percent = (diff / prevNetWorth) * 100
                          const sign = diff >= 0 ? '+' : ''
                          return `${sign}${parseCurrency(diff, userPreferences.region, userPreferences.currency)} (${sign}${percent.toFixed(2)}%)`
                        })()
                      : 'No data'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Cash Section */}
        <section>
          <div className='mb-3 flex items-center justify-between px-1'>
            <h2 className='font-medium text-neutral-500 text-xs uppercase tracking-widest'>
              Cash & Banking
            </h2>
            <span className='font-medium text-white text-xs tabular-nums'>
              {parseCurrency(cashTotal, userPreferences.region, userPreferences.currency)}
            </span>
          </div>

          <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
            {cashAccountsPending ? (
              <div className='flex h-18 w-full items-center justify-center'>
                <p className='p-4 text-center text-neutral-500 text-sm'>Loading cash accounts...</p>
              </div>
            ) : cashAccounts.length > 0 ? (
              cashAccounts.map((account) => <AccountRow account={account} key={account.id} />)
            ) : (
              <div>
                <p className='p-4 text-center text-neutral-500 text-sm'>
                  No cash accounts found. Click the + button below to add your first cash account.
                </p>
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
                className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-neutral-800 border-dashed p-3 text-center text-neutral-500 transition-colors hover:bg-white/[0.02]'
                type='button'
              >
                <HugeiconsIcon className='size-5 text-neutral-500' icon={AddSquareIcon} />
              </button>
            }
          />
        </section>

        {/* Investment Section */}
        <section>
          <div className='mb-3 flex items-center justify-between px-1'>
            <h2 className='font-medium text-neutral-500 text-xs uppercase tracking-widest'>
              Investments
            </h2>
            <span className='font-medium text-white text-xs tabular-nums'>
              {parseCurrency(investmentTotal, userPreferences.region, userPreferences.currency)}
            </span>
          </div>

          <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
            {investmentAccountsPending ? (
              <div className='flex h-18 w-full items-center justify-center'>
                <p className='p-4 text-center text-neutral-500 text-sm'>
                  Loading investment accounts...
                </p>
              </div>
            ) : investmentAccounts.length > 0 ? (
              investmentAccounts.map((account) => <AccountRow account={account} key={account.id} />)
            ) : (
              <div>
                <p className='p-4 text-center text-neutral-500 text-sm'>
                  No investment accounts found. Click the + button below to add your first account.
                </p>
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
                className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-neutral-800 border-dashed p-3 text-center text-neutral-500 transition-colors hover:bg-white/[0.02]'
                type='button'
              >
                <HugeiconsIcon className='size-5 text-neutral-500' icon={AddSquareIcon} />
              </button>
            }
          />
        </section>

        {/*<!-- Grid: Credit & Assets -->*/}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/*<!-- Credit Cards -->*/}
          <section>
            <div className='mb-3 flex items-center justify-between px-1'>
              <h2 className='font-medium text-neutral-500 text-xs uppercase tracking-widest'>
                Liabilities
              </h2>
              <span className='font-medium text-red-400 text-xs tabular-nums'>
                {parseCurrency(liabilityTotal, userPreferences.region, userPreferences.currency)}
              </span>
            </div>

            <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
              {liabilityAccountsPending ? (
                <div className='flex h-18 w-full items-center justify-center'>
                  <p className='p-4 text-center text-neutral-500 text-sm'>
                    Loading liability accounts...
                  </p>
                </div>
              ) : liabilityAccounts.length > 0 ? (
                liabilityAccounts.map((account) => (
                  <AccountRow account={account} key={account.id} />
                ))
              ) : (
                <div>
                  <p className='p-4 text-center text-neutral-500 text-sm'>
                    No liability accounts found. Click the + button below to add your first account.
                  </p>
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
                  className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-neutral-800 border-dashed p-3 text-center text-neutral-500 transition-colors hover:bg-white/[0.02]'
                  type='button'
                >
                  <HugeiconsIcon className='size-5 text-neutral-500' icon={AddSquareIcon} />
                </button>
              }
            />
          </section>

          {/*<!-- Property/Assets -->*/}
          <section>
            <div className='mb-3 flex items-center justify-between px-1'>
              <h2 className='font-medium text-neutral-500 text-xs uppercase tracking-widest'>
                Other Assets
              </h2>
              <span className='font-medium text-white text-xs tabular-nums'>
                {parseCurrency(assetTotal, userPreferences.region, userPreferences.currency)}
              </span>
            </div>

            <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
              {assetAccountsPending ? (
                <div className='flex h-18 w-full items-center justify-center'>
                  <p className='p-4 text-center text-neutral-500 text-sm'>
                    Loading asset accounts...
                  </p>
                </div>
              ) : assetAccounts.length > 0 ? (
                assetAccounts.map((account) => <AccountRow account={account} key={account.id} />)
              ) : (
                <div>
                  <p className='p-4 text-center text-neutral-500 text-sm'>
                    No asset accounts found. Click the + button below to add your first account.
                  </p>
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
                  className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-neutral-800 border-dashed p-3 text-center text-neutral-500 transition-colors hover:bg-white/[0.02]'
                  type='button'
                >
                  <HugeiconsIcon className='size-5 text-neutral-500' icon={AddSquareIcon} />
                </button>
              }
            />
          </section>
        </div>
      </main>
    </>
  )
}
