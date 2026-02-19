import {
  Add01FreeIcons,
  ArrowDown01Icon,
  CommandIcon,
  Logout05Icon,
  Menu01Icon,
  Moon02Icon,
  Settings01Icon,
  Sun01Icon,
  User02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import NewAccountModal from '@/features/accounts/components/new-account-modal'
import NewBudgetModal from '@/features/budgets/components/new-budget-modal'
import { quickActionsDialogHandle } from '@/features/general/quick-actions-modal'
import { NewTransferModal } from '@/features/transactions'
import NewTransactionModal from '@/features/transactions/components/new-transaction-modal'
import { authClient } from '@/lib/auth/client'
import { useTheme } from '@/lib/theme-provider'
import { Skeleton } from './ui/skeleton'

const isMountedStore = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
}

export default function AppHeader() {
  const isMounted = useSyncExternalStore(
    isMountedStore.subscribe,
    isMountedStore.getSnapshot,
    isMountedStore.getServerSnapshot
  )
  const session = authClient.useSession()
  const { toggleTheme, isDark } = useTheme()

  return (
    <>
      <NewTransactionModal onConfirm={() => quickActionsDialogHandle.close()} />
      <NewAccountModal onConfirm={() => quickActionsDialogHandle.close()} />
      <NewBudgetModal onConfirm={() => quickActionsDialogHandle.close()} />
      <NewTransferModal />

      <nav className='sticky top-0 z-50 border-border border-b bg-background/80 backdrop-blur-md'>
        <div className='mx-auto flex h-14 max-w-500 items-center justify-between px-4 md:px-6'>
          <div className='flex items-center gap-4 md:gap-8'>
            <div className='flex md:hidden'>
              <Popover>
                <PopoverTrigger className='flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'>
                  <HugeiconsIcon className='size-5' icon={Menu01Icon} />
                </PopoverTrigger>
                <PopoverContent align='start' className='w-56 p-2' sideOffset={8}>
                  <div className='flex flex-col gap-1'>
                    <Link
                      activeProps={{ className: 'bg-accent text-accent-foreground' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                      to='/'
                    >
                      Dashboard
                    </Link>
                    <Link
                      activeProps={{ className: 'bg-accent text-accent-foreground' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                      to='/transactions'
                    >
                      Transactions
                    </Link>
                    <Link
                      activeProps={{ className: 'bg-accent text-accent-foreground' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                      to='/accounts'
                    >
                      Accounts
                    </Link>
                    <Link
                      activeProps={{ className: 'bg-accent text-accent-foreground' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                      to='/budgets'
                    >
                      Budgets
                    </Link>
                    <Link
                      activeProps={{ className: 'bg-accent text-accent-foreground' }}
                      className='flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                      to='/analytics'
                    >
                      Analytics
                    </Link>
                    <div className='my-1 h-px bg-border' />
                    <Link
                      activeProps={{ className: 'bg-accent text-accent-foreground' }}
                      className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                      to='/settings'
                    >
                      <HugeiconsIcon className='size-3.5' icon={Settings01Icon} />
                      Settings
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Link className='flex cursor-pointer items-center gap-2 text-foreground' to='/'>
              <img alt='Flux Finances Logo' className='size-5' src='/favicon.svg' />
              <span className='font-medium text-sm tracking-tight'>Flux Finances</span>
            </Link>

            <div className='hidden items-center gap-1 md:flex'>
              <Link
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{
                  className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                }}
                to='/'
              >
                Dashboard
              </Link>
              <Link
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{
                  className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                }}
                to='/transactions'
              >
                Transactions
              </Link>
              <Link
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{
                  className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                }}
                to='/accounts'
              >
                Accounts
              </Link>
              <Link
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{
                  className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                }}
                to='/budgets'
              >
                Budgets
              </Link>
              <Link
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
                className='px-3 py-1.5 font-medium text-xs transition-colors'
                inactiveProps={{
                  className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                }}
                to='/analytics'
              >
                Analytics
              </Link>

              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      className='flex items-center gap-1.5 px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                      type='button'
                    >
                      More
                      <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
                    </button>
                  }
                />
                <PopoverContent className='max-w-45 gap-0.5 p-2'>
                  <Link
                    activeProps={{ className: 'bg-accent text-accent-foreground' }}
                    className='flex items-center gap-2 p-2 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                    inactiveProps={{
                      className:
                        'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    }}
                    to='/settings'
                  >
                    <HugeiconsIcon className='size-3.5' icon={Settings01Icon} />
                    Settings
                  </Link>
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
                  className='group relative flex items-center gap-3 rounded-sm border border-border bg-secondary px-3 py-1.5 shadow-sm transition-all duration-300 hover:bg-secondary/80'
                  type='button'
                >
                  <HugeiconsIcon
                    className='size-4 text-teal-500 dark:text-teal-400'
                    icon={Add01FreeIcons}
                  />
                  <span className='hidden font-medium text-muted-foreground text-xs group-hover:text-foreground lg:inline'>
                    Quick Actions
                  </span>
                  <div className='ml-auto hidden items-center gap-1 lg:flex'>
                    <span className='flex h-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground group-hover:border-foreground/20'>
                      <HugeiconsIcon className='mr-0.5 size-2.5' icon={CommandIcon} />K
                    </span>
                  </div>
                </button>
              }
            />

            <div className='mx-1 h-4 w-px bg-border' />

            {!isMounted ? (
              <Skeleton className='size-7' />
            ) : (
              <button
                className='flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                onClick={toggleTheme}
                type='button'
              >
                <HugeiconsIcon className='size-4' icon={!isDark ? Moon02Icon : Sun01Icon} />
              </button>
            )}

            <Popover>
              <PopoverTrigger className='flex items-center gap-2 border border-transparent py-1 pr-2 pl-1 transition-colors hover:bg-accent hover:text-accent-foreground'>
                {!isMounted || !session.data?.user.name ? (
                  <span className='size-6 rounded-full bg-muted' />
                ) : (
                  <span className='flex size-6 items-center justify-center rounded-full border border-border bg-gradient-to-br from-neutral-700 to-neutral-800 font-medium text-[10px] text-white'>
                    <span>{session.data.user.name.charAt(0)}</span>
                  </span>
                )}
                <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
              </PopoverTrigger>
              <PopoverContent className='max-w-45 gap-0.5 p-2'>
                <Link
                  className='flex cursor-pointer items-center gap-2 p-2 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                  to='/profile'
                >
                  <HugeiconsIcon className='size-3.5' icon={User02Icon} />
                  Profile
                </Link>
                <Link
                  className='flex items-center gap-2 p-2 text-destructive text-xs transition-colors hover:bg-accent hover:text-destructive'
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
