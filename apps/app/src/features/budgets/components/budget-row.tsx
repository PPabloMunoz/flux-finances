import { DialogTrigger } from '@flux/ui/components/ui/dialog'
import { cn } from '@flux/ui/lib/utils'
import { LayoutGridIcon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { parseCurrency } from '@/lib/utils'
import type { TBudgetWithSpending } from '../schema'
import { editBudgetDialogHandle } from './update-budget-modal'

interface Props {
  budget: TBudgetWithSpending
}

export default function BudgetRow({ budget }: Props) {
  const { data: userPreferences } = useUserPreferences()
  if (!userPreferences) return null

  const budgetAmount = Number(budget.amount)
  const spentAmount = Number(budget.spent)
  const remainingAmount = Number(budget.remaining)
  const percentageUsed = budget.percentageUsed

  // Determine status and colors
  const isOverBudget = spentAmount > budgetAmount
  const isNearLimit = percentageUsed >= 85 && !isOverBudget

  const statusColor = isOverBudget
    ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : isNearLimit
      ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

  const progressColor = isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-blue-500'

  const statusText = isOverBudget ? 'Over budget' : isNearLimit ? 'Approaching limit' : 'Healthy'
  const statusDotColor = isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-blue-500'
  const progressWidth = Math.min(percentageUsed, 100)

  return (
    <DialogTrigger
      handle={editBudgetDialogHandle}
      key={budget.id}
      payload={budget}
      render={
        <button
          className='group relative flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/60 sm:flex-row sm:items-center sm:gap-6'
          type='button'
        >
          {/* Header / Icon Section */}
          <div className='flex flex-1 items-center gap-4'>
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm',
                statusColor
              )}
            >
              <HugeiconsIcon icon={LayoutGridIcon} size={18} />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h4 className='truncate font-medium text-sm text-white'>{budget.categoryName}</h4>
                <div className='hidden rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400 sm:inline-block'>
                  {percentageUsed.toFixed(0)}%
                </div>
              </div>
              <div className='mt-1 flex items-center gap-1.5'>
                <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor)} />
                <span className='text-neutral-500 text-xs'>{statusText}</span>
              </div>
            </div>
          </div>

          {/* Progress & Amounts Section */}
          <div className='flex flex-col gap-3 sm:w-3/5 sm:flex-row sm:items-center sm:gap-6'>
            {/* Progress Bar */}
            <div className='flex-1 space-y-1.5'>
              <div className='flex items-end justify-between text-xs sm:hidden'>
                <span className='text-neutral-400'>Progress</span>
                <span className='text-white'>{percentageUsed.toFixed(0)}%</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-neutral-800'>
                <div
                  className={cn('h-full rounded-full transition-all duration-500', progressColor)}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            {/* Amounts */}
            <div className='flex items-center justify-between sm:block sm:min-w-[120px] sm:text-right'>
              <div className='font-medium text-sm text-white'>
                {parseCurrency(spentAmount, userPreferences.region, 'USD')}
                <span className='ml-1 font-normal text-neutral-500'>
                  / {parseCurrency(budgetAmount, userPreferences.region, 'USD')}
                </span>
              </div>
              <div
                className={cn(
                  'font-medium text-xs',
                  isOverBudget ? 'text-red-400' : 'text-emerald-400'
                )}
              >
                {isOverBudget
                  ? `${parseCurrency(Math.abs(remainingAmount), userPreferences.region, 'USD')} over`
                  : `${parseCurrency(remainingAmount, userPreferences.region, 'USD')} left`}
              </div>
            </div>
          </div>

          {/* Action Icon */}
          <div className='absolute top-4 right-4 sm:static sm:top-auto sm:right-auto'>
            <HugeiconsIcon
              className='text-neutral-500 transition-colors group-hover:text-white'
              icon={MoreHorizontalIcon}
              size={16}
            />
          </div>
        </button>
      }
    />
  )
}
