import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import {
  Database01Icon,
  Download02Icon,
  FolderOpenIcon,
  Table01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  exportAccountsAction,
  exportCategoriesAction,
  exportTransactionsAction,
} from '../actions/export'
import { downloadCsv } from '../lib/csv'
import type { ImportType } from '../types'

export const exportDialogHandle = BaseUIDialog.createHandle()

const exportTypes: {
  value: ImportType
  label: string
  description: string
  icon: typeof Database01Icon
}[] = [
  {
    value: 'categories',
    label: 'Categories',
    description: 'Export your budget categories and organizational structure',
    icon: FolderOpenIcon,
  },
  {
    value: 'accounts',
    label: 'Accounts',
    description: 'Export bank accounts, wallets, and initial balances',
    icon: Database01Icon,
  },
  {
    value: 'transactions',
    label: 'Transactions',
    description: 'Export your full transaction history for auditing',
    icon: Table01Icon,
  },
]

export default function ExportModal() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<ImportType>('transactions')

  const handleExport = async () => {
    setIsLoading(true)

    let res: { ok: boolean; data?: { csv: string; fileName: string }; error?: string } | undefined

    switch (selectedType) {
      case 'categories':
        res = await exportCategoriesAction()
        break
      case 'accounts':
        res = await exportAccountsAction()
        break
      case 'transactions':
        res = await exportTransactionsAction()
        break
    }

    setIsLoading(false)

    if (!res || !res.ok || !res.data) {
      toast.error(res?.error ?? 'Failed to export')
      return
    }

    downloadCsv(res.data.csv, res.data.fileName)
    toast.success('Export downloaded successfully')
    exportDialogHandle.close()
  }

  return (
    <Dialog handle={exportDialogHandle}>
      <DialogContent className='flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl'>
        <div className='border-neutral-800/50 border-b bg-neutral-900/20 p-6 pb-4'>
          <div className='mb-4 flex items-center gap-2.5'>
            <div className='flex size-5 items-center justify-center rounded-full border border-teal-500/50 bg-teal-500/10 text-teal-500'>
              <HugeiconsIcon className='size-3' icon={Download02Icon} />
            </div>
            <span className='font-bold text-[10px] text-neutral-100 uppercase tracking-widest'>
              Data Export
            </span>
          </div>

          <DialogHeader className='gap-1'>
            <DialogTitle className='text-lg'>Export Data</DialogTitle>
            <DialogDescription className='text-xs'>
              Choose which information you would like to download as a CSV file.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='p-6 py-8'>
          <div className='grid gap-3'>
            {exportTypes.map((type) => (
              <button
                className={cn(
                  'group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all',
                  selectedType === type.value
                    ? 'border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20'
                    : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                )}
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                type='button'
              >
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    selectedType === type.value
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 group-hover:border-neutral-700'
                  )}
                >
                  <HugeiconsIcon icon={type.icon} size={20} />
                </div>
                <div className='flex-1 pr-6'>
                  <div className='font-semibold text-neutral-200 text-sm'>{type.label}</div>
                  <div className='mt-1 text-neutral-500 text-xs leading-relaxed'>
                    {type.description}
                  </div>
                </div>
                {selectedType === type.value && (
                  <div className='absolute top-1/2 right-4 -translate-y-1/2'>
                    <div className='size-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]' />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className='border-neutral-800 border-t bg-neutral-900/20 p-4'>
          <Button
            className='h-10 w-full bg-teal-600 font-bold text-white text-xs uppercase tracking-wider hover:bg-teal-500'
            disabled={isLoading}
            onClick={handleExport}
          >
            <HugeiconsIcon className='mr-2' icon={Download02Icon} size={16} />
            {isLoading ? 'Preparing Export...' : `Download ${selectedType} CSV`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
