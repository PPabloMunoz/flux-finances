import { Button } from '@flux/ui/components/ui/button'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import AppHeader from '@/components/header'

export const Route = createFileRoute('/budgets/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='mb-8 flex w-full flex-col-reverse items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-center'>
          <div>
            <h1 className='mb-1 font-medium text-2xl text-white tracking-tight'>Budgets</h1>
            <p className='text-gray-400 text-sm'>Manage your budgets and track your spending</p>
          </div>
          <div className='flex w-full items-baseline gap-3 sm:w-auto'>
            <Button className='w-full'>
              <HugeiconsIcon icon={Add01Icon} size={20} />
              New Budget
            </Button>
          </div>
        </header>

        <section className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 transition-colors hover:bg-neutral-900/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-neutral-500 text-xs'>Total Budget</span>
              <span
                className='iconify text-neutral-600'
                data-icon='lucide:wallet'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div className='flex items-baseline gap-2'>
              <div className='font-medium text-white text-xl tracking-tight'>$4,800.00</div>
            </div>
            <div className='mt-3 h-1 w-full rounded-full bg-neutral-800'>
              <div className='h-full w-full rounded-full bg-neutral-600' />
            </div>
          </div>

          <div className='group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 transition-colors hover:bg-neutral-900/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-neutral-500 text-xs'>Total Spent</span>
              <span
                className='iconify text-neutral-600'
                data-icon='lucide:credit-card'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div className='flex items-baseline gap-2'>
              <div className='font-medium text-white text-xl tracking-tight'>$3,120.50</div>
              <span className='font-medium text-[10px] text-neutral-500'>65% used</span>
            </div>
            <div className='mt-3 h-1 w-full rounded-full bg-neutral-800'>
              <div className='h-full w-[65%] rounded-full bg-blue-500' />
            </div>
          </div>

          <div className='group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 transition-colors hover:bg-neutral-900/50'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-medium text-neutral-500 text-xs'>Remaining</span>
              <span
                className='iconify text-neutral-600'
                data-icon='lucide:pie-chart'
                data-stroke-width='1.5'
                data-width='14'
              />
            </div>
            <div className='flex items-baseline gap-2'>
              <div className='font-medium text-emerald-400 text-xl tracking-tight'>$1,679.50</div>
              <span className='font-medium text-[10px] text-neutral-500'>On Track</span>
            </div>
            <div className='mt-3 flex gap-0.5'>
              <div className='h-1 w-1 rounded-full bg-emerald-500/80' />
              <div className='h-1 w-1 rounded-full bg-emerald-500/60' />
              <div className='h-1 w-1 rounded-full bg-emerald-500/40' />
              <div className='h-1 w-1 rounded-full bg-emerald-500/20' />
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <div className='flex items-center justify-between px-1'>
            <h3 className='font-semibold text-neutral-500 text-xs uppercase tracking-wider'>
              Categories Breakdown
            </h3>
          </div>

          <div className='grid grid-cols-1 gap-3'>
            <div className='group relative flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/20 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/40'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 shadow-inner'>
                    <span
                      className='iconify'
                      data-icon='lucide:home'
                      data-stroke-width='1.5'
                      data-width='18'
                    />
                  </div>
                  <div>
                    <h4 className='font-medium text-sm text-white'>Housing & Utilities</h4>
                    <div className='mt-0.5 flex items-center gap-1.5'>
                      <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                      <span className='text-[10px] text-neutral-500'>Paid in full</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-sm text-white'>$2,100 / $2,100</div>
                  <div className='text-[10px] text-neutral-500'>$0.00 left</div>
                </div>
              </div>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-neutral-800'>
                <div className='absolute top-0 left-0 h-full w-full bg-neutral-500' />
              </div>

              <button
                className='absolute top-4 right-4 p-1 text-neutral-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100'
                onclick="openModal('edit-budget-modal')"
              >
                <span className='iconify' data-icon='lucide:more-horizontal' data-width='16' />
              </button>
            </div>

            <div className='group relative flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/20 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/40'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400 shadow-inner'>
                    <span
                      className='iconify'
                      data-icon='lucide:shopping-basket'
                      data-stroke-width='1.5'
                      data-width='18'
                    />
                  </div>
                  <div>
                    <h4 className='font-medium text-sm text-white'>Food & Groceries</h4>
                    <div className='mt-0.5 flex items-center gap-1.5'>
                      <span className='h-1.5 w-1.5 rounded-full bg-orange-500' />
                      <span className='text-[10px] text-neutral-500'>Approaching limit</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-sm text-white'>$520 / $600</div>
                  <div className='text-[10px] text-neutral-500'>$80.00 left</div>
                </div>
              </div>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-neutral-800'>
                <div className='absolute top-0 left-0 h-full w-[86%] bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' />
              </div>
              <button
                className='absolute top-4 right-4 p-1 text-neutral-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100'
                onclick="openModal('edit-budget-modal')"
              >
                <span className='iconify' data-icon='lucide:more-horizontal' data-width='16' />
              </button>
            </div>

            <div className='group relative flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/20 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/40'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-inner'>
                    <span
                      className='iconify'
                      data-icon='lucide:film'
                      data-stroke-width='1.5'
                      data-width='18'
                    />
                  </div>
                  <div>
                    <h4 className='font-medium text-sm text-white'>Entertainment</h4>
                    <div className='mt-0.5 flex items-center gap-1.5'>
                      <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                      <span className='text-[10px] text-neutral-500'>Healthy</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-sm text-white'>$120 / $300</div>
                  <div className='text-[10px] text-neutral-500'>$180.00 left</div>
                </div>
              </div>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-neutral-800'>
                <div className='absolute top-0 left-0 h-full w-[40%] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' />
              </div>
              <button
                className='absolute top-4 right-4 p-1 text-neutral-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100'
                onclick="openModal('edit-budget-modal')"
              >
                <span className='iconify' data-icon='lucide:more-horizontal' data-width='16' />
              </button>
            </div>

            <div className='group relative flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/20 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/40'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-inner'>
                    <span
                      className='iconify'
                      data-icon='lucide:car'
                      data-stroke-width='1.5'
                      data-width='18'
                    />
                  </div>
                  <div>
                    <h4 className='font-medium text-sm text-white'>Transportation</h4>
                    <div className='mt-0.5 flex items-center gap-1.5'>
                      <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                      <span className='text-[10px] text-neutral-500'>Healthy</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-sm text-white'>$145 / $250</div>
                  <div className='text-[10px] text-neutral-500'>$105.00 left</div>
                </div>
              </div>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-neutral-800'>
                <div className='absolute top-0 left-0 h-full w-[58%] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' />
              </div>
              <button
                className='absolute top-4 right-4 p-1 text-neutral-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100'
                onclick="openModal('edit-budget-modal')"
              >
                <span className='iconify' data-icon='lucide:more-horizontal' data-width='16' />
              </button>
            </div>

            <div className='group relative flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/20 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/40'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 shadow-inner'>
                    <span
                      className='iconify'
                      data-icon='lucide:cpu'
                      data-stroke-width='1.5'
                      data-width='18'
                    />
                  </div>
                  <div>
                    <h4 className='font-medium text-sm text-white'>Software & Subs</h4>
                    <div className='mt-0.5 flex items-center gap-1.5'>
                      <span className='h-1.5 w-1.5 rounded-full bg-red-500' />
                      <span className='text-[10px] text-neutral-500'>Over budget</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-red-400 text-sm'>$235 / $200</div>
                  <div className='text-[10px] text-red-500/70'>-$35.00 over</div>
                </div>
              </div>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-neutral-800'>
                <div className='absolute top-0 left-0 h-full w-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' />
              </div>
              <button
                className='absolute top-4 right-4 p-1 text-neutral-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100'
                onclick="openModal('edit-budget-modal')"
              >
                <span className='iconify' data-icon='lucide:more-horizontal' data-width='16' />
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
