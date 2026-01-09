import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import {
  Download02Icon,
  Database01Icon,
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
      <DialogContent className='sm:max-w-xl w-full flex flex-col gap-0 p-0 overflow-hidden'>
        <div className='p-6 pb-4 border-b border-neutral-800/50 bg-neutral-900/20'>
          <div className='flex items-center gap-2.5 mb-4'>
            <div className='size-5 rounded-full flex items-center justify-center bg-teal-500/10 border border-teal-500/50 text-teal-500'>
              <HugeiconsIcon icon={Download02Icon} className='size-3' />
            </div>
            <span className='text-[10px] font-bold uppercase tracking-widest text-neutral-100'>
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
                key={type.value}
                className={cn(
                  'group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all',
                  selectedType === type.value
                    ? 'border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20'
                    : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                )}
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
                  <div className='text-sm font-semibold text-neutral-200'>{type.label}</div>
                  <div className='text-xs text-neutral-500 leading-relaxed mt-1'>
                    {type.description}
                  </div>
                </div>
                {selectedType === type.value && (
                  <div className='absolute right-4 top-1/2 -translate-y-1/2'>
                    <div className='size-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]' />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className='p-4 border-t border-neutral-800 bg-neutral-900/20'>
          <Button
            className='w-full h-10 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider'
            disabled={isLoading}
            onClick={handleExport}
          >
            <HugeiconsIcon icon={Download02Icon} className='mr-2' size={16} />
            {isLoading ? 'Preparing Export...' : `Download ${selectedType} CSV`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
