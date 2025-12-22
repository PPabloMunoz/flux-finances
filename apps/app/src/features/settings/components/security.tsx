import { Badge } from '@flux/ui/components/ui/badge'
import { Button } from '@flux/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Switch } from '@flux/ui/components/ui/switch'
import { Shield01Icon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function SecuritySettings() {
  return (
    <div className='space-y-6'>
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={SmartPhone01Icon} />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border border-border bg-card p-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <p className='font-medium'>Authenticator App</p>
                <Badge className='bg-muted text-muted-foreground' variant='secondary'>
                  Disabled
                </Badge>
              </div>
              <p className='mt-1 text-muted-foreground text-sm'>
                Use an authentication app to generate verification codes
              </p>
            </div>
            <Switch />
          </div>

          <div>
            <h4 className='mb-2 font-medium text-sm'>Backup Codes</h4>
            <p className='text-muted-foreground text-sm'>
              Generate backup codes to access your account if you lose access to your authentication
              device.
            </p>
            <Button className='mt-3 bg-transparent' size='sm' variant='outline'>
              Generate Backup Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Shield01Icon} />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage devices where you&apos;re currently signed in</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex items-start justify-between rounded-lg border border-border bg-card p-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <p className='font-medium'>MacBook Pro - Chrome</p>
                  <Badge className='bg-primary/10 text-primary' variant='secondary'>
                    Current
                  </Badge>
                </div>
                <p className='mt-1 text-muted-foreground text-sm'>
                  San Francisco, CA • Last active now
                </p>
              </div>
            </div>

            <div className='flex items-start justify-between rounded-lg border border-border bg-card p-4'>
              <div className='flex-1'>
                <p className='font-medium'>iPhone 14 - Safari</p>
                <p className='mt-1 text-muted-foreground text-sm'>
                  San Francisco, CA • Last active 2 hours ago
                </p>
              </div>
              <Button className='text-destructive hover:text-destructive' size='sm' variant='ghost'>
                Revoke
              </Button>
            </div>
          </div>

          <Button className='w-full bg-transparent' variant='outline'>
            Sign Out All Other Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
