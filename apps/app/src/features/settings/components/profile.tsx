import { Button } from '@flux/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Input } from '@flux/ui/components/ui/input'
import { Label } from '@flux/ui/components/ui/label'
import { Alert02Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function ProfileSettings() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              className='bg-muted'
              defaultValue='john.doe@example.com'
              disabled
              id='email'
              type='email'
            />
            <p className='text-muted-foreground text-xs'>Email address cannot be changed</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input defaultValue='John Doe' id='name' placeholder='John Doe' />
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline'>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={UserGroupIcon} />
            Household Settings
          </CardTitle>
          <CardDescription>Manage shared account and household members</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='householdName'>Household Name</Label>
            <Input defaultValue='The Doe Family' id='householdName' placeholder='The Doe Family' />
          </div>

          <div className='border border-border bg-muted/50 p-4'>
            <h4 className='mb-3 font-medium text-sm'>Household Members</h4>
            <div className='space-y-2'>
              <div className='flex items-center justify-between rounded-md bg-card px-3 py-2'>
                <div>
                  <p className='font-medium text-sm'>John Doe</p>
                  <p className='text-muted-foreground text-xs'>john.doe@example.com • Admin</p>
                </div>
              </div>
              <div className='flex items-center justify-between rounded-md bg-card px-3 py-2'>
                <div>
                  <p className='font-medium text-sm'>Jane Doe</p>
                  <p className='text-muted-foreground text-xs'>jane.doe@example.com • Member</p>
                </div>
                <Button className='text-muted-foreground' size='sm' variant='ghost'>
                  Remove
                </Button>
              </div>
            </div>
            <Button className='mt-3 w-full bg-transparent' size='sm' variant='outline'>
              Invite Member
            </Button>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline'>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className='border-destructive/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <HugeiconsIcon className='size-5' icon={Alert02Icon} />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='border border-destructive/50 bg-destructive/5 p-4'>
            <h4 className='font-medium text-destructive'>Delete Account</h4>
            <p className='mt-1 text-muted-foreground text-sm'>
              Once you delete your account, there is no going back. All your data, transactions, and
              settings will be permanently removed.
            </p>
            <Button className='mt-3' size='sm' variant='destructive'>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
