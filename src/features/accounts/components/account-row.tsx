import { HugeiconsIcon } from '@hugeicons/react'
import { DialogTrigger } from '@/components/ui/dialog'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { ACCOUNT_TYPES_ICONS } from '@/lib/constants'
import { cn, parseCurrency } from '@/lib/utils'
import type { TAccount } from '../schema'
import { editAccountDialogHandle } from './update-account-modal'

interface Props {
  account: TAccount & { currentBalance: number | null; previousBalance: number | null }
}

export default function AccountRow({ account }: Props) {
  const { data: userPreferences } = useUserPreferences()
  if (!userPreferences) return null

  const current = account.currentBalance ?? 0
  const previous = account.previousBalance ?? 0
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
          className='group flex min-h-18 w-full cursor-pointer flex-col justify-between gap-3 border-border border-b bg-transparent px-4 py-3 transition-all last:border-0 hover:bg-accent/50 sm:flex-row sm:items-center sm:gap-0'
          type='button'
        >
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-md border border-transparent shadow-sm transition-transform group-hover:scale-105',
                account.type === 'cash' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                account.type === 'investment' && 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
                account.type === 'liability' &&
                  'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                account.type === 'other_asset' &&
                  'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              )}
            >
              <HugeiconsIcon className='size-4.5' icon={ACCOUNT_TYPES_ICONS[account.type]} />
            </div>
            <div className='flex flex-col items-start'>
              <div className='flex items-center gap-2'>
                <h3 className='font-medium text-sm transition-colors group-hover:text-primary'>
                  {account.name}
                </h3>
                {!account.isActive && (
                  <span className='rounded-full bg-muted px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider'>
                    Inactive
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                <span className='text-[11px] capitalize opacity-70'>
                  {account.subtype?.replace(/_/g, ' ') || account.type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className='flex flex-row items-center justify-between sm:flex-col sm:items-end sm:justify-center'>
            <p className='font-medium text-sm tabular-nums tracking-tight'>
              {parseCurrency(current, userPreferences.region, account.currency)}
            </p>
            <p
              className={cn(
                'font-medium text-[11px]',
                diff > 0
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : diff < 0
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-muted-foreground italic'
              )}
            >
              {account.previousBalance ? (
                <span>
                  {sign}
                  {parseCurrency(diff, userPreferences.region, account.currency)} ({sign}
                  {percent.toFixed(2)}%)
                </span>
              ) : (
                <span className='text-muted-foreground'>No history</span>
              )}
            </p>
          </div>
        </button>
      }
    />
  )
}
