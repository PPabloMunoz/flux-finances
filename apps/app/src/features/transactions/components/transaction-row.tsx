import { Button } from '@flux/ui/components/ui/button'
import { CreditCardIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function TransactionRow() {
  return (
    <tr className='group cursor-default transition-colors hover:bg-neutral-900/60'>
      <td className='whitespace-nowrap px-4 py-3 text-neutral-400'>Oct 23, 2023</td>
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-white text-black'>
            <span
              className='iconify'
              data-icon='lucide:github'
              data-stroke-width='1.5'
              data-width='16'
            />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-white'>Github Copilot</span>
          </div>
        </div>
      </td>
      <td className='px-4 py-3'>
        <div className='inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-medium text-[10px] text-neutral-400'>
          <div className='mr-1.5 h-1.5 w-1.5 rounded-full bg-purple-500' />
          Development
        </div>
      </td>
      <td className='px-4 py-3 text-neutral-400'>
        <div className='flex items-center gap-1.5'>
          <HugeiconsIcon className='size-3' icon={CreditCardIcon} />
          Visa Debit
        </div>
      </td>
      <td className='px-4 py-3 text-right font-medium text-white'>-$10.00</td>
      <td className='px-4 py-3 text-right'>
        <Button className='p-2' variant='ghost'>
          <HugeiconsIcon className='size-4' icon={PencilEdit02Icon} />
        </Button>
      </td>
    </tr>
  )
}
