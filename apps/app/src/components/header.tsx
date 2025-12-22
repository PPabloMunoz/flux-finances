import { DialogTrigger } from '@flux/ui/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@flux/ui/components/ui/popover'
import {
  Add01FreeIcons,
  ArrowDown01Icon,
  CommandIcon,
  Dollar02FreeIcons,
  Invoice03Icon,
  LeftToRightListDashIcon,
  Logout05Icon,
  RepostIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { quickActionsDialog } from '@/features/general/quick-actions-modal'

export default function AppHeader() {
  return (
    <nav className='sticky top-0 z-50 border-neutral-900 border-b bg-[#050505]/80 backdrop-blur-md'>
      <div className='flex h-14 items-center justify-between px-6'>
        {/*<!-- Left: Logo & Main Links -->*/}
        <div className='flex items-center gap-8'>
          {/*<!-- Logo -->*/}
          <div className='flex cursor-pointer items-center gap-2 text-white'>
            <div className='flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-teal-500 to-cyan-400'>
              <HugeiconsIcon className='size-4.5' icon={Dollar02FreeIcons} />
            </div>
            <span className='font-medium text-sm tracking-tight'>Flux Finances</span>
          </div>

          {/*<!-- Desktop Navigation Links -->*/}
          <div className='hidden items-center gap-1 md:flex'>
            <a
              className='rounded-md bg-white/5 px-3 py-1.5 font-medium text-white text-xs transition-colors'
              href='#'
            >
              Dashboard
            </a>

            {/*<!-- Dropdown: Transactions -->*/}
            <div className='nav-item group relative flex h-full items-center'>
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      className='flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                      type='button'
                    >
                      Transactions
                      <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
                    </button>
                  }
                />
                <PopoverContent className='max-w-45 gap-0.5 p-2'>
                  <a
                    className='flex items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <HugeiconsIcon className='size-3.5' icon={LeftToRightListDashIcon} />
                    All Transactions
                  </a>
                  <a
                    className='flex items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <HugeiconsIcon className='size-3.5' icon={Invoice03Icon} />
                    Expenses
                  </a>
                  <div className='mx-2 my-1 h-px bg-neutral-800' />
                  <a
                    className='flex items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <HugeiconsIcon className='size-3.5' icon={RepostIcon} />
                    Recurring
                  </a>
                </PopoverContent>
              </Popover>
            </div>

            {/*<!-- Dropdown: Management -->*/}
            <div className='nav-item group relative flex h-full items-center'>
              <button className='flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'>
                Management
                <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
              </button>
              <div className='nav-dropdown absolute top-full left-0 hidden w-48 pt-2'>
                <div className='rounded-lg border border-neutral-800 bg-[#0A0A0A] p-1 shadow-2xl'>
                  <div className='px-2 py-1.5 font-semibold text-[10px] text-neutral-600 uppercase tracking-wider'>
                    Accounts
                  </div>
                  <a
                    className='group/item flex items-center justify-between rounded-md px-2 py-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <span className='flex items-center gap-2'>
                      <span className='iconify' data-icon='lucide:wallet' data-width='14' />{' '}
                      Checking
                    </span>
                    <span className='text-[10px] text-neutral-500 opacity-0 group-hover/item:opacity-100'>
                      ⌘1
                    </span>
                  </a>
                  <a
                    className='group/item flex items-center justify-between rounded-md px-2 py-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <span className='flex items-center gap-2'>
                      <span className='iconify' data-icon='lucide:piggy-bank' data-width='14' />{' '}
                      Savings
                    </span>
                    <span className='text-[10px] text-neutral-500 opacity-0 group-hover/item:opacity-100'>
                      ⌘2
                    </span>
                  </a>
                  <div className='mx-2 my-1 h-px bg-neutral-800' />
                  <div className='px-2 py-1.5 font-semibold text-[10px] text-neutral-600 uppercase tracking-wider'>
                    Planning
                  </div>
                  <a
                    className='flex items-center gap-2 rounded-md px-2 py-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <span className='iconify' data-icon='lucide:pie-chart' data-width='14' />
                    Budgeting
                  </a>
                  <a
                    className='flex items-center gap-2 rounded-md px-2 py-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <span className='iconify' data-icon='lucide:target' data-width='14' />
                    Goals
                  </a>
                </div>
              </div>
            </div>

            {/*<!-- Dropdown: Investments -->*/}
            <div className='nav-item group relative flex h-full items-center'>
              <button
                className='flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                type='button'
              >
                Investments
                <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
              </button>
              <div className='nav-dropdown absolute top-full left-0 hidden w-48 pt-2'>
                <div className='rounded-lg border border-neutral-800 bg-[#0A0A0A] p-1 shadow-2xl'>
                  <a
                    className='flex items-center gap-2 rounded-md px-2 py-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <span className='iconify' data-icon='lucide:bar-chart-2' data-width='14' />
                    Portfolio
                  </a>
                  <a
                    className='flex items-center gap-2 rounded-md px-2 py-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <span className='iconify' data-icon='lucide:trending-up' data-width='14' />
                    Stocks & ETFs
                  </a>
                  <a
                    className='flex items-center gap-2 rounded-md px-2 py-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    href='#'
                  >
                    <span className='iconify' data-icon='lucide:bitcoin' data-width='14' />
                    Crypto
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*<!-- Right: Search & Profile -->*/}
        <div className='flex items-center gap-3'>
          <DialogTrigger
            handle={quickActionsDialog}
            render={
              <button
                className='group relative flex items-center gap-3 rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-1.5 shadow-sm transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-800'
                type='button'
              >
                <HugeiconsIcon className='size-4 text-teal-400' icon={Add01FreeIcons} />
                <span className='hidden font-medium text-neutral-400 text-xs group-hover:text-neutral-200 lg:inline'>
                  Quick Actions
                </span>
                <div className='ml-auto hidden items-center gap-1 lg:flex'>
                  <span className='flex h-5 items-center justify-center rounded border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[10px] text-neutral-400 group-hover:border-neutral-600'>
                    <HugeiconsIcon className='mr-0.5 size-2.5' icon={CommandIcon} />K
                  </span>
                </div>
              </button>
            }
          />

          <div className='mx-1 h-4 w-px bg-neutral-800' />

          {/*<!-- Profile Dropdown Trigger (Simplified for visuals) -->*/}
          <Popover>
            <PopoverTrigger
              render={
                <button
                  className='flex items-center gap-2 rounded-full border border-transparent py-1 pr-2 pl-1 transition-colors hover:border-neutral-800 hover:bg-neutral-800/50'
                  type='button'
                >
                  <div className='flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-gradient-to-br from-neutral-700 to-neutral-800 font-medium text-[10px] text-white'>
                    JD
                  </div>
                  <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
                </button>
              }
            />
            <PopoverContent className='max-w-45 gap-0.5 p-2'>
              <button
                className='flex items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                type='button'
              >
                <HugeiconsIcon className='size-3.5' icon={Settings01Icon} />
                Profile Settings
              </button>
              <button
                className='flex items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-red-400'
                type='button'
              >
                <HugeiconsIcon className='size-3.5' icon={Logout05Icon} />
                Logout
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  )
}
