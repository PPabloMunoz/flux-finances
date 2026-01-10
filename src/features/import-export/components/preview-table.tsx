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
      <div className='flex h-full flex-col items-center justify-center py-12 text-center'>
        <div className='mb-4 flex size-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900'>
          <HugeiconsIcon className='size-6 text-neutral-500' icon={Alert02Icon} />
        </div>
        <p className='font-medium text-neutral-400 text-sm'>No data to preview</p>
        <p className='mt-1 text-neutral-500 text-xs'>Please check your CSV file content</p>
      </div>
    )
  }

  const headers = Object.keys(data[0])
  const displayData = data.slice(0, 50)

  return (
    <div className='scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent relative h-full overflow-auto'>
      <table className='w-full border-collapse text-left'>
        <thead className='sticky top-0 z-20'>
          <tr className='bg-neutral-900 shadow-[0_1px_0_rgba(255,255,255,0.05)]'>
            <th className='w-10 px-4 py-3 font-bold text-[10px] text-neutral-500 uppercase tracking-widest'>
              #
            </th>
            {headers.map((header) => (
              <th
                className='min-w-[140px] px-4 py-3 font-bold text-[10px] text-neutral-500 uppercase tracking-widest'
                key={header}
              >
                {header}
              </th>
            ))}
            <th className='sticky right-0 w-24 bg-neutral-900 px-4 py-3 font-bold text-[10px] text-neutral-500 uppercase tracking-widest shadow-[-1px_0_0_rgba(255,255,255,0.05)]'>
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
                className={cn(
                  'group transition-colors',
                  hasErrors
                    ? 'bg-red-500/[0.02] hover:bg-red-500/[0.04]'
                    : 'hover:bg-neutral-900/40'
                )}
                key={`preview-row-${row}`}
              >
                <td className='px-4 py-2.5 font-medium text-[10px] text-neutral-500'>{idx + 1}</td>
                {headers.map((header) => (
                  <td className='px-4 py-2.5' key={`${idx}-${header}`}>
                    <div
                      className='max-w-[200px] truncate text-neutral-300 text-xs'
                      title={row[header]}
                    >
                      {row[header] || <span className='text-neutral-600'>—</span>}
                    </div>
                  </td>
                ))}
                <td
                  className={cn(
                    'sticky right-0 px-4 py-2.5 shadow-[-1px_0_0_rgba(255,255,255,0.05)] transition-colors',
                    hasErrors
                      ? 'bg-red-950/20 group-hover:bg-red-950/30'
                      : 'bg-neutral-950/50 group-hover:bg-neutral-900/60'
                  )}
                >
                  {hasErrors ? (
                    <div
                      className='flex items-center gap-1.5 text-red-400'
                      title={rowErrors.join(', ')}
                    >
                      <HugeiconsIcon className='size-3.5' icon={Alert02Icon} />
                      <span className='font-bold text-[10px] uppercase tracking-tight'>
                        Invalid
                      </span>
                    </div>
                  ) : (
                    <div className='flex items-center gap-1.5 text-teal-500'>
                      <HugeiconsIcon className='size-3.5' icon={CheckmarkCircle02Icon} />
                      <span className='font-bold text-[10px] uppercase tracking-tight'>Ready</span>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {data.length > 50 && (
        <div className='sticky bottom-0 border-neutral-800 border-t bg-neutral-900/90 px-4 py-2 text-center backdrop-blur-sm'>
          <p className='font-bold text-[10px] text-neutral-500 uppercase tracking-widest'>
            Showing first 50 of {data.length} records
          </p>
        </div>
      )}
    </div>
  )
}
