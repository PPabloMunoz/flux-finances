import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { authStateFn } from '@/features/auth/queries'
import { IS_CLOUD } from '@/lib/constants'

const CheckoutSearchParamsSchema = z.object({
  checkout_id: z.string().catch(''),
})

export const Route = createFileRoute('/success')({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!IS_CLOUD) throw redirect({ to: '/' })
    return await authStateFn()
  },
  validateSearch: (searchParams) => CheckoutSearchParamsSchema.parse(searchParams),
})

function RouteComponent() {
  const { checkout_id: checkoutId } = Route.useSearch()
  if (!checkoutId) {
    redirect({ to: '/' })
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-neutral-950'>
      <div className='w-full max-w-md text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
            <svg
              color='#22c55e'
              fill='none'
              height='32'
              stroke='currentColor'
              strokeWidth='1.5'
              viewBox='0 0 24 24'
              width='32'
              xmlns='http://www.w3.org/2000/svg'
            >
              <title>Check Circle</title>
              <path d='M5 13l4 4L19 7' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </div>
        </div>

        <h1 className='mb-2 font-semibold text-2xl text-white'>Welcome to Flux Pro!</h1>
        <p className='mb-8 text-neutral-400'>
          Your subscription is now active. You have full access to all features.
        </p>

        <Link to='/'>
          <Button className='bg-white text-black hover:bg-neutral-200'>Go to Dashboard</Button>
        </Link>

        {checkoutId && <p className='mt-6 text-neutral-600 text-xs'>Order: {checkoutId}</p>}
      </div>
    </div>
  )
}
