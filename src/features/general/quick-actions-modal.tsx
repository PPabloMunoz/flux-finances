import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import {
  ArrowRight01Icon,
  CreditCardIcon,
  Target01Icon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { newAccountDialogHandle } from '../accounts/components/new-account-modal'
import { newBudgetDialogHandle } from '../budgets/components/new-budget-modal'
import { newTransferModalHandle } from '../transactions'
import { newTransactionModalHandle } from '../transactions/components/new-transaction-modal'

export const quickActionsDialogHandle = BaseUIDialog.createHandle()

export default function QuickActionsModal() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (!quickActionsDialogHandle.isOpen) {
          quickActionsDialogHandle.open(null)
        }
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <Dialog handle={quickActionsDialogHandle}>
      <DialogContent className='w-full max-w-xl! px-5'>
        <DialogHeader>
          <DialogTitle>Quick Actions</DialogTitle>
        </DialogHeader>
        <div className='space-y-1'>
          <DialogTrigger
            handle={newTransactionModalHandle}
            render={
              <button
                className='group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                type='button'
              >
                <div className='flex items-center gap-3'>
                  <div className='rounded-md bg-muted p-2 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'>
                    <HugeiconsIcon icon={CreditCardIcon} size={18} />
                  </div>
                  <div>
                    <p className='font-medium text-foreground text-sm group-hover:text-accent-foreground'>
                      Add Transaction
                    </p>
                    <span className='text-muted-foreground/70 text-xs transition-colors group-hover:text-accent-foreground/70'>
                      Log a new income or expense
                    </span>
                  </div>
                </div>
              </button>
            }
          />

          <DialogTrigger
            handle={newAccountDialogHandle}
            payload={{ type: 'cash' }}
            render={
              <button
                className='group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                type='button'
              >
                <div className='flex items-center gap-3'>
                  <div className='rounded-md bg-muted p-2 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'>
                    <HugeiconsIcon icon={Wallet01Icon} size={18} />
                  </div>
                  <div>
                    <p className='font-medium text-foreground text-sm group-hover:text-accent-foreground'>
                      Create Account
                    </p>
                    <span className='text-muted-foreground/70 text-xs transition-colors group-hover:text-accent-foreground/70'>
                      Create a new account
                    </span>
                  </div>
                </div>
              </button>
            }
          />

          <DialogTrigger
            handle={newTransferModalHandle}
            render={
              <button
                className='group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                type='button'
              >
                <div className='flex items-center gap-3'>
                  <div className='rounded-md bg-muted p-2 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </div>
                  <div>
                    <p className='font-medium text-foreground text-sm group-hover:text-accent-foreground'>
                      New Transfer
                    </p>
                    <span className='text-muted-foreground/70 text-xs transition-colors group-hover:text-accent-foreground/70'>
                      Move money between accounts
                    </span>
                  </div>
                </div>
              </button>
            }
          />

          <DialogTrigger
            handle={newBudgetDialogHandle}
            render={
              <button
                className='group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                type='button'
              >
                <div className='flex items-center gap-3'>
                  <div className='rounded-md bg-muted p-2 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'>
                    <HugeiconsIcon icon={Target01Icon} size={18} />
                  </div>
                  <div>
                    <p className='font-medium text-foreground text-sm group-hover:text-accent-foreground'>
                      Create Budget
                    </p>
                    <span className='text-muted-foreground/70 text-xs transition-colors group-hover:text-accent-foreground/70'>
                      Set up a new budget
                    </span>
                  </div>
                </div>
              </button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
