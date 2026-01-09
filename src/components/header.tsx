import {
  Add01FreeIcons,
  ArrowDown01Icon,
  Calculator01Icon,
  CommandIcon,
  Dollar02FreeIcons,
  Download02Icon,
  Invoice02Icon,
  Invoice03Icon,
  Logout05Icon,
  Menu01Icon,
  Settings01Icon,
  Upload01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import NewAccountModal from '@/features/accounts/components/new-account-modal'
import NewBudgetModal from '@/features/budgets/components/new-budget-modal'
import { quickActionsDialogHandle } from '@/features/general/quick-actions-modal'
import { exportDialogHandle, ImportModal, importDialogHandle } from '@/features/import-export'
import ExportModal from '@/features/import-export/components/export-modal'
import NewTransactionModal from '@/features/transactions/components/new-transaction-modal'
import { authClient } from '@/lib/auth/client'

export default function AppHeader() {
  const [isMounted, setIsMounted] = useState(false)
  const session = authClient.useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      <NewTransactionModal onConfirm={() => quickActionsDialogHandle.close()} />
      <NewAccountModal onConfirm={() => quickActionsDialogHandle.close()} />
      <NewBudgetModal onConfirm={() => quickActionsDialogHandle.close()} />
      <ExportModal />
      <ImportModal />

      <nav className='sticky top-0 z-50 border-neutral-900 border-b bg-[#050505]/80 backdrop-blur-md'>
        <div className='mx-auto flex h-14 max-w-500 items-center justify-between px-4 md:px-6'>
          <div className='flex items-center gap-4 md:gap-8'>
            <div className='flex md:hidden'>
              <Popover>
                <PopoverTrigger className='flex items-center justify-center rounded-md p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white'>
                  <HugeiconsIcon className='size-5' icon={Menu01Icon} />
                </PopoverTrigger>
                <PopoverContent align='start' className='w-56 p-2' sideOffset={8}>
                  <div className='flex flex-col gap-1'>
                    <Link
                      activeProps={{ className: 'bg-white/5 text-white' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                      to='/'
                    >
                      Dashboard
                    </Link>
                    <Link
                      activeProps={{ className: 'bg-white/5 text-white' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                      to='/transactions'
                    >
                      Transactions
                    </Link>
                    <Link
                      activeProps={{ className: 'bg-white/5 text-white' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                      to='/accounts'
                    >
                      Accounts
                    </Link>
                    <Link
                      activeProps={{ className: 'bg-white/5 text-white' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                      to='/budgets'
                    >
                      Budgets
                    </Link>
                    <div className='my-1 h-px bg-neutral-800' />
                    <Link
                      activeProps={{ className: 'bg-white/5 text-white' }}
                      className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                      to='/settings'
                    >
                      <HugeiconsIcon className='size-3.5' icon={Settings01Icon} />
                      Settings
                    </Link>
                    <span className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-neutral-400/30 text-xs transition-colors'>
                      <HugeiconsIcon className='size-3.5' icon={Invoice03Icon} />
                      Import (Coming Soon)
                    </span>
                    <span className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-neutral-400/30 text-xs transition-colors'>
                      <HugeiconsIcon className='size-3.5' icon={Calculator01Icon} />
                      Tools (Coming Soon)
                    </span>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Link className='flex cursor-pointer items-center gap-2 text-white' to='/'>
              <div className='flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-teal-500 to-cyan-400'>
                <HugeiconsIcon className='size-4.5' icon={Dollar02FreeIcons} />
              </div>
              <span className='font-medium text-sm tracking-tight'>Flux Finances</span>
            </Link>

            <div className='hidden items-center gap-1 md:flex'>
              <Link
                activeProps={{ className: 'bg-white/5 text-white' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{ className: 'text-neutral-400 hover:bg-white/5 hover:text-white' }}
                to='/'
              >
                Dashboard
              </Link>
              <Link
                activeProps={{ className: 'bg-white/5 text-white' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{ className: 'text-neutral-400 hover:bg-white/5 hover:text-white' }}
                to='/transactions'
              >
                Transactions
              </Link>
              <Link
                activeProps={{ className: 'bg-white/5 text-white' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{ className: 'text-neutral-400 hover:bg-white/5 hover:text-white' }}
                to='/accounts'
              >
                Accounts
              </Link>
              <Link
                activeProps={{ className: 'bg-white/5 text-white' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{ className: 'text-neutral-400 hover:bg-white/5 hover:text-white' }}
                to='/budgets'
              >
                Budgets
              </Link>

              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      className='flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                      type='button'
                    >
                      More
                      <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
                    </button>
                  }
                />
                <PopoverContent className='max-w-45 gap-0.5 p-2'>
                  <Link
                    activeProps={{ className: 'bg-white/5 text-white' }}
                    className='flex items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                    inactiveProps={{
                      className: 'text-neutral-400 hover:bg-white/5 hover:text-white',
                    }}
                    to='/settings'
                  >
                    <HugeiconsIcon className='size-3.5' icon={Settings01Icon} />
                    Settings
                  </Link>
                  <DialogTrigger
                    aria-expanded='false'
                    aria-haspopup='dialog'
                    handle={exportDialogHandle}
                    render={
                      <button
                        className='flex cursor-pointer items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                        type='button'
                      >
                        <HugeiconsIcon className='size-4' icon={Download02Icon} />
                        Export
                      </button>
                    }
                  />
                  <DialogTrigger
                    aria-expanded='false'
                    aria-haspopup='dialog'
                    handle={importDialogHandle}
                    render={
                      <button
                        className='flex cursor-pointer items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                        type='button'
                      >
                        <HugeiconsIcon className='size-4' icon={Upload01Icon} />
                        Import
                      </button>
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <DialogTrigger
              aria-expanded='false'
              aria-haspopup='dialog'
              handle={quickActionsDialogHandle}
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

            <Popover>
              <PopoverTrigger className='flex items-center gap-2 rounded-full border border-transparent py-1 pr-2 pl-1 transition-colors hover:border-neutral-800 hover:bg-neutral-800/50'>
                {!isMounted || !session.data?.user.name ? (
                  <span className='size-6 rounded-full bg-neutral-400/20' />
                ) : (
                  <span className='flex size-6 items-center justify-center rounded-full border border-neutral-700 bg-gradient-to-br from-neutral-700 to-neutral-800 font-medium text-[10px] text-white'>
                    <span>{session.data.user.name.charAt(0)}</span>
                  </span>
                )}
                <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
              </PopoverTrigger>
              <PopoverContent className='max-w-45 gap-0.5 p-2'>
                <button
                  className='flex cursor-pointer items-center gap-2 p-2 text-neutral-400 text-xs transition-colors hover:bg-white/5 hover:text-white'
                  onClick={() => authClient.customer.portal()}
                  type='button'
                >
                  <HugeiconsIcon className='size-3.5' icon={Invoice02Icon} />
                  Billing
                </button>

                <Link
                  className='flex items-center gap-2 p-2 text-red-400 text-xs transition-colors hover:bg-white/5 hover:text-red-500'
                  to='/auth/logout'
                >
                  <HugeiconsIcon className='size-3.5' icon={Logout05Icon} />
                  Logout
                </Link>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </nav>
    </>
  )
}
