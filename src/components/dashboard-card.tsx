import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Progress } from '@flux/ui/components/ui/progress'
import { cn } from '@flux/ui/lib/utils'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

interface Props {
  icon: IconSvgElement
  subtitle: string
  value: string
  progress: number
  color: 'teal' | 'blue' | 'red'
}

export default function DashboardCard({ icon, subtitle, value, progress, color }: Props) {
  return (
    <Card className='group h-43 w-full rounded-sm border border-transparent transition-all hover:border-neutral-300/50 hover:shadow-lg'>
      <CardHeader>
        <CardTitle>
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border',
              color === 'teal' && 'border-teal-500/20 bg-teal-500/10 text-teal-500',
              color === 'blue' && 'border-blue-500/20 bg-blue-500/10 text-blue-500',
              color === 'red' && 'border-red-500/20 bg-red-500/10 text-red-500'
            )}
          >
            <HugeiconsIcon className='size-5' icon={icon} />
          </div>
        </CardTitle>
        <CardAction>
          <HugeiconsIcon
            className='size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5'
            icon={ArrowUpRight01Icon}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className='mb-1 text-neutral-400 text-xs'>{subtitle}</p>
        <p className='font-jetbrains text-2xl'>{value}</p>
      </CardContent>
      <CardFooter className='w-full'>
        <Progress
          className={cn(
            'w-full',
            color === 'teal' && 'text-teal-500',
            color === 'blue' && 'text-blue-500',
            color === 'red' && 'text-red-500'
          )}
          value={progress}
        />
      </CardFooter>
    </Card>
  )
}
