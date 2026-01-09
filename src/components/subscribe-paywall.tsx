import { authClient } from '@flux/auth/client'
import { Button } from '@flux/ui/components/ui/button'
import { Card } from '@flux/ui/components/ui/card'

export function SubscribePaywall() {
  const handleSubscribe = async () => {
    await authClient.checkout({ slug: 'cloud-pro-version' })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
      <Card className='w-full max-w-md border border-white/10 bg-neutral-900 p-8 text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-cyan-600'>
            <svg
              color='#ffffff'
              fill='none'
              height='32'
              stroke='currentColor'
              strokeWidth='1.5'
              viewBox='0 0 24 24'
              width='32'
              xmlns='http://www.w3.org/2000/svg'
            >
              <title>Flux Logo</title>
              <path d='M12 2V22M18.4167 8.14815C18.4167 5.85719 15.5438 4 12 4C8.45617 4 5.58333 5.85719 5.58333 8.14815C5.58333 10.4391 7.33333 11.7037 12 11.7037C16.6667 11.7037 19 12.8889 19 15.8519C19 18.8148 15.866 20 12 20C8.13401 20 5 18.1428 5 15.8519' />
            </svg>
          </div>
        </div>

        <h2 className='mb-2 font-semibold text-2xl text-white'>Subscribe to Flux Pro</h2>
        <p className='mb-6 text-neutral-400'>Get full access to all features for just €5/month</p>

        <div className='mb-6 rounded-lg bg-neutral-800/50 p-4'>
          <div className='font-bold text-3xl text-white'>
            €5<span className='font-normal text-lg text-neutral-400'>/month</span>
          </div>
          <div className='mt-1 text-neutral-500 text-sm'>Cancel anytime</div>
        </div>

        <div className='mb-6 space-y-3 text-left'>
          <div className='flex items-center gap-2 text-neutral-300 text-sm'>
            <svg
              className='h-4 w-4 text-teal-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <title>Checkmark Icon</title>
              <path
                d='M5 13l4 4L19 7'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
              />
            </svg>
            Unlimited accounts & transactions
          </div>
          <div className='flex items-center gap-2 text-neutral-300 text-sm'>
            <svg
              className='h-4 w-4 text-teal-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <title>Checkmark Icon</title>
              <path
                d='M5 13l4 4L19 7'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
              />
            </svg>
            Advanced reporting & charts
          </div>
          <div className='flex items-center gap-2 text-neutral-300 text-sm'>
            <svg
              className='h-4 w-4 text-teal-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <title>Checkmark Icon</title>
              <path
                d='M5 13l4 4L19 7'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
              />
            </svg>
            Priority support
          </div>
        </div>

        <Button
          className='w-full bg-white text-black hover:bg-neutral-200'
          onClick={handleSubscribe}
          size='lg'
        >
          Subscribe Now
        </Button>

        <p className='mt-4 text-neutral-500 text-xs'>Secured by Polar.sh</p>
      </Card>
    </div>
  )
}
