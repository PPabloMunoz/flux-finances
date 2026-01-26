import { LayoutGridIcon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { DialogTrigger } from '@/components/ui/dialog'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { cn, parseCurrency } from '@/lib/utils'
import type { TBudgetWithSpending } from '../schema'
import { editBudgetDialogHandle } from './update-budget-modal'

interface Props {
  budget: TBudgetWithSpending
}

export default function BudgetRow({ budget }: Props) {
  const { data: userPreferences } = useUserPreferences()
  if (!userPreferences) return null

  const budgetAmount = budget.amount
  const spentAmount = budget.spent
  const remainingAmount = budget.remaining
  const percentageUsed = budget.percentageUsed

  // Determine status and colors
  const isOverBudget = spentAmount > budgetAmount
  const isNearLimit = percentageUsed >= 85 && !isOverBudget

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
          className='group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/50 sm:flex-row sm:items-center sm:gap-6'
          type='button'
        >
          {/* Header / Icon Section */}
          <div className='flex flex-1 items-center gap-4'>
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg border shadow-sm'
              )}
              style={{
                backgroundColor: `${budget.categoryColor}2F`,
                borderColor: `${budget.categoryColor}4D`,
                color: `${budget.categoryColor}`,
              }}
            >
              <HugeiconsIcon icon={LayoutGridIcon} size={18} />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h4 className='truncate font-medium text-sm'>{budget.categoryName}</h4>
                <div className='hidden rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:inline-block'>
                  {percentageUsed.toFixed(0)}%
                </div>
              </div>
              <div className='mt-1 flex items-center gap-1.5'>
                <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor)} />
                <span className='text-muted-foreground text-xs'>{statusText}</span>
              </div>
            </div>
          </div>

          {/* Progress & Amounts Section */}
          <div className='flex flex-col gap-3 sm:w-3/5 sm:flex-row sm:items-center sm:gap-6'>
            {/* Progress Bar */}
            <div className='flex-1 space-y-1.5'>
              <div className='flex items-end justify-between text-xs sm:hidden'>
                <span className='text-muted-foreground'>Progress</span>
                <span className='font-medium'>{percentageUsed.toFixed(0)}%</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className={cn('h-full rounded-full transition-all duration-500', progressColor)}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            {/* Amounts */}
            <div className='flex items-center justify-between sm:block sm:min-w-[120px] sm:text-right'>
              <div className='font-medium text-sm'>
                {parseCurrency(spentAmount, userPreferences.region, userPreferences.currency)}
                <span className='ml-1 font-normal text-muted-foreground'>
                  / {parseCurrency(budgetAmount, userPreferences.region, userPreferences.currency)}
                </span>
              </div>
              <div
                className={cn(
                  'font-medium text-xs',
                  isOverBudget ? 'text-red-400' : 'text-emerald-400'
                )}
              >
                {isOverBudget
                  ? `${parseCurrency(Math.abs(remainingAmount), userPreferences.region, userPreferences.currency)} over`
                  : `${parseCurrency(remainingAmount, userPreferences.region, userPreferences.currency)} left`}
              </div>
            </div>
          </div>

          {/* Action Icon */}
          <div className='absolute top-4 right-4 sm:static sm:top-auto sm:right-auto'>
            <HugeiconsIcon
              className='text-muted-foreground transition-colors group-hover:text-foreground'
              icon={MoreHorizontalIcon}
              size={16}
            />
          </div>
        </button>
      }
    />
  )
}
