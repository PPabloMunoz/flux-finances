import { HomeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFoundPage() {
  return (
    <div className='container mx-auto flex min-h-[50vh] items-center justify-center px-5 py-10'>
      <Card className='w-full max-w-md rounded-sm border-white/10 bg-white/5 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-muted-foreground text-xl'>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            The page you are looking for does not exist or has been moved.
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
