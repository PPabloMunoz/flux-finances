import { Add01Icon, CreditCardIcon, PieChartIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { authStateFn } from '@/features/auth/queries'
import BudgetRow from '@/features/budgets/components/budget-row'
import DeleteBudgetModal from '@/features/budgets/components/delete-budget-modal'
import NewBudgetModal, {
  newBudgetDialogHandle,
} from '@/features/budgets/components/new-budget-modal'
import UpdateBudgetModal from '@/features/budgets/components/update-budget-modal'
import { getBudgets } from '@/features/budgets/queries'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { parseCurrency } from '@/lib/utils'

export const Route = createFileRoute('/budgets/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

function RouteComponent() {
  const { data: userPreferences } = useUserPreferences()

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await getBudgets()
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  // Calculate summary statistics
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0)
  const totalRemaining = totalBudget - totalSpent
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Determine overall status
  const isOnTrack = overallPercentage <= 85
  const remainingColor = totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'
  const statusText = totalRemaining >= 0 ? 'On Track' : 'Over Budget'

  return (
    <>
      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='mb-8 flex w-full flex-col-reverse items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-center'>
          <div>
            <h1 className='mb-1 font-medium text-2xl tracking-tight'>Budgets</h1>
            <p className='text-muted-foreground text-sm'>Manage your spending limits and goals</p>
          </div>
          <div className='flex w-full items-baseline gap-3 sm:w-auto'>
            <DialogTrigger
              handle={newBudgetDialogHandle}
              render={
                <Button className='w-full sm:w-auto'>
                  <HugeiconsIcon icon={Add01Icon} size={20} />
                  New Budget
                </Button>
              }
            />
          </div>
        </header>

        <section className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {/* Total Budget Card */}
          <div className='group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:bg-accent/50'>
            <div className='mb-4 flex items-center justify-between'>
              <span className='font-medium text-muted-foreground text-xs uppercase tracking-wider'>
                Total Budget
              </span>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                <HugeiconsIcon icon={Wallet01Icon} size={16} />
              </div>
            </div>
            <div className='flex items-baseline gap-2'>
              {userPreferences ? (
                <div className='font-semibold text-2xl tracking-tight'>
                  {parseCurrency(totalBudget, userPreferences.region, userPreferences.currency)}
                </div>
              ) : (
                <Skeleton className='h-9 w-32 rounded-sm' />
              )}
            </div>
            <div className='mt-4 h-1.5 w-full rounded-full bg-muted'>
              <div className='h-full w-full rounded-full bg-muted-foreground/30' />
            </div>
          </div>

          {/* Total Spent Card */}
          <div className='group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:bg-accent/50'>
            <div className='mb-4 flex items-center justify-between'>
              <span className='font-medium text-muted-foreground text-xs uppercase tracking-wider'>
                Total Spent
              </span>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                <HugeiconsIcon icon={CreditCardIcon} size={16} />
              </div>
            </div>
            <div className='flex items-baseline gap-2'>
              {userPreferences ? (
                <>
                  <div className='font-semibold text-2xl tracking-tight'>
                    {parseCurrency(totalSpent, userPreferences.region, userPreferences.currency)}
                  </div>
                  <span className='font-medium text-muted-foreground text-xs'>
                    {overallPercentage.toFixed(0)}%
                  </span>
                </>
              ) : (
                <Skeleton className='h-9 w-32 rounded-sm' />
              )}
            </div>
            <div className='mt-4 h-1.5 w-full rounded-full bg-muted'>
              <div
                className='h-full rounded-full bg-blue-500 transition-all duration-500'
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Remaining Card */}
          <div className='group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:bg-accent/50'>
            <div className='mb-4 flex items-center justify-between'>
              <span className='font-medium text-muted-foreground text-xs uppercase tracking-wider'>
                Remaining
              </span>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                <HugeiconsIcon icon={PieChartIcon} size={16} />
              </div>
            </div>
            <div className='flex items-baseline gap-2'>
              {userPreferences ? (
                <>
                  <div className={`font-semibold text-2xl tracking-tight ${remainingColor}`}>
                    {parseCurrency(
                      Math.abs(totalRemaining),
                      userPreferences.region,
                      userPreferences.currency
                    )}
                  </div>
                  <span className='font-medium text-muted-foreground text-xs'>{statusText}</span>
                </>
              ) : (
                <Skeleton className='h-9 w-32 rounded-sm' />
              )}
            </div>
            <div className='mt-4 flex gap-1'>
              <div
                className={`h-1.5 flex-1 rounded-full ${isOnTrack ? 'bg-emerald-500/80' : 'bg-red-500/80'}`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${isOnTrack ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${isOnTrack ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${isOnTrack ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}
              />
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <div className='flex items-center justify-between px-1'>
            <h3 className='font-medium text-muted-foreground text-sm'>Categories Breakdown</h3>
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-muted-foreground'>Loading budgets...</div>
            </div>
          ) : budgets.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-border border-dashed bg-muted/20 py-16 text-center'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                <HugeiconsIcon className='text-muted-foreground' icon={Wallet01Icon} size={24} />
              </div>
              <h3 className='mb-1 font-medium'>No budgets yet</h3>
              <p className='mb-6 max-w-xs text-muted-foreground text-sm'>
                Create your first budget to start tracking your spending by category.
              </p>
              <DialogTrigger
                handle={newBudgetDialogHandle}
                render={
                  <Button>
                    <HugeiconsIcon icon={Add01Icon} size={18} />
                    Create Budget
                  </Button>
                }
              />
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3'>
              {budgets.map((budget) => (
                <BudgetRow budget={budget} key={budget.id} />
              ))}
            </div>
          )}
        </section>
      </main>

      <NewBudgetModal />
      <UpdateBudgetModal />
      <DeleteBudgetModal />
    </>
  )
}
