import { PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import {
  type ACCOUNT_TYPES,
  ACCOUNT_TYPES_ICONS,
  type CURRENCY_CODES,
  TRANSACTIONS_ICONS,
  type TRANSACTIONS_TYPES,
} from '@/lib/constants'
import { cn, parseCurrency } from '@/lib/utils'
import { updateTransactionModalHandle } from './update-transaction-modal'

interface Props {
  transaction: {
    id: string
    title: string
    amount: number
    type: (typeof TRANSACTIONS_TYPES)[number]
    date: string
    description: string | null
    accountId: string
    accountName: string
    accountType: (typeof ACCOUNT_TYPES)[number]
    accountCurrency: (typeof CURRENCY_CODES)[number]
    categoryId: string | null
    categoryName: string | null
    categoryColor: string | null
    transferId: string | null
  }
}

export default function TransactionRow({ transaction }: Props) {
  const { data: userPreferences } = useUserPreferences()
  if (!userPreferences) return null

  return (
    <DialogTrigger
      handle={updateTransactionModalHandle}
      nativeButton={false}
      payload={transaction}
      render={
        <tr className='group cursor-default transition-colors hover:bg-accent/80'>
          <td className='whitespace-nowrap px-4 py-3 text-muted-foreground'>
            {new Date(transaction.date).toLocaleDateString(userPreferences.region, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </td>
          <td className='px-4 py-3'>
            <div className='flex items-center gap-3'>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border',
                  transaction.type === 'inflow'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                )}
              >
                <HugeiconsIcon className='size-3.5' icon={TRANSACTIONS_ICONS[transaction.type]} />
              </div>
              <div className='flex flex-col'>
                <span className='font-medium'>{transaction.title}</span>
              </div>
            </div>
          </td>
          <td className='px-4 py-3'>
            <div className='inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 font-medium text-[10px] text-muted-foreground'>
              {!transaction.transferId && (
                <div
                  className='mr-1.5 size-1.5 rounded-full'
                  style={{ backgroundColor: transaction.categoryColor ?? '#525252' }}
                />
              )}
              {transaction.transferId ? 'Transfer' : transaction.categoryName || 'No Category'}
            </div>
          </td>
          <td className='px-4 py-3 text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <div
                className={cn(
                  'flex size-4.5 items-center justify-center rounded-sm transition-colors',
                  transaction.accountType === 'cash' &&
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  transaction.accountType === 'investment' &&
                    'bg-teal-500/10 text-teal-600 dark:text-teal-400',
                  transaction.accountType === 'liability' &&
                    'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                  transaction.accountType === 'other_asset' && 'bg-muted text-muted-foreground'
                )}
              >
                <HugeiconsIcon
                  className='size-3'
                  icon={ACCOUNT_TYPES_ICONS[transaction.accountType]}
                />
              </div>
              {transaction.accountName}
            </div>
          </td>
          <td
            className={cn(
              'px-4 py-3 text-right font-medium',
              transaction.type === 'inflow'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {transaction.type === 'inflow' ? '+' : '-'}
            {parseCurrency(
              Number(transaction.amount),
              userPreferences.region,
              transaction.accountCurrency
            )}
          </td>
          <td className='px-4 py-3 text-right'>
            <Button className='p-2 opacity-0 group-hover:opacity-100' variant='ghost'>
              <HugeiconsIcon className='size-4' icon={PencilEdit02Icon} />
            </Button>
          </td>
        </tr>
      }
    />
  )
}
