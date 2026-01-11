import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { authClient } from '@/lib/auth/client'

export function SubscribePaywall() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)
    await authClient.checkout({ slug: 'cloud-pro-version' })
    setIsLoading(false)
  }

  return (
    <div className='fixed inset-0 z-46 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
      <Card className='w-full max-w-md border border-white/10 bg-neutral-900 p-8 text-center'>
        <div className='mb-3 flex justify-center'>
          <img alt='Flux Finances Logo' className='size-15' src='/favicon.svg' />
        </div>

        <h2 className='mb-2 font-semibold text-2xl text-white'>Subscribe to Flux Pro</h2>
        <div className='mb-6 rounded-lg bg-neutral-800/50 p-4'>
          <div className='font-bold text-3xl text-white'>
            $5<span className='font-normal text-lg text-neutral-400'>/month</span>
          </div>
          <div className='mt-1 text-neutral-500 text-sm'>Cancel anytime</div>
        </div>

        <Button
          className='w-full bg-white text-black hover:bg-neutral-200'
          disabled={isLoading}
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
