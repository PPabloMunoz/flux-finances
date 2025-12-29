import { Button } from '@flux/ui/components/ui/button'
import { DialogTrigger } from '@flux/ui/components/ui/dialog'
import { cn } from '@flux/ui/lib/utils'
import { PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import {
  type ACCOUNT_TYPES,
  ACCOUNT_TYPES_ICONS,
  type CURRENCY_CODES,
  TRANSACTIONS_ICONS,
  type TRANSACTIONS_TYPES,
} from '@/lib/constants'
import { parseCurrency } from '@/lib/utils'
import { updateTransactionModalHandle } from './update-transaction-modal'

interface Props {
  transaction: {
    id: string
    title: string
    amount: string
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
  }
}

export default function TransactionRow({ transaction }: Props) {
  const { data: userPreferences } = useUserPreferences()
  if (!userPreferences) return null

  return (
    <tr className='group cursor-default transition-colors hover:bg-neutral-900/60'>
      <td className='whitespace-nowrap px-4 py-3 text-neutral-400'>
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
                ? 'border-teal-500/20 bg-teal-500/10 text-teal-500'
                : 'border-red-500/20 bg-red-500/10 text-red-500'
            )}
          >
            <HugeiconsIcon className='size-3.5' icon={TRANSACTIONS_ICONS[transaction.type]} />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-white'>{transaction.title}</span>
          </div>
        </div>
      </td>
      <td className='px-4 py-3'>
        <div className='inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-medium text-[10px] text-neutral-400'>
          <div
            className='mr-1.5 size-1.5 rounded-full'
            style={{ backgroundColor: transaction.categoryColor ?? '#525252' }}
          />
          {transaction.categoryName || 'No Category'}
        </div>
      </td>
      <td className='px-4 py-3 text-neutral-400'>
        <div className='flex items-center gap-1.5'>
          <div
            className={cn(
              'flex size-4.5 items-center justify-center rounded-sm text-white shadow-lg',
              transaction.accountType === 'cash' && 'bg-blue-700 shadow-blue-900/20',
              transaction.accountType === 'investment' && 'bg-teal-700 shadow-teal-900/20',
              transaction.accountType === 'liability' && 'bg-orange-700 shadow-orange-900/20',
              transaction.accountType === 'other_asset' && 'bg-slate-700 shadow-slate-900/20'
            )}
          >
            <HugeiconsIcon className='size-3' icon={ACCOUNT_TYPES_ICONS[transaction.accountType]} />
          </div>
          {transaction.accountName}
        </div>
      </td>
      <td className='px-4 py-3 text-right font-medium text-white'>
        {parseCurrency(
          Number(transaction.amount),
          userPreferences.region,
          transaction.accountCurrency
        )}
      </td>
      <td className='px-4 py-3 text-right'>
        <DialogTrigger
          handle={updateTransactionModalHandle}
          payload={transaction}
          render={
            <Button className='p-2' variant='ghost'>
              <HugeiconsIcon className='size-4' icon={PencilEdit02Icon} />
            </Button>
          }
        />
      </td>
    </tr>
  )
}
