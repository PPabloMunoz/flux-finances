import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@flux/ui/components/ui/dialog'
import {
  ArrowRight01Icon,
  CreditCardIcon,
  Target01Icon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

export const quickActionsDialog = BaseUIDialog.createHandle()

type ACTIONS_ID = 'add-transaction' | 'create-account' | 'new-transfer' | 'create-goal'

interface ActionOption {
  id: ACTIONS_ID
  icon: IconSvgElement
  label: string
  desc: string
}

const ACTIONS: ActionOption[] = [
  {
    id: 'add-transaction',
    icon: CreditCardIcon,
    label: 'Add Transaction',
    desc: 'Log a new income or expense',
  },
  {
    id: 'create-account',
    icon: Wallet01Icon,
    label: 'Create Account',
    desc: 'Link a new bank feed',
  },
  {
    id: 'new-transfer',
    icon: ArrowRight01Icon,
    label: 'New Transfer',
    desc: 'Move money between accounts',
  },
  {
    id: 'create-goal',
    icon: Target01Icon,
    label: 'Create Goal',
    desc: 'Set a new saving target',
  },
]

export default function QuickActionsModal() {
  return (
    <Dialog handle={quickActionsDialog}>
      <DialogContent className='w-full max-w-xl! px-5'>
        <DialogHeader>
          <DialogTitle>Quick Actions</DialogTitle>
        </DialogHeader>
        <div className='space-y-1'>
          {ACTIONS.map((action) => {
            return (
              <button
                className='group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-sm'
                key={action.id}
                onClick={() => {
                  console.log(`Clicked: ${action.label}`)
                  quickActionsDialog.close()
                }}
                type='button'
              >
                <div className='flex items-center gap-3'>
                  <div className='rounded-md bg-neutral-800 p-2 text-neutral-500 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-300'>
                    <HugeiconsIcon icon={action.icon} size={18} />
                  </div>
                  <div>
                    <div className='font-medium text-sm'>{action.label}</div>
                    <div className='text-neutral-600 text-xs transition-colors group-hover:text-neutral-400'>
                      {action.desc}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
