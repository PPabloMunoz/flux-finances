import { HomeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorPageProps {
  error: Error
}

export default function ErrorPage({ error }: ErrorPageProps) {
  return (
    <div className='container mx-auto flex min-h-[50vh] items-center justify-center px-5 py-10'>
      <Card className='w-full max-w-md rounded-sm border-white/10 bg-white/5 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-red-400 text-xl'>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </CardContent>
        <CardFooter>
          <Link to='/'>
            <Button className='gap-2' size='default' variant='default'>
              <HugeiconsIcon icon={HomeIcon} size={16} />
              Go Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
