import { Alert02Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

interface PreviewTableProps {
  data: Record<string, string>[]
  errors?: Map<number, string[]>
}

export default function PreviewTable({ data, errors }: PreviewTableProps) {
  if (data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center h-full'>
        <div className='size-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4'>
          <HugeiconsIcon icon={Alert02Icon} className='size-6 text-neutral-500' />
        </div>
        <p className='text-sm font-medium text-neutral-400'>No data to preview</p>
        <p className='text-xs text-neutral-500 mt-1'>Please check your CSV file content</p>
      </div>
    )
  }

  const headers = Object.keys(data[0])
  const displayData = data.slice(0, 50)

  return (
    <div className='relative h-full overflow-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent'>
      <table className='w-full border-collapse text-left'>
        <thead className='sticky top-0 z-20'>
          <tr className='bg-neutral-900 shadow-[0_1px_0_rgba(255,255,255,0.05)]'>
            <th className='w-10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500'>
              #
            </th>
            {headers.map((header) => (
              <th
                key={header}
                className='min-w-[140px] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500'
              >
                {header}
              </th>
            ))}
            <th className='sticky right-0 w-24 bg-neutral-900 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 shadow-[-1px_0_0_rgba(255,255,255,0.05)]'>
              Status
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-neutral-800/50'>
          {displayData.map((row, idx) => {
            const rowErrors = errors?.get(idx) ?? []
            const hasErrors = rowErrors.length > 0

            return (
              <tr
                key={`preview-row-${idx}`}
                className={cn(
                  'group transition-colors',
                  hasErrors ? 'bg-red-500/[0.02] hover:bg-red-500/[0.04]' : 'hover:bg-neutral-900/40'
                )}
              >
                <td className='px-4 py-2.5 text-[10px] font-medium text-neutral-500'>
                  {idx + 1}
                </td>
                {headers.map((header) => (
                  <td key={`${idx}-${header}`} className='px-4 py-2.5'>
                    <div
                      className='max-w-[200px] truncate text-xs text-neutral-300'
                      title={row[header]}
                    >
                      {row[header] || <span className='text-neutral-600'>—</span>}
                    </div>
                  </td>
                ))}
                <td className={cn(
                  'sticky right-0 px-4 py-2.5 shadow-[-1px_0_0_rgba(255,255,255,0.05)] transition-colors',
                  hasErrors ? 'bg-red-950/20 group-hover:bg-red-950/30' : 'bg-neutral-950/50 group-hover:bg-neutral-900/60'
                )}>
                  {hasErrors ? (
                    <div className='flex items-center gap-1.5 text-red-400' title={rowErrors.join(', ')}>
                      <HugeiconsIcon className='size-3.5' icon={Alert02Icon} />
                      <span className='text-[10px] font-bold uppercase tracking-tight'>Invalid</span>
                    </div>
                  ) : (
                    <div className='flex items-center gap-1.5 text-teal-500'>
                      <HugeiconsIcon className='size-3.5' icon={CheckmarkCircle02Icon} />
                      <span className='text-[10px] font-bold uppercase tracking-tight'>Ready</span>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {data.length > 50 && (
        <div className='sticky bottom-0 bg-neutral-900/90 backdrop-blur-sm border-t border-neutral-800 px-4 py-2 text-center'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-neutral-500'>
            Showing first 50 of {data.length} records
          </p>
        </div>
      )}
    </div>
  )
}
