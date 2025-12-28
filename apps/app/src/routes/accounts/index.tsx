import { DialogTrigger } from '@flux/ui/components/ui/dialog'
import { cn } from '@flux/ui/lib/utils'
import { AddSquareIcon, BankIcon, TradeUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import DeleteAccountModal from '@/features/accounts/components/delete-account-modal'
import EditAccountModal, {
  editAccountDialogHandle,
} from '@/features/accounts/components/edit-account-modal'
import { newAccountDialogHandle } from '@/features/accounts/components/new-account-modal'
import { getCashAccountsAction } from '@/features/accounts/queries'
import { authStateFn } from '@/features/auth/queries'
import { parseCurrency } from '@/lib/utils'
import { AccountTypes } from '@/types/types'

export const Route = createFileRoute('/accounts/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

function RouteComponent() {
  const { data: cashAccounts = [], isPending: cashAccountsPending } = useQuery({
    queryKey: ['accounts', 'cash'],
    queryFn: async () => {
      const res = await getCashAccountsAction()
      if (!res.ok) {
        toast.error('Failed to load cash accounts')
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

  return (
    <>
      <EditAccountModal />
      <DeleteAccountModal />

      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='mb-10 grid grid-cols-1 gap-6 md:grid-cols-5'>
          <div className='md:col-span-3'>
            <h1 className='mb-1 font-medium text-2xl text-white tracking-tight'>Net Worth</h1>
            <div className='flex items-baseline gap-3'>
              <span className='font-jetbrains font-semibold text-4xl text-white tabular-nums tracking-tighter'>
                $482,900.00
              </span>
              <div className='flex items-center gap-1 font-medium text-teal-500 text-xs'>
                <HugeiconsIcon className='size-3' icon={TradeUpIcon} />
                <span className='font-jetbrains'>$11,200 (2.4%)</span>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4 md:col-span-2'>
            <div className='flex flex-col justify-between rounded-sm border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
              <span className='font-medium text-[10px] text-neutral-500 uppercase tracking-wider'>
                Investment
              </span>
              <span className='font-jetbrains font-medium text-lg text-white tabular-nums'>
                $450,120
              </span>
            </div>
            <div className='flex flex-col justify-between rounded-sm border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
              <span className='font-medium text-[10px] text-neutral-500 uppercase tracking-wider'>
                Liabilities
              </span>
              <span className='font-jetbrains font-medium text-lg text-white tabular-nums'>
                $9,520
              </span>
            </div>
          </div>
        </header>
        <section>
          <div className='mb-3 flex items-center justify-between px-1'>
            <h2 className='font-medium text-neutral-500 text-xs uppercase tracking-widest'>
              Cash & Banking
            </h2>
            <span className='font-medium text-white text-xs tabular-nums'>
              {parseCurrency(cashTotal)}
            </span>
          </div>

          <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
            {cashAccountsPending ? (
              <div className='flex h-18 w-full items-center justify-center'>
                <p className='p-4 text-center text-neutral-500 text-sm'>Loading cash accounts...</p>
              </div>
            ) : cashAccounts.length > 0 ? (
              cashAccounts.map((account) => (
                <DialogTrigger
                  handle={editAccountDialogHandle}
                  key={account.id}
                  payload={{
                    ...account,
                    balance: account.currentBalance,
                  }}
                  render={
                    <button
                      className='group flex min-h-18 w-full cursor-pointer flex-col justify-between gap-3 border-neutral-800 border-b p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'
                      type='button'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='flex size-10 items-center justify-center rounded-sm bg-blue-600 text-white shadow-blue-900/20 shadow-lg'>
                          <HugeiconsIcon className='size-5' icon={BankIcon} />
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium text-sm text-white'>{account.name}</h3>
                            <span
                              className={cn(
                                'size-1.5 rounded-full',
                                account.isActive
                                  ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                  : 'bg-neutral-600'
                              )}
                            />
                          </div>
                          <div className='mt-0.5 flex items-center gap-2 text-neutral-500 text-xs'>
                            <span className='text-neutral-600'>
                              Created {new Date(account.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium text-sm text-white tabular-nums'>
                          {parseCurrency(Number(account.currentBalance), account.currency)}
                        </p>
                        <p className='mt-0.5 font-medium text-[10px] text-teal-500'>
                          {account.previousBalance
                            ? (() => {
                                const current = Number(account.currentBalance)
                                const previous = Number(account.previousBalance)
                                const diff = current - previous
                                const percent = (diff / previous) * 100
                                const sign = diff >= 0 ? '+' : ''
                                return `${sign}${parseCurrency(diff)} (${sign}${percent.toFixed(2)}%)`
                              })()
                            : 'No data'}
                        </p>
                      </div>
                    </button>
                  }
                />
              ))
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
            payload={{ type: AccountTypes[0] }}
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
        <section>
          <div className='mb-3 flex items-center justify-between px-1'>
            <h2 className='font-medium text-neutral-500 text-xs uppercase tracking-widest'>
              Investments
            </h2>
            <span className='font-medium text-white text-xs tabular-nums'>$450,120.00</span>
          </div>

          <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
            {/*<!-- Account Item -->*/}
            <div className='group flex flex-col justify-between gap-3 border-neutral-800 border-b p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'>
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-700 bg-neutral-800 text-white'>
                  <span className='iconify' data-icon='lucide:trending-up' data-width='20' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-medium text-sm text-white'>Vanguard Brokerage</h3>
                    <span className='h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' />
                  </div>
                  <div className='mt-0.5 flex items-center gap-2 text-neutral-500 text-xs'>
                    <span className='text-neutral-600'>Syncing...</span>
                    <span
                      className='iconify spin-slow text-neutral-600'
                      data-icon='lucide:loader-2'
                      data-width='10'
                    />
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-medium text-sm text-white tabular-nums'>$324,500.00</p>
                <p className='mt-0.5 font-medium text-[10px] text-teal-500'>+$5,230 (1.2%)</p>
              </div>
            </div>

            {/*<!-- Account Item -->*/}
            <div className='group flex flex-col justify-between gap-3 border-neutral-800 border-b p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'>
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-600 text-white shadow-indigo-900/20 shadow-lg'>
                  <span className='iconify' data-icon='lucide:briefcase' data-width='20' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-medium text-sm text-white'>Fidelity 401(k)</h3>
                    <span className='h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' />
                  </div>
                  <div className='mt-0.5 flex items-center gap-2 text-neutral-500 text-xs'>
                    <span className='text-neutral-600'>Updated 1d ago</span>
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-medium text-sm text-white tabular-nums'>$112,400.00</p>
                <p className='mt-0.5 font-medium text-[10px] text-teal-500'>+$1,120 (0.8%)</p>
              </div>
            </div>

            {/*<!-- Account Item (Crypto) -->*/}
            <div className='group flex flex-col justify-between gap-3 border-neutral-800 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'>
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-sm border border-orange-500/20 bg-orange-500/10 text-orange-500'>
                  <span className='iconify' data-icon='lucide:bitcoin' data-width='20' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-medium text-sm text-white'>Coinbase</h3>
                    <span className='h-1.5 w-1.5 rounded-full bg-neutral-600' />
                  </div>
                  <div className='mt-0.5 flex items-center gap-2 text-neutral-500 text-xs'>
                    <span>Crypto Wallet</span>
                    <span>•</span>
                    <span className='text-neutral-600'>Manual Update</span>
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-medium text-sm text-white tabular-nums'>$13,220.00</p>
                <p className='mt-0.5 font-medium text-[10px] text-red-500'>-$420 (-3.1%)</p>
              </div>
            </div>
          </div>
          <DialogTrigger
            aria-expanded='false'
            aria-haspopup='dialog'
            handle={newAccountDialogHandle}
            payload={{ type: AccountTypes[1] }}
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
              <span className='font-medium text-red-400 text-xs tabular-nums'>-$9,520.00</span>
            </div>

            <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
              <div className='group flex flex-col justify-between gap-3 border-neutral-800 border-b p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-[#0070BA] text-white shadow-blue-900/20 shadow-lg'>
                    <span className='iconify' data-icon='lucide:credit-card' data-width='20' />
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium text-sm text-white'>Chase Sapphire</h3>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-sm text-white tabular-nums'>$3,420.00</p>
                </div>
              </div>

              <div className='group flex flex-col justify-between gap-3 border-neutral-800 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-200 text-black shadow-lg'>
                    <span className='iconify' data-icon='lucide:credit-card' data-width='20' />
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium text-sm text-white'>Amex Platinum</h3>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-sm text-white tabular-nums'>$6,100.00</p>
                </div>
              </div>
            </div>
            <DialogTrigger
              aria-expanded='false'
              aria-haspopup='dialog'
              handle={newAccountDialogHandle}
              payload={{ type: AccountTypes[2] }}
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
              <span className='font-medium text-white text-xs tabular-nums'>$678,500.00</span>
            </div>

            <div className='overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm'>
              <div className='group flex flex-col justify-between gap-3 border-neutral-800 border-b p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-sm border border-emerald-500/20 bg-emerald-500/10 text-emerald-500'>
                    <span className='iconify' data-icon='lucide:home' data-width='20' />
                  </div>
                  <div>
                    <h3 className='font-medium text-sm text-white'>Primary Residence</h3>
                    <div className='mt-0.5 flex items-center gap-2 text-neutral-500 text-xs'>
                      <span>Real Estate • Zestimate</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-sm text-white tabular-nums'>$650,000.00</p>
                </div>
              </div>

              <div className='group flex flex-col justify-between gap-3 border-neutral-800 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-700 bg-neutral-800 text-neutral-400'>
                    <span className='iconify' data-icon='lucide:car-front' data-width='20' />
                  </div>
                  <div>
                    <h3 className='font-medium text-sm text-white'>Tesla Model 3</h3>
                    <div className='mt-0.5 flex items-center gap-2 text-neutral-500 text-xs'>
                      <span>Vehicle • KBB Value</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-sm text-white tabular-nums'>$28,500.00</p>
                </div>
              </div>
            </div>
            <DialogTrigger
              aria-expanded='false'
              aria-haspopup='dialog'
              handle={newAccountDialogHandle}
              payload={{ type: AccountTypes[3] }}
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
