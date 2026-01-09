import { HugeiconsIcon } from '@hugeicons/react'
import { DialogTrigger } from '@/components/ui/dialog'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { ACCOUNT_TYPES_ICONS } from '@/lib/constants'
import { cn, parseCurrency } from '@/lib/utils'
import type { TAccount } from '../schema'
import { editAccountDialogHandle } from './update-account-modal'

interface Props {
  account: TAccount & { currentBalance: string | null; previousBalance: string | null }
}

export default function AccountRow({ account }: Props) {
  const { data: userPreferences } = useUserPreferences()
  if (!userPreferences) return null

  const current = Number(account.currentBalance)
  const previous = Number(account.previousBalance)
  const diff = current && previous ? current - previous : 0
  const percent = previous !== 0 ? (diff / previous) * 100 : 0
  const sign = diff >= 0 ? '+' : ''

  return (
    <DialogTrigger
      handle={editAccountDialogHandle}
      key={account.id}
      payload={{
        ...account,
        balance: account.currentBalance,
      }}
      render={
        <button
          className='group flex min-h-18 w-full cursor-pointer flex-col justify-between gap-3 border-neutral-800 border-b bg-transparent px-4 py-3 transition-all hover:bg-neutral-900/40 sm:flex-row sm:items-center sm:gap-0'
          type='button'
        >
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-md border border-white/5 text-white shadow-sm transition-transform group-hover:scale-105',
                account.type === 'cash' && 'bg-blue-500/10 text-blue-400',
                account.type === 'investment' && 'bg-teal-500/10 text-teal-400',
                account.type === 'liability' && 'bg-orange-500/10 text-orange-400',
                account.type === 'other_asset' && 'bg-purple-500/10 text-purple-400'
              )}
            >
              <HugeiconsIcon className='size-4.5' icon={ACCOUNT_TYPES_ICONS[account.type]} />
            </div>
            <div className='flex flex-col items-start'>
              <div className='flex items-center gap-2'>
                <h3 className='font-medium text-neutral-200 text-sm group-hover:text-white'>
                  {account.name}
                </h3>
                {!account.isActive && (
                  <span className='rounded-full bg-neutral-800 px-1.5 py-0.5 font-medium text-[10px] text-neutral-400 uppercase tracking-wider'>
                    Inactive
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2 text-neutral-500 text-xs'>
                <span className='text-[11px] text-neutral-600 capitalize'>
                  {account.subtype?.replace(/_/g, ' ') || account.type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className='flex flex-row items-center justify-between sm:flex-col sm:items-end sm:justify-center'>
            <p className='font-medium text-sm text-white tabular-nums tracking-tight'>
              {parseCurrency(
                Number(account.currentBalance),
                userPreferences.region,
                account.currency
              )}
            </p>
            <p
              className={cn(
                'font-medium text-[11px]',
                diff > 0
                  ? 'text-emerald-500'
                  : diff < 0
                    ? 'text-red-500'
                    : 'text-neutral-600 italic'
              )}
            >
              {account.previousBalance ? (
                <span>
                  {sign}
                  {parseCurrency(diff, userPreferences.region, account.currency)} ({sign}
                  {percent.toFixed(2)}%)
                </span>
              ) : (
                <span className='text-neutral-600'>No history</span>
              )}
            </p>
          </div>
        </button>
      }
    />
  )
}
