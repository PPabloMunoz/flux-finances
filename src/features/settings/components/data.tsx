import { Download02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { exportUserDataAction } from '@/features/auth'

export default function DataSettings() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    const res = await exportUserDataAction()
    setIsExporting(false)

    if (!res.ok) {
      toast.error(res.error)
      return
    }

    console.log('[EXPORT] User data exported:', res.data)

    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flux-finances-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Data exported successfully.')
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5 text-primary' icon={Download02Icon} />
            Data & Backup
          </CardTitle>
          <CardDescription>Download and backup your financial data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <h4 className='font-medium text-sm'>Export All Data</h4>
              <p className='max-w-md text-muted-foreground text-xs leading-relaxed'>
                Download all your financial data including accounts, transactions, categories, and
                budgets. This will export all data in JSON format.
              </p>
            </div>
            <Button
              className='shrink-0'
              disabled={isExporting}
              onClick={handleExportData}
              variant='default'
            >
              <HugeiconsIcon className='mr-2 size-4' icon={Download02Icon} />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
