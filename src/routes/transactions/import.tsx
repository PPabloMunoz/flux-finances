import { ArrowLeft01Icon, Upload01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import AppHeader from '@/components/header'
import { Button } from '@/components/ui/button'
import { authStateFn } from '@/features/auth'
import { importTransactionsAction } from '@/features/transactions'

export const Route = createFileRoute('/transactions/import')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

function RouteComponent() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [isImporting, setIsImporting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const lines = content.split('\n').filter((line) => line.trim())
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
        const data = lines
          .slice(1, 6)
          .map((line) => line.split(',').map((v) => v.trim().replace(/^"|"$/g, '')))
        setPreview([headers, ...data])
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setIsImporting(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const content = event.target?.result as string

        const res = await importTransactionsAction({ data: { csv: content } })

        if (res.ok && res.data) {
          toast.success(`Imported ${res.data.success} transactions. ${res.data.skipped} skipped.`)
          if (res.data.errors.length > 0) {
            toast.error(
              `Errors: ${res.data.errors.slice(0, 3).join(', ')}${
                res.data.errors.length > 3 ? '...' : ''
              }`
            )
          }
          navigate({ to: '/transactions' })
        } else {
          console.error(res.error)
          toast.error(res.error || 'Failed to import transactions')
        }
        setIsImporting(false)
      }
      reader.readAsText(file)
    } catch {
      toast.error('An error occurred while importing')
      setIsImporting(false)
    }
  }

  return (
    <>
      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <header className='mb-8 flex items-center gap-4'>
          <Button
            className='shrink-0'
            onClick={() => navigate({ to: '/transactions' })}
            variant='outline'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
            Back
          </Button>
          <div>
            <h1 className='mb-1 font-medium text-2xl tracking-tight'>Import Transactions</h1>
            <p className='text-muted-foreground text-sm'>
              Upload a CSV file to import transactions
            </p>
          </div>
        </header>

        <div className='rounded-lg border border-border bg-card p-6'>
          <div className='mb-6'>
            <h2 className='mb-2 font-medium'>Upload CSV File</h2>
            <p className='text-muted-foreground text-sm'>
              Supported columns: id, account_id, category_id, date, amount, type, title,
              description, created_at
            </p>
          </div>

          <div className='mb-6'>
            <label
              className='flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border border-dashed bg-muted/50 px-8 py-12 transition-colors hover:bg-muted'
              htmlFor='file-upload'
            >
              <HugeiconsIcon className='mb-3 text-muted-foreground' icon={Upload01Icon} size={32} />
              <span className='mb-2 font-medium text-sm'>
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              <span className='text-muted-foreground text-xs'>CSV files only</span>
              <input
                accept='.csv'
                className='hidden'
                id='file-upload'
                onChange={handleFileChange}
                type='file'
              />
            </label>
          </div>

          {preview.length > 0 && (
            <div className='mb-6'>
              <h3 className='mb-2 font-medium text-sm'>Preview (first 5 rows)</h3>
              <div className='overflow-x-auto rounded-lg border border-border bg-muted/30'>
                <table className='w-full text-left text-xs'>
                  <thead className='bg-muted/50 text-muted-foreground uppercase'>
                    <tr>
                      {preview[0].map((header) => (
                        <th className='px-4 py-2 font-medium' key={`header-${header}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {preview.slice(1).map((row, rowIndex) => (
                      <tr key={`row-${row[0]}`}>
                        {row.map((cell) => (
                          <td className='px-4 py-2' key={`cell-${rowIndex}-${cell}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className='flex gap-3'>
            <Button disabled={!file || isImporting} onClick={handleImport}>
              {isImporting ? 'Importing...' : 'Import Transactions'}
            </Button>
            <Button
              disabled={isImporting}
              onClick={() => navigate({ to: '/transactions' })}
              variant='outline'
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
