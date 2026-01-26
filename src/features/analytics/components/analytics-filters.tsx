import { Calendar01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface AnalyticsFiltersProps {
  value: '30d' | '90d' | '6m' | '1y'
  onChange: (value: '30d' | '90d' | '6m' | '1y') => void
}

const options: { value: '30d' | '90d' | '6m' | '1y'; label: string }[] = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
]

export function AnalyticsFilters({ value, onChange }: AnalyticsFiltersProps) {
  const currentLabel = options.find((o) => o.value === value)?.label ?? 'Select'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2 rounded-md border border-border border-dashed px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <HugeiconsIcon className='size-3.5' icon={Calendar01Icon} />
        {currentLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
