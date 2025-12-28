import { DialogTrigger } from '@flux/ui/components/ui/dialog'
import { cn } from '@flux/ui/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { ACCOUNT_TYPES_ICONS } from '@/lib/constants'
import { parseCurrency } from '@/lib/utils'
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
          className='group flex min-h-18 w-full cursor-pointer flex-col justify-between gap-3 border-neutral-800 border-b p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0'
          type='button'
        >
          <div className='flex items-center gap-4'>
            <div className='flex size-10 items-center justify-center rounded-sm bg-blue-600 text-white shadow-blue-900/20 shadow-lg'>
              <HugeiconsIcon className='size-5' icon={ACCOUNT_TYPES_ICONS[account.type]} />
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
              {parseCurrency(
                Number(account.currentBalance),
                userPreferences.region,
                account.currency
              )}
            </p>
            <p
              className={cn(
                'mt-0.5 font-medium text-[10px]',
                diff > 0
                  ? 'text-teal-400'
                  : diff < 0
                    ? 'text-red-400'
                    : 'text-neutral-500/50 italic'
              )}
            >
              {account.previousBalance ? (
                <span>
                  {sign}
                  {parseCurrency(diff, userPreferences.region, account.currency)} ({sign}
                  {percent.toFixed(2)}%)
                </span>
              ) : (
                'No previous data'
              )}
            </p>
          </div>
        </button>
      }
    />
  )
}
