import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Database01Icon,
  FolderOpenIcon,
  Table01Icon,
  Upload02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { previewImportAction, processImportAction } from '../actions/import'
import { parseCsv } from '../lib/csv'
import type { ImportType } from '../types'
import PreviewTable from './preview-table'

export const importDialogHandle = BaseUIDialog.createHandle()

type ImportStep = 'select' | 'upload' | 'preview'

const importTypes: {
  value: ImportType
  label: string
  description: string
  icon: typeof Database01Icon
}[] = [
  {
    value: 'categories',
    label: 'Categories',
    description: 'Import your budget categories and organizational structure',
    icon: FolderOpenIcon,
  },
  {
    value: 'accounts',
    label: 'Accounts',
    description: 'Import bank accounts, wallets, and initial balances',
    icon: Database01Icon,
  },
  {
    value: 'transactions',
    label: 'Transactions',
    description: 'Import transaction history from CSV bank statements',
    icon: Table01Icon,
  },
]

const STEPS: { id: ImportStep; label: string }[] = [
  { id: 'select', label: 'Select' },
  { id: 'upload', label: 'Upload' },
  { id: 'preview', label: 'Preview' },
]

export default function ImportModal() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<ImportStep>('select')
  const [importType, setImportType] = useState<ImportType>('transactions')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([])
  const [previewErrors, setPreviewErrors] = useState<Map<number, string[]>>(new Map())
  const [canImport, setCanImport] = useState(false)

  const previewMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await previewImportAction({ data: { type: importType, csvContent: content } })
      return res
    },
    onSuccess: (res) => {
      if (!res.ok || !res.data) {
        toast.error(res.error ?? 'Failed to preview')
        return
      }

      const data = res.data
      setCanImport(data.canImport)

      const parsed = parseCsv(csvContent)
      setPreviewData(parsed)

      const errors = new Map<number, string[]>()
      for (const err of data.errors) {
        const existing = errors.get(err.row - 1) ?? []
        existing.push(err.message)
        errors.set(err.row - 1, existing)
      }
      setPreviewErrors(errors)

      if (data.canImport || data.errors.length > 0) {
        setStep('preview')
      } else {
        toast.error('The file appears to be empty or invalid')
      }
    },
  })

  const importMutation = useMutation({
    mutationFn: async () => {
      const rows = previewData.map((row, idx) => ({
        rowIndex: idx,
        isValid: !previewErrors.has(idx),
        data: row,
        errors: previewErrors.get(idx) ?? [],
      }))

      const res = await processImportAction({ data: { type: importType, rows } })
      return res
    },
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error ?? 'Import failed')
        return
      }

      toast.success(`Successfully imported ${res.data.imported} records`)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      resetAndClose()
    },
  })

  const resetAndClose = () => {
    setStep('select')
    setCsvFile(null)
    setCsvContent('')
    setPreviewData([])
    setPreviewErrors(new Map())
    importDialogHandle.close()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setCsvFile(file)
    const content = await file.text()
    setCsvContent(content)
    previewMutation.mutate(content)
  }

  const handleConfirmImport = () => {
    importMutation.mutate()
  }

  const validCount = previewData.length - previewErrors.size
  const currentStepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <Dialog handle={importDialogHandle}>
      <DialogContent className='flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
        <div className='border-neutral-800/50 border-b bg-neutral-900/20 p-6 pb-4'>
          <div className='mb-6 flex items-center gap-6'>
            {STEPS.map((s, idx) => {
              const isActive = step === s.id
              const isCompleted = currentStepIndex > idx
              return (
                <div className='flex items-center gap-2.5' key={s.id}>
                  <div
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full border font-bold text-[10px] transition-all',
                      isActive
                        ? 'border-teal-500 bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                        : isCompleted
                          ? 'border-teal-500/50 bg-teal-500/10 text-teal-500'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-500'
                    )}
                  >
                    {isCompleted ? (
                      <HugeiconsIcon className='size-3' icon={CheckmarkCircle02Icon} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      'font-bold text-[10px] uppercase tracking-widest',
                      isActive ? 'text-neutral-100' : 'text-neutral-500'
                    )}
                  >
                    {s.label}
                  </span>
                  {idx < STEPS.length - 1 && <div className='ml-1 h-px w-6 bg-neutral-800' />}
                </div>
              )
            })}
          </div>

          <DialogHeader className='gap-1'>
            <DialogTitle className='text-lg'>
              {step === 'select' && 'Import Data'}
              {step === 'upload' && `Upload ${importType}`}
              {step === 'preview' && 'Review Data'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              {step === 'select' && 'What type of information are you bringing into Flux?'}
              {step === 'upload' && `Select a .csv file containing your ${importType}.`}
              {step === 'preview' && 'Check the records below for accuracy before importing.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='min-h-[340px] flex-1 overflow-y-auto p-6'>
          {step === 'select' && (
            <div className='grid gap-3'>
              {importTypes.map((type) => (
                <button
                  className={cn(
                    'group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all',
                    importType === type.value
                      ? 'border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20'
                      : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                  )}
                  key={type.value}
                  onClick={() => setImportType(type.value)}
                  type='button'
                >
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
                      importType === type.value
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
                  {importType === type.value && (
                    <div className='absolute top-1/2 right-4 -translate-y-1/2'>
                      <div className='size-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]' />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 'upload' && (
            <div className='flex h-full flex-col items-center justify-center py-4'>
              <div className='w-full max-w-md'>
                <label
                  className={cn(
                    'group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-all',
                    previewMutation.isPending
                      ? 'pointer-events-none border-neutral-800 opacity-50'
                      : 'border-neutral-800 hover:border-teal-500/40 hover:bg-teal-500/5'
                  )}
                  htmlFor='csv-upload'
                >
                  <input
                    accept='.csv'
                    className='hidden'
                    disabled={previewMutation.isPending}
                    id='csv-upload'
                    onChange={handleFileChange}
                    type='file'
                  />
                  <div className='flex size-14 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 transition-all group-hover:scale-110 group-hover:border-teal-500/50'>
                    <HugeiconsIcon
                      className='size-6 text-neutral-400 group-hover:text-teal-400'
                      icon={Upload02Icon}
                    />
                  </div>
                  <div className='space-y-1'>
                    <p className='font-medium text-neutral-200 text-sm'>
                      {csvFile ? csvFile.name : 'Click to select CSV'}
                    </p>
                    <p className='text-[10px] text-neutral-500 uppercase tracking-tight'>
                      Drag and drop also supported
                    </p>
                  </div>
                </label>

                {previewMutation.isPending && (
                  <div className='mt-8 flex flex-col items-center gap-3'>
                    <div className='size-4 animate-spin rounded-full border-2 border-teal-500/20 border-t-teal-500' />
                    <span className='font-bold text-[10px] text-neutral-500 uppercase tracking-widest'>
                      Processing records...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className='flex h-full min-w-0 flex-col space-y-4'>
              <div className='grid shrink-0 grid-cols-3 gap-3'>
                <div className='rounded-xl border border-neutral-800 bg-neutral-900/30 p-3'>
                  <div className='mb-1 font-bold text-[9px] text-neutral-500 uppercase tracking-widest'>
                    Total Rows
                  </div>
                  <div className='font-semibold text-neutral-200 text-xl'>{previewData.length}</div>
                </div>
                <div className='rounded-xl border border-green-500/10 bg-green-500/5 p-3'>
                  <div className='mb-1 font-bold text-[9px] text-green-500/60 uppercase tracking-widest'>
                    Valid
                  </div>
                  <div className='font-semibold text-green-400 text-xl'>{validCount}</div>
                </div>
                <div className='rounded-xl border border-red-500/10 bg-red-500/5 p-3'>
                  <div className='mb-1 font-bold text-[9px] text-red-500/60 uppercase tracking-widest'>
                    Invalid
                  </div>
                  <div className='font-semibold text-red-400 text-xl'>{previewErrors.size}</div>
                </div>
              </div>

              <div className='min-w-0 flex-1 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950'>
                <PreviewTable data={previewData} errors={previewErrors} />
              </div>

              {previewErrors.size > 0 && (
                <div className='flex items-start gap-2 rounded-lg border border-red-500/10 bg-red-500/5 p-3'>
                  <div className='mt-1 size-1.5 shrink-0 rounded-full bg-red-500' />
                  <p className='text-[10px] text-red-400/80 leading-relaxed'>
                    <span className='mr-1 font-bold uppercase'>Warning:</span>
                    {previewErrors.size} rows have formatting issues and will be skipped. Correct
                    your CSV and re-upload if these rows are required.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='flex gap-3 border-neutral-800 border-t bg-neutral-900/20 p-4'>
          {step !== 'select' && (
            <Button
              className='h-9 px-4 font-bold text-xs uppercase tracking-wider'
              onClick={() => setStep(step === 'preview' ? 'upload' : 'select')}
              variant='outline'
            >
              <HugeiconsIcon className='mr-1' icon={ArrowLeft01Icon} size={14} />
              Back
            </Button>
          )}

          {step === 'select' && (
            <Button
              className='h-9 flex-1 bg-teal-600 font-bold text-white text-xs uppercase tracking-wider hover:bg-teal-500'
              disabled={!importType}
              onClick={() => setStep('upload')}
            >
              Continue to Upload
            </Button>
          )}

          {step === 'upload' && (
            <Button
              className='h-9 flex-1 bg-teal-600 font-bold text-white text-xs uppercase tracking-wider hover:bg-teal-500'
              disabled={!csvFile || previewMutation.isPending}
              onClick={() => previewMutation.mutate(csvContent)}
            >
              {previewMutation.isPending ? 'Processing...' : 'Review Records'}
            </Button>
          )}

          {step === 'preview' && (
            <Button
              className='h-9 flex-1 bg-teal-600 font-bold text-white text-xs uppercase tracking-wider hover:bg-teal-500'
              disabled={!canImport || importMutation.isPending}
              onClick={handleConfirmImport}
            >
              {importMutation.isPending ? 'Importing...' : `Complete Import (${validCount})`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
